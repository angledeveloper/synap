"use client";
import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { useReportsPage } from "../../../hooks/useReportsPage";
import ReportCard from "../../../components/ReportCard";
import ReportsFilterBar from "../../../components/ReportsFilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Report, ReportsResponse } from "@/types/reports";

const translations = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbCategory: "Technology & Software",
    heading: "Technology & Software",
    description:
      "When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities. SYNAPSea's consumer behavior modeling revealed untapped price thresholds, driving a 32% revenue increase in the first quarter post-launch. When preparing to launch a flagship device in Asia, the client lacked pricing clarity across tier-2 cities.",
    searchPlaceholder: "Search By Title",
    filters: {
      industry: "INDUSTRY",
      language: "LANGUAGE",
      region: "REGION",
      year: "YEAR",
    },
    clearFilters: "Clear Filters",
    viewReport: "View Report",
    pagination: {
      previous: "Previous",
      next: "Next",
    },
    noReports: "No reports found",
    noReportsDescription: "Try adjusting your search criteria or filters.",
  },
  ja: {
    breadcrumbHome: "ホーム",
    breadcrumbCategory: "テクノロジー＆ソフトウェア",
    heading: "テクノロジー＆ソフトウェア",
    description:
      "アジアでフラッグシップデバイスを発売する際、クライアントは第2都市での価格の明確さを欠いていました。SYNAPSeaの消費者行動モデリングは未開拓の価格閾値を明らかにし、発売後最初の四半期で32％の収益増加をもたらしました。",
    searchPlaceholder: "タイトルで検索",
    filters: {
      industry: "業界",
      language: "言語",
      region: "地域",
      year: "年",
    },
    clearFilters: "フィルターをクリア",
    viewReport: "レポートを見る",
    pagination: {
      previous: "前へ",
      next: "次へ",
    },
    noReports: "レポートが見つかりません",
    noReportsDescription: "検索条件やフィルターを調整してください。",
  },
  // Add more languages here
};

export default function ReportsPage() {
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations] || translations.en;
  const [filters, setFilters] = useState({
    search: "",
    category_id: "all",
    language_id: codeToId[language],
    region: "all",
    year: "all",
    page: 1,
    per_page: 4,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    currentPage: 1,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { mutate: fetchReports, isPending } = useReportsPage();

  useEffect(() => {
    // Update language_id when language changes
    setFilters(prev => ({
      ...prev,
      language_id: codeToId[language],
      page: 1, // Reset to first page when language changes
    }));
  }, [language]);

  useEffect(() => {
    // Fetch reports when filters change
    fetchReports(filters, {
      onSuccess: (data: ReportsResponse) => {
        setReports(data.reports);
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          totalCount: data.totalCount,
        });
        setIsLoading(false);
      },
      onError: (error: Error) => {
        console.error("Failed to fetch reports:", error);
        setIsLoading(false);
      },
    });
  }, [filters, fetchReports]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
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
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`${
            i === currentPage
              ? "bg-gradient-to-r from-[#08D2B8] to-[#1160C9] text-white border-0"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.pagination.previous}
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.pagination.next}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700">
                  {t.breadcrumbHome}
                </a>
              </li>
              <li>
                <Icon icon="mdi:chevron-right" className="text-gray-400" />
              </li>
              <li>
                <span className="text-gray-900 font-medium">{t.breadcrumbCategory}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#08D2B8] to-[#1160C9] bg-clip-text text-transparent">
            {t.heading}
          </h1>
          <p className="text-lg text-gray-600 text-left max-w-4xl">
            {t.description}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 py-8">
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
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
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
          ) : reports.length > 0 ? (
            <>
              <div className="space-y-4">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} viewReportLabel={t.viewReport} />
                ))}
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
