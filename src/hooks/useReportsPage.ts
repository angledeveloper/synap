import { useMutation } from '@tanstack/react-query';
import { Filters, ReportsResponse } from '@/types/reports';

const fetchReports = async (filters: Filters): Promise<ReportsResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_DB_URL is not defined');
  }

  // Create FormData as required by the API
  const formData = new FormData();
  formData.append('category_id', filters.category_id === "all" ? "1" : filters.category_id);
  formData.append('language_id', filters.language_id || "1");
  
  // Add search parameter - try different parameter names
  if (filters.search && filters.search.trim()) {
    formData.append('search', filters.search.trim());
    formData.append('keyword', filters.search.trim());
    formData.append('query', filters.search.trim());
  }
  
  // Add pagination parameters
  formData.append('page', filters.page.toString());
  formData.append('per_page', filters.per_page.toString());

  // Try different approaches for search
  let response;
  
  if (filters.search && filters.search.trim()) {
    const searchFormData = new FormData();
    searchFormData.append('search', filters.search.trim());
    searchFormData.append('language_id', filters.language_id || "1");
    searchFormData.append('page', filters.page.toString());
    searchFormData.append('per_page', filters.per_page.toString());
    
    response = await fetch(`${baseUrl}search_page`, {
      method: 'POST',
      body: searchFormData,
    });
  } else {
    response = await fetch(`${baseUrl}reports_store_page`, {
      method: 'POST',
      body: formData,
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch reports: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Extract category info if available in the response
  const categoryName = (data as any).category_name;
  const categoryDesc = (data as any).category_desc;
  
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
  
  // Deduplicate reports by ID
  const uniqueReports = Array.from(new Map(reports.map(report => [report.id, report])).values());
  
  // Apply client-side pagination as a fallback if not done by the server
  const startIndex = (filters.page - 1) * filters.per_page;
  const endIndex = startIndex + filters.per_page;
  const paginatedReports = uniqueReports.slice(startIndex, endIndex);
  
  // Calculate total pages based on unique reports count
  const totalPages = Math.ceil(uniqueReports.length / filters.per_page);
  
  // Create formatted response
  return {
    reports: paginatedReports,
    totalPages: totalPages,
    currentPage: filters.page,
    totalCount: uniqueReports.length,
    category_name: categoryName,
    category_desc: categoryDesc
  };
};

export const useReportsPage = () => {
  return useMutation<ReportsResponse, Error, Filters>({
    mutationFn: fetchReports,
    onError: (error) => {
      console.error('Reports fetch error:', error);
    },
  });
};
