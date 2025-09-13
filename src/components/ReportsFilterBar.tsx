"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/useDebounce";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useLanguageStore } from "@/store";
import { Filters } from "@/types/reports";

interface ReportsFilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  isLoading: boolean;
  translations?: any;
}


export default function ReportsFilterBar({ filters, onFilterChange, isLoading, translations }: ReportsFilterBarProps) {
  const { language } = useLanguageStore();
  const { data: filterOptions, isLoading: isFilterOptionsLoading } = useFilterOptions({ language });
  
  const t = translations || {
    searchPlaceholder: "Search By Title",
    filters: {
      industry: "INDUSTRY",
      region: "REGION",
      year: "YEAR",
    },
    clearFilters: "Clear Filters",
  };
  
  // Ensure filters object exists with fallbacks
  const filterLabels = t.filters || {
    industry: "INDUSTRY",
    region: "REGION", 
    year: "YEAR",
  };
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Update search when debounced value changes
  useEffect(() => {
    console.log('Debounced search changed:', debouncedSearch, 'Current filters.search:', filters.search);
    if (debouncedSearch !== filters.search) {
      console.log('Triggering filter change with search:', debouncedSearch);
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
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.industry} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {filterOptions?.industries?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>


        {/* Region Filter */}
        <Select
          value={filters.region}
          onValueChange={(value) => handleFilterChange("region", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.region} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {filterOptions?.regions?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select
          value={filters.year}
          onValueChange={(value) => handleFilterChange("year", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={filterLabels.year} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {filterOptions?.years?.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            )) || []}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {(searchValue || (filters.category_id && filters.category_id !== "all") || (filters.region && filters.region !== "all") || (filters.year && filters.year !== "all")) && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchValue("");
              onFilterChange({
                search: "",
                category_id: "all",
                region: "all",
                year: "all",
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
