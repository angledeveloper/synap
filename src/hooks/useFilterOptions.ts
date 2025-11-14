import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterOptions {
  industries: FilterOption[];
  regions: FilterOption[];
  years: FilterOption[];
}

interface UseFilterOptionsParams {
  language: string;
}

export function useFilterOptions({ language }: UseFilterOptionsParams) {
  const languageId = codeToId[language as keyof typeof codeToId] || 1;
  
  return useQuery({
    queryKey: ["filter-options", languageId],
    queryFn: async (): Promise<FilterOptions> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      try {
        // Try to fetch filter options from a dedicated endpoint
        const response = await fetch(`${baseUrl}filter_options?language_id=${languageId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          return {
            industries: data.industries || [],
            regions: data.regions || [],
            years: data.years || [],
          };
        }
      } catch (error) {
        console.warn("Filter options endpoint not available, using fallback data");
      }

      // Fallback data if API endpoint is not available
      const fallbackIndustries: FilterOption[] = [
        { value: "1", label: "Technology & Software" },
        { value: "2", label: "Energy & Utilities" },
        { value: "3", label: "Food & Beverages" },
        { value: "4", label: "Construction" },
        { value: "5", label: "Healthcare & Pharmaceuticals" },
        { value: "6", label: "Chemicals & Materials" },
        { value: "7", label: "Telecommunications" },
        { value: "8", label: "Automotive & Transportation" },
        { value: "9", label: "Financial Services" },
        { value: "10", label: "Aerospace & Defense" },
        { value: "11", label: "Consumer Goods & Retail" },
        { value: "12", label: "Manufacturing & Industrial" },
        { value: "13", label: "Agriculture" },
      ];

      const fallbackRegions: FilterOption[] = [
        { value: "all", label: "All Regions" },
        { value: "global", label: "Global" },
        { value: "north-america", label: "North America" },
        { value: "europe", label: "Europe" },
        { value: "asia-pacific", label: "Asia Pacific" },
        { value: "latin-america", label: "Latin America" },
        { value: "middle-east-africa", label: "Middle East & Africa" },
      ];

      const fallbackYears: FilterOption[] = [
        { value: "all", label: "All Years" },
        { value: "2025", label: "2025" },
        { value: "2024", label: "2024" },
        { value: "2023", label: "2023" },
        { value: "2022", label: "2022" },
        { value: "2021", label: "2021" },
        { value: "2020", label: "2020" },
      ];

      return {
        industries: fallbackIndustries,
        regions: fallbackRegions,
        years: fallbackYears,
      };
    },
    enabled: !!language,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}
