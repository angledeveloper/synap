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
  const languageId = codeToId[language as keyof typeof codeToId] || 1;
  const categoryId =  codeToId[category as keyof typeof codeToId] || 1;
  
  return useQuery({
    queryKey: ['filter-options', languageId],
    queryFn: async (): Promise<FilterOptions> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_DB_URL is not defined');
        }

        // Fetch reports data to extract filter options
        const response = await fetch(`${baseUrl}reports_store_page`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language_id: languageId,
            category_id: categoryId,
            // Add any other required parameters for the API
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Make sure data.data exists and is an array
        const reports = Array.isArray(data.data) ? data.data : [];
        console.log("Reports data:", reports);

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

        console.log("Extracted baseYears:", Array.from(baseYears));
        console.log("Extracted forecastPeriods:", Array.from(forecastPeriods));

        return {
          industries: [], // This should be updated if you have industries data
          baseYears: Array.from(baseYears).map(year => ({
            value: year,
            label: year
          })),
          forecastPeriods: Array.from(forecastPeriods).map(period => ({
            value: period,
            label: period
          })),
        };
      } catch (error) {
        console.error("Error fetching filter options:", error);
        console.warn("Using fallback data due to error");
      }

      // Fallback data if API endpoint is not available
      const fallbackIndustries: FilterOption[] = [
        { value: 'Technology & Software', label: 'Technology & Software' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Education', label: 'Education' },
        { value: 'Retail', label: 'Retail' },
      ];

      const fallbackBaseYears: FilterOption[] = [
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
        { value: '2027', label: '2027' },
        { value: '2028', label: '2028' },
      ];

      const fallbackForecastPeriods: FilterOption[] = [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
      ];

      return {
        industries: fallbackIndustries,
        baseYears: fallbackBaseYears,
        forecastPeriods: fallbackForecastPeriods,
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}