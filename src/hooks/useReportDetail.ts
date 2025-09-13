import { useQuery } from "@tanstack/react-query";
import { ReportDetailResponse } from "@/types/reports";

interface UseReportDetailParams {
  reportId: string;
  categoryId: string;
  languageId: string;
}

export function useReportDetail({ reportId, categoryId, languageId }: UseReportDetailParams) {
  return useQuery({
    queryKey: ["report-detail", reportId, categoryId, languageId],
    queryFn: async (): Promise<ReportDetailResponse> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      const url = `${baseUrl}reports_store?category_id=${categoryId}&language_id=${languageId}&report_id=${reportId}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        
        // If report not found, return null instead of throwing
        if (response.status === 404) {
          return null as any;
        }
        
        throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!reportId && !!categoryId && !!languageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
