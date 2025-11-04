"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useReportsPage } from "../../../hooks/useReportsPage";
import { useTranslations } from "../../../hooks/useTranslations";
import ReportCard from "@/components/common/ReportCard";
import ReportsFilterBar from "@/components/common/ReportsFilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { Report, ReportsResponse } from "@/types/reports";


export default function ReportsPage() {
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();
  const { data: translations, isLoading: isTranslationsLoading, error: translationsError } = useTranslations({ language, page: 'reports' });
  const t = translations || {
    breadcrumbHome: "Home",
    breadcrumbCategory: "Technology & Software",
    heading: "Technology & Software",
    description: "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch.",
    searchPlaceholder: "Search By Title",
    filters: {
      industry: "INDUSTRY",
      region: "REGION",
      year: "YEAR",
    },
    clearFilters: "Clear Filters",
    viewReport: "View Report",
    pagination: {
      previous: "Previous",
      next: "Next",
    },
    reportLimit: {
      label: "Reports per page:",
      options: {
        "1-10": "1-10",
        "1-50": "1-50", 
        "1-100": "1-100"
      }
    },
    noReports: "No reports found",
    noReportsDescription: "Try adjusting your search criteria or filters.",
  };
  
  // Get category from URL parameters
  const rawCategoryFromUrl = searchParams.get('category');
  const categoryIdSanitized = rawCategoryFromUrl && rawCategoryFromUrl !== 'undefined' ? rawCategoryFromUrl : '1';
  const languageId = codeToId[language as keyof typeof codeToId] || '1';

  const [filters, setFilters] = useState({
    search: "",
    category_id: categoryIdSanitized,
    region: "all",
    year: "all",
    page: 1,
    per_page: 10,
    language_id: languageId,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 1,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRenderedReports, setLastRenderedReports] = useState<string>('');


  const { mutate: fetchReports, isPending } = useReportsPage();

  // Keep filters in sync if ?category in URL changes (for SPA navigation from navbar)
  useEffect(() => {
    const categoryIdSanitized = rawCategoryFromUrl && rawCategoryFromUrl !== 'undefined' ? rawCategoryFromUrl : '1';
    setFilters(prev => {
      if (categoryIdSanitized !== prev.category_id || prev.language_id !== languageId) {
        return { ...prev, category_id: categoryIdSanitized, language_id: languageId, page: 1 };
      }
      return prev;
    });
  }, [rawCategoryFromUrl, languageId]);

  // Memoize the entire translation object to prevent unnecessary re-renders
  const memoizedTranslations = useMemo(() => t, [language]);

  // Simple memoized reports rendering
  const memoizedReports = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    
    return reports.map((report) => (
      <ReportCard 
        key={report.id} 
        report={report} 
        viewReportLabel={memoizedTranslations.viewReport} 
      />
    ));
  }, [reports, memoizedTranslations.viewReport]);

  useEffect(() => {
    // Fetch reports when filters change
    setIsLoading(true); // Set loading state when starting fetch
    fetchReports(filters, {
      onSuccess: (data: ReportsResponse) => {
        const reportsToSet = data.reports || [];
        const reportsKey = reportsToSet.map(r => r.id).sort().join(',');
        
        if (reportsKey !== lastRenderedReports) {
          setReports(reportsToSet);
          setLastRenderedReports(reportsKey);
        }
        
        setPagination({
          totalPages: data.totalPages || 0,
          currentPage: data.currentPage || 1,
          totalCount: data.totalCount || 0,
        });
        setIsLoading(false);
      },
      onError: (error: Error) => {
        console.error("Failed to fetch reports:", error);
        setReports([]); // Set empty array on error
        setPagination({
          totalPages: 0,
          currentPage: 1,
          totalCount: 0,
        });
        setIsLoading(false);
      },
    });
  }, [filters, fetchReports]); // Added fetchReports back to dependencies

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Reports loading timeout - stopping loading state");
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      language_id: languageId,
      page: 1,
    }));
  }, [languageId]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handlePerPageChange = (perPage: string) => {
    const perPageValue = parseInt(perPage.split('-')[1]); // Extract the max number from "1-10", "1-50", etc.
    setFilters(prev => ({
      ...prev,
      per_page: perPageValue,
      page: 1, // Reset to first page when changing per page
    }));
  };

  const renderPagination = () => {
    const { totalPages, currentPage } = pagination;
    const pages = [];
    
    // Show up to 10 page numbers
    const startPage = Math.max(1, currentPage - 4);
    const endPage = Math.min(totalPages, startPage + 9);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 text-sm font-medium border-r border-gray-300 last:border-r-0 ${
            i === currentPage
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Ensure reportLimit and options exist with fallbacks
    const reportLimit = {
      label: t.reportLimit?.label || "Reports per page:",
      options: {
        "1-10": t.reportLimit?.options?.["1-10"] || "1-10",
        "1-50": t.reportLimit?.options?.["1-50"] || "1-50",
        "1-100": t.reportLimit?.options?.["1-100"] || "1-100"
      }
    };

    // Ensure pagination exists with fallbacks
    const paginationLabels = {
      previous: t.pagination?.previous || "Previous",
      next: t.pagination?.next || "Next"
    };

    return (
      <div className="flex items-center justify-between mt-12">
        {/* Report Limit Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
            {reportLimit.label}
          </label>
          <Select 
            value={`1-${filters.per_page}`} 
            onValueChange={handlePerPageChange}
          >
            <SelectTrigger className="w-24 h-8 text-sm text-gray-900 bg-white border-gray-300">
              <SelectValue placeholder="Select limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10" className="text-gray-900">{reportLimit.options["1-10"]}</SelectItem>
              <SelectItem value="1-50" className="text-gray-900">{reportLimit.options["1-50"]}</SelectItem>
              <SelectItem value="1-100" className="text-gray-900">{reportLimit.options["1-100"]}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination Controls */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border-r border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paginationLabels.previous}
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paginationLabels.next}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumbs */}
      <div className="pt-11 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a 
                  href={`/${language}`} 
                  className="text-gray-500 hover:text-gray-700 font-normal"
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '18px', 
                    letterSpacing: '0px' 
                  }}
                >
                  {t.breadcrumbHome}
                </a>
              </li>
              <li>
                <Icon icon="mdi:chevron-right" className="text-gray-500" />
              </li>
              <li>
                <span 
                  className="text-gray-500 font-normal"
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '18px', 
                    letterSpacing: '0px' 
                  }}
                >
                  {t.breadcrumbCategory}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white" style={{ paddingTop: '7px', paddingBottom: '15px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent" style={{ 
            fontFamily: 'Space Grotesk, sans-serif', 
            fontSize: '40px', 
            lineHeight: '59px', 
            letterSpacing: '0px', 
            fontWeight: '400',
            overflow: 'visible',
          }}>
            {t.heading}
          </h1>
          <p className="text-lg text-left" style={{ color: '#242424', lineHeight: '26px', letterSpacing: '0%', width: '1315px', height: '78px' }}>
            {t.description}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ paddingTop: '20px', paddingBottom: '25px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReportsFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            isLoading={isPending}
            translations={t}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="pb-12" style={{ paddingTop: '48px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading || isPending ? (
            <div className="bg-[#F0F0F0] pb-6" style={{ paddingTop: '61px', paddingLeft: '41px', paddingRight: '41px' }}>
              <div className="space-y-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-white  shadow-sm border border-blue-200 p-6" style={{ width: '471px', height: '468px' }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-6">
                        <Skeleton className="h-5 w-3/4 mb-3" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-2/3 mb-4" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : reports && reports.length > 0 ? (
            <>
              <div className="bg-gray-100 pb-6" style={{ paddingTop: '61px', paddingLeft: '41px', paddingRight: '41px' }}>
                <div className="space-y-4">
                  {memoizedReports}
                </div>
              </div>
              {pagination.totalPages > 1 && renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <Icon icon="mdi:file-search-outline" className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noReports}</h3>
              <p className="text-gray-600">{t.noReportsDescription}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
