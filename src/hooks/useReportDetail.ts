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

      // Get all categories from the homepage data
      const allCategories = (HomePage?.report_store_dropdown || []) as Category[];
      
      // Find the current category
      const currentCategory = allCategories.find(
        (cat: Category) => 
          String(cat.category_id) === String(categoryId) && 
          String(cat.language_id) === String(languageId)
      );

      // If current category not found, find the equivalent in the new language
      if (!currentCategory) {
        // Find the original category (in any language) to get its name
        const originalCategory = allCategories.find(
          (cat: Category) => String(cat.category_id) === String(categoryId)
        );

        if (originalCategory) {
          // Find equivalent category in the target language
          const equivalentCategory = allCategories.find(
            (cat: Category) => 
              cat.category_name === originalCategory.category_name &&
              String(cat.language_id) === String(languageId)
          );

          if (equivalentCategory) {
            // If we found an equivalent, notify the parent component to update the URL
            if (onCategoryChange && String(equivalentCategory.category_id) !== categoryId) {
              // Use setTimeout to avoid React state update during render
              setTimeout(() => onCategoryChange(String(equivalentCategory.category_id)));
            }
            // Continue with the equivalent category
            return fetchReport(baseUrl, String(equivalentCategory.category_id), languageId, reportId);
          }
        }

        // If no equivalent found, find any category in the target language
        const firstInLanguage = allCategories.find(
          (cat: Category) => String(cat.language_id) === String(languageId)
        );

        if (firstInLanguage) {
          if (onCategoryChange) {
            setTimeout(() => onCategoryChange(String(firstInLanguage.category_id)));
          }
          return fetchReport(baseUrl, String(firstInLanguage.category_id), languageId, reportId);
        }
      }

      // If we have a valid category or couldn't find a better one, proceed with the current one
      return fetchReport(baseUrl, categoryId, languageId, reportId);
    },
    enabled: !!reportId && !!categoryId && !!languageId && !!HomePage?.report_store_dropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Helper function to fetch the report
async function fetchReport(
  baseUrl: string,
  categoryId: string,
  languageId: string,
  reportId: string
): Promise<ReportDetailResponse> {
  const url = `${baseUrl}reports_store?category_id=${categoryId}&language_id=${languageId}&report_id=${reportId}`;
  
  console.log('Fetching report from:', {
    url,
    categoryId,
    languageId,
    reportId
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", {
      status: response.status,
      statusText: response.statusText,
      errorText,
      url
    });
    
    if (response.status === 404) {
      return null as any;
    }
    
    throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}