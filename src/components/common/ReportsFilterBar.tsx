"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/useDebounce";
import { useLanguageStore } from "@/store";
import { Filters } from "@/types/reports";
import { useFilterOptions } from "@/hooks/useFilterOptions";

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
}


export default function ReportsFilterBar({ 
  filters, 
  onFilterChange, 
  isLoading, 
  translations, 
  categories = [] 
}: ReportsFilterBarProps) {
  const { language } = useLanguageStore();
  const { data: filterOptions, isLoading: isFilterOptionsLoading } = useFilterOptions({ 
    language,
    category: filters.category_id || '' // Use the category_id from filters or fallback to empty string
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

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFilterChange]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full h-12 pl-4 pr-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          style={{ boxShadow: '2px 8px 29.2px 0px rgba(9, 140, 206, 0.59)' }}
        />
        <Icon 
          icon="mdi:magnify" 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
        />
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
              All Years
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
              All Periods
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
