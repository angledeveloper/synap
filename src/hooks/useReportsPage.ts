import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Filters, ReportsResponse } from '@/types/reports';
import {
  fetchReportBackendSlugByReferenceId,
  getReportStableId,
} from '@/lib/reportUtils';
import { useHomePageStore } from '@/store';

const fetchReports = async (filters: Filters, allCategories: any[]): Promise<ReportsResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_DB_URL is not defined');
  }

  // Find the category in the dropdown data
  const category = allCategories.find(
    cat => String(cat.category_id) === String(filters.category_id) &&
      String(cat.language_id) === String(filters.language_id)
  );

  if (!category) {
    console.warn('Category not found in report_store_dropdown, using first available category');
    const firstCategory = allCategories[0];
    if (!firstCategory) {
      // Instead of throwing, return empty response
      console.warn('No categories available in report_store_dropdown');
      return {
        reports: [],
        totalPages: 0,
        currentPage: 1,
        totalCount: 0,
        category_name: '',
        category_desc: ''
      };
    }
    return {
      reports: [],
      totalPages: 0,
      currentPage: 1,
      totalCount: 0,
      category_name: firstCategory.category_name,
      category_desc: firstCategory.title || ''
    };
  }

  // Create FormData with the validated category
  const formData = new FormData();

  // Always use category_reference_id. If missing/null, fallback to category_id.
  const refId = category.category_reference_id || category.category_id;
  formData.append('category_reference_id', String(refId));

  formData.append('language_id', String(category.language_id));

  // Add search parameter - try different parameter names
  if (filters.search && filters.search.trim()) {
    formData.append('search', filters.search.trim());
    formData.append('keyword', filters.search.trim());
    formData.append('query', filters.search.trim());
  }

  // Add pagination parameters
  formData.append('page', filters.page.toString());
  formData.append('per_page', filters.per_page.toString());

  // Add filter parameters
  if (filters.base_year && filters.base_year !== 'all') {
    formData.append('base_year', filters.base_year);
  }

  if (filters.forecast_period && filters.forecast_period !== 'all') {
    formData.append('forecast_period', filters.forecast_period);
  }

  // Use reports_store_page for both search and regular fetching
  // It supports search parameter
  if (filters.search && filters.search.trim()) {
    formData.append('search', filters.search.trim());
  }

  const response = await fetch(`${baseUrl}reports_store_page`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch reports: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Extract category info if available in the response
  const categoryName = (data as any).category_name;
  const categoryDesc = (data as any).category_desc;
  const baseYear = (data as any).base_year;
  const forecastPeriod = (data as any).forecast_period;

  // Handle different response formats
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

  // Deduplicate reports by ID, prefer records that include a backend slug
  const reportMap = new Map<string | number, any>();
  reports.forEach((report: any) => {
    const key = report.id;
    const existing = reportMap.get(key);
    if (!existing) {
      reportMap.set(key, report);
      return;
    }
    const existingSlug = typeof existing.slug === 'string' ? existing.slug.trim() : '';
    const nextSlug = typeof report.slug === 'string' ? report.slug.trim() : '';
    if (!existingSlug && nextSlug) {
      reportMap.set(key, report);
    }
  });
  let uniqueReports = Array.from(reportMap.values());

  // Client-side filtering
  if (filters.base_year && filters.base_year !== 'all') {
    uniqueReports = uniqueReports.filter(report =>
      report.base_year?.trim() === filters.base_year.trim()
    );
  }

  if (filters.forecast_period && filters.forecast_period !== 'all') {
    uniqueReports = uniqueReports.filter(report =>
      report.forecast_period?.trim() === filters.forecast_period.trim()
    );
  }

  // Apply client-side pagination as a fallback if not done by the server
  const startIndex = (filters.page - 1) * filters.per_page;
  const endIndex = startIndex + filters.per_page;
  let paginatedReports = uniqueReports.slice(startIndex, endIndex);

  // Ensure backend slug is present for the current page (used for canonical report URLs)
  paginatedReports = await Promise.all(
    paginatedReports.map(async (report: any) => {
      const existingSlug =
        typeof report.slug === 'string' ? report.slug.trim() : '';
      if (existingSlug) return report;

      const stableId = getReportStableId(report);
      if (!stableId) return report;

      const backendSlug = await fetchReportBackendSlugByReferenceId(
        stableId,
        category.language_id,
      );
      if (!backendSlug) return report;

      return { ...report, slug: backendSlug };
    }),
  );

  // Calculate total pages based on unique reports count
  const totalPages = Math.ceil(uniqueReports.length / filters.per_page);

  // Create formatted response
  return {
    reports: paginatedReports,
    totalPages: totalPages,
    currentPage: filters.page,
    totalCount: uniqueReports.length,
    category_name: categoryName,
    category_desc: categoryDesc,
    base_year: baseYear,
    forecast_period: forecastPeriod
  };
};

export const useReportsPage = () => {
  const { HomePage, setIdentity } = useHomePageStore();
  const allCategories = HomePage?.report_store_dropdown || [];

  const mutation = useMutation<ReportsResponse, Error, Filters>({
    mutationFn: (filters) => fetchReports(filters, allCategories),
    onError: (error) => {
      console.error('Reports fetch error:', error);
    },
  });

  useEffect(() => {
    if (mutation.data) {
      // If we have data, we can try to extract category reference id from the first report or the filters
      // But simpler: just use the category from filters if possible.
      // Actually, since we don't have easy access to filters here (it's in mutation variables),
      // we can look at the response if it has category info.

      // However, fetchReports returns category_name etc. 
      // Let's iterate through reports to find identity if needed, or rely on logic in component.
      // But wait, the mutation variables are available in mutation.variables if we need them.

      const filters = mutation.variables;
      if (filters && allCategories.length > 0) {
        const category = allCategories.find(
          (cat: any) => String(cat.category_id) === String(filters.category_id)
        );
        if (category && category.category_reference_id) {
          setIdentity({ category_reference_id: String(category.category_reference_id) });
        }
      }
    }
  }, [mutation.data, mutation.variables, allCategories, setIdentity]);

  return mutation;
};
