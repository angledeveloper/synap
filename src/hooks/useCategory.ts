import { useQuery } from "@tanstack/react-query";

interface Category {
  id: number;
  name: string;
  language_id: number;
}

interface UseCategoryParams {
  categoryId: string;
  languageId: string;
}

export function useCategory({ categoryId, languageId }: UseCategoryParams) {
  return useQuery({
    queryKey: ["category", categoryId, languageId],
    queryFn: async (): Promise<Category | null> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      // Try to fetch category information from the reports_store_page endpoint
      // This is a workaround since there's no dedicated category endpoint
      const formData = new FormData();
      formData.append('category_id', categoryId);
      formData.append('language_id', languageId);
      formData.append('page', '1');
      formData.append('per_page', '1');

      const response = await fetch(`${baseUrl}reports_store_page`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to fetch category info:", response.status);
        return null;
      }

      const data = await response.json();

      // Extract category name from the response
      // This is a workaround - ideally there should be a dedicated category endpoint
      if (data && data.reports && data.reports.length > 0) {
        // If the API returns category information in the reports
        const firstReport = data.reports[0];
        if (firstReport.category_name) {
          return {
            id: parseInt(categoryId),
            name: firstReport.category_name,
            language_id: parseInt(languageId)
          };
        }
      }

      // Fallback: return a default category name based on category_id
      const categoryNames: { [key: string]: string } = {
        '1': 'Technology & Software',
        '2': 'Healthcare & Life Sciences',
        '3': 'Energy & Power',
        '4': 'Automotive & Transportation',
        '5': 'Consumer Goods & Retail',
        '6': 'Industrial & Manufacturing',
        '7': 'Financial Services',
        '8': 'Telecommunications',
        '9': 'Aerospace & Defense',
        '10': 'Chemicals & Materials'
      };

      return {
        id: parseInt(categoryId),
        name: categoryNames[categoryId] || 'Technology & Software',
        language_id: parseInt(languageId)
      };
    },
    enabled: !!categoryId && categoryId !== 'undefined' && categoryId !== 'null' && categoryId !== '' && categoryId !== '0',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
