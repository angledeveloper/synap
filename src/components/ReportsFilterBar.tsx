"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/useDebounce";
import { Filters } from "@/types/reports";

interface ReportsFilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  isLoading: boolean;
  translations?: any;
}

// Mock data for filter options - replace with actual API data
const INDUSTRY_OPTIONS = [
  { value: "all", label: "All Industries" },
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


const REGION_OPTIONS = [
  { value: "all", label: "All Regions" },
  { value: "global", label: "Global" },
  { value: "north-america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "asia-pacific", label: "Asia Pacific" },
  { value: "latin-america", label: "Latin America" },
  { value: "middle-east-africa", label: "Middle East & Africa" },
];

const YEAR_OPTIONS = [
  { value: "all", label: "All Years" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
];

export default function ReportsFilterBar({ filters, onFilterChange, isLoading, translations }: ReportsFilterBarProps) {
  const t = translations || {
    searchPlaceholder: "Search By Title",
    filters: {
      industry: "INDUSTRY",
      region: "REGION",
      year: "YEAR",
    },
    clearFilters: "Clear Filters",
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
            <SelectValue placeholder={t.filters.industry} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


        {/* Region Filter */}
        <Select
          value={filters.region}
          onValueChange={(value) => handleFilterChange("region", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={t.filters.region} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {REGION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select
          value={filters.year}
          onValueChange={(value) => handleFilterChange("year", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900">
            <SelectValue placeholder={t.filters.year} />
          </SelectTrigger>
          <SelectContent className="text-gray-900">
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-gray-900">
                {option.label}
              </SelectItem>
            ))}
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
