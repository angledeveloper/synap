import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

// 1. Update the FilterOptions interface
interface FilterOptions {
  industries: FilterOption[];
  baseYears: FilterOption[];
  forecastPeriods: FilterOption[];
}

interface UseFilterOptionsParams {
  language: string;
  category: string;
}
// 2. Update the useFilterOptions hook to fetch and process the new filter options
export function useFilterOptions({ language, category }: UseFilterOptionsParams) {
  const languageId = codeToId[language as keyof typeof codeToId] || '1';
  // category is already the ID string or number, just ensure it's a string
  const categoryId = category ? String(category) : '1';

  return useQuery({
    queryKey: ['filter-options', languageId, categoryId],
    queryFn: async (): Promise<FilterOptions> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_DB_URL is not defined');
        }

        // Create FormData
        const formData = new FormData();
        formData.append('language_id', String(languageId));
        formData.append('category_id', String(categoryId));
        // Add default pagination to get enough data for filters
        formData.append('page', '1');
        formData.append('per_page', '100');

        // Fetch reports data to extract filter options
        const response = await fetch(`${baseUrl}reports_store_page`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log("API Response for Options:", data);

        // Handle different response formats similar to useReportsPage
        let reports = [];
        if (Array.isArray(data)) {
          reports = data;
        } else if (data.reports) {
          reports = data.reports;
        } else if (data.data && Array.isArray(data.data)) {
          reports = data.data;
        }

        // Ensure reports is an array
        if (!Array.isArray(reports)) {
          reports = [];
        }

        // Extract unique base years and forecast periods
        const baseYears = new Set<string>();
        const forecastPeriods = new Set<string>();

        reports.forEach((report: any) => {
          if (report.base_year) {
            baseYears.add(report.base_year.toString());
          }
          if (report.forecast_period) {
            forecastPeriods.add(report.forecast_period.toString());
          }
        });

        return {
          industries: [],
          baseYears: Array.from(baseYears).sort().map(year => ({
            value: year,
            label: year
          })),
          forecastPeriods: Array.from(forecastPeriods).sort().map(period => ({
            value: period,
            label: period
          })),
        };
      } catch (error) {
        console.error("Error fetching filter options:", error);
        console.warn("Using fallback data due to error");

        // Fallback data
        return {
          industries: [],
          baseYears: [],
          forecastPeriods: [],
        };
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}