import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/useDebounce";
import { useLanguageStore } from "@/store";
import { Filters } from "@/types/reports";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useDeepSearch } from "@/hooks/useDeepSearch";
import { fetchReportIdByTitle } from "@/lib/reportUtils";
import { codeToId } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface CategoryOption {
  id: string;
  name: string;
  value: string;
}

interface ReportsFilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  isLoading: boolean;
  translations?: any;
  categories?: CategoryOption[];
  baseYearLabel?: string;
  forecastPeriodLabel?: string;
}


export default function ReportsFilterBar({
  filters,
  onFilterChange,
  isLoading,
  translations,
  categories = [],
  baseYearLabel,
  forecastPeriodLabel
}: ReportsFilterBarProps) {
  const { language } = useLanguageStore();

  // Validate category against available categories to prevent fetching with invalid default ID
  const isCategoryValid = categories.length === 0 || categories.some(c => c.value === String(filters.category_id));
  const categoryForHook = isCategoryValid ? (filters.category_id || '') : '';

  const { data: filterOptions, isLoading: isFilterOptionsLoading } = useFilterOptions({
    language,
    category: categoryForHook
  });

  const t = translations || {
    searchPlaceholder: "Search By Title",
    filters: {
      industry: "INDUSTRY",
      base_year: "BASE YEAR",
      forecast_period: "FORECAST PERIOD",
    },
    clearFilters: "Clear Filters",
  };

  // Ensure filters object exists with fallbacks
  const filterLabels = t.filters || {
    industry: "INDUSTRY",
    base_year: "BASE YEAR",
    forecast_period: "FORECAST PERIOD",
  };
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearch = useDebounce(searchValue, 300);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Deep Search Hook
  const { data: searchResults, isLoading: isSearchLoading } = useDeepSearch(debouncedSearch, showSearchResults);

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({ [key]: value });
  };

  const handleResultClick = async (result: any) => {
    setSearchValue(result.title); // Optional: set input to clicked title
    setShowSearchResults(false);

    const queryParam = `?highlight=${encodeURIComponent(result.title)}`;
    let targetUrl = `/${language}/reports${queryParam}`;

    if (result.id) {
      targetUrl = `/${language}/reports/${result.id}${queryParam}`;
    } else {
      // Use helper to find ID
      const id = await fetchReportIdByTitle(result.title, language);
      if (id) {
        targetUrl = `/${language}/reports/${id}${queryParam}`;
      } else {
        console.error('Could not find report ID for:', result.title);
        // Fallback to just filtering the list (which is already happening via debounced search)
        return;
      }
    }

    window.location.href = targetUrl;
  };

  // Filter only report results
  const reportResults = searchResults?.results.filter(r => r.type === 'report') || [];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative" ref={searchContainerRef}>
        <Input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchValue.trim()) setShowSearchResults(true);
          }}
          className="w-full h-12 pl-4 pr-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          style={{ boxShadow: '2px 8px 29.2px 0px rgba(9, 140, 206, 0.59)' }}
        />
        <Icon
          icon="mdi:magnify"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
        />

        {/* Search Results Dropdown */}
        {showSearchResults && searchValue.trim() && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            {isSearchLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-sm">Searching...</p>
              </div>
            ) : reportResults.length > 0 ? (
              <div className="py-2">
                {reportResults.slice(0, 5).map((result: any, index: number) => (
                  <div
                    key={`report-result-${index}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center">
                      <Icon icon="mdi:file-document-outline" className="text-gray-400 mr-3 text-lg flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {result.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No reports found matching "{searchValue}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: '41px' }}>
        {/* Industry Filter */}
        <Select
          value={filters.category_id}
          onValueChange={(value) => handleFilterChange("category_id", value)}
          disabled={isLoading || !categories.length}
        >
          <SelectTrigger className="w-full h-12 border-gray-400 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.industry} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {categories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.value}
                className="text-gray-900"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        {/* Base Year Filter */}
        <Select
          value={filters.base_year || "all"}
          onValueChange={(value) => handleFilterChange("base_year", value)}
          disabled={isLoading || isFilterOptionsLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-400 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.base_year} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            <SelectItem value="all" className="text-gray-900">
              {baseYearLabel || "All Years"}
            </SelectItem>
            {filterOptions?.baseYears?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Forecast Period Filter */}
        <Select
          value={filters.forecast_period || "all"}
          onValueChange={(value) => handleFilterChange("forecast_period", value)}
          disabled={isLoading || isFilterOptionsLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-400 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.forecast_period} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            <SelectItem value="all" className="text-gray-900">
              {forecastPeriodLabel || "All Periods"}
            </SelectItem>
            {filterOptions?.forecastPeriods?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {(searchValue ||
        (filters.category_id && filters.category_id !== "all") ||
        (filters.base_year && filters.base_year !== "all") ||
        (filters.forecast_period && filters.forecast_period !== "all")) && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchValue("");
                setShowSearchResults(false);
                onFilterChange({
                  ...filters,
                  search: "",
                  category_id: "all",
                  base_year: "all",
                  forecast_period: "all",
                  page: 1,
                });
              }}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t.clearFilters}
            </Button>
          </div>
        )}
    </div>
  );
}
