import { useQuery } from "@tanstack/react-query";
import { ReportDetailResponse } from "@/types/reports";
import { useHomePageStore } from "@/store";

interface Category {
  category_id: number | string;
  language_id: number | string;
  category_name: string;
  title?: string;
  icon?: string;
  category_tagline?: string;
}

interface UseReportDetailParams {
  reportId: string;
  categoryId: string;
  languageId: string;
  onCategoryChange?: (newCategoryId: string) => void;
}

export function useReportDetail({
  reportId,
  categoryId,
  languageId,
  onCategoryChange
}: UseReportDetailParams) {
  const { HomePage } = useHomePageStore();

  return useQuery({
    queryKey: ["report-detail", reportId, categoryId, languageId],
    queryFn: async (): Promise<ReportDetailResponse> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      // 1. Try with the provided categoryId
      let response = await fetchReport(baseUrl, categoryId, languageId, reportId);
      if (isValidResponse(response)) return response!;

      // 2. Try iterating through all categories in the current language
      const allCategories = (HomePage?.report_store_dropdown || []) as Category[];
      const categoriesInLanguage = allCategories.filter(
        (cat) => String(cat.language_id) === String(languageId)
      );

      for (const cat of categoriesInLanguage) {
        // Skip the one we already tried
        if (String(cat.category_id) === String(categoryId)) continue;

        console.log(`Trying category: ${cat.category_name} (${cat.category_id})`);
        response = await fetchReport(baseUrl, String(cat.category_id), languageId, reportId);

        if (isValidResponse(response)) {
          // Found it! Update the category if needed
          if (onCategoryChange) {
            // Use setTimeout to avoid React state update during render
            setTimeout(() => onCategoryChange(String(cat.category_id)));
          }
          return response!;
        }
      }

      throw new Error("Report not found in any category");
    },
    enabled: !!reportId && !!categoryId && !!languageId && !!HomePage?.report_store_dropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // We handle retries manually
  });
}

function isValidResponse(response: ReportDetailResponse | null): boolean {
  return !!response && !!response.data && !!response.data.report;
}

// Helper function to fetch the report
async function fetchReport(
  baseUrl: string,
  categoryId: string,
  languageId: string,
  reportId: string
): Promise<ReportDetailResponse | null> {
  const url = `${baseUrl}reports_store`;

  const formData = new FormData();
  formData.append('category_id', categoryId);
  formData.append('language_id', languageId);
  formData.append('report_id', reportId);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // If 404 or other error, return null to trigger retry
      return null;
    }

    const data = await response.json();

    // Check if data actually contains the report
    if (!data || !data.data || !data.data.report) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}