import { useMutation } from '@tanstack/react-query';
import { Filters, ReportsResponse } from '@/types/reports';

const fetchReports = async (filters: Filters): Promise<ReportsResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const callId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${callId}] Starting API call with filters:`, filters);
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_DB_URL is not defined');
  }

  // Create FormData as required by the API
  const formData = new FormData();
  formData.append('category_id', filters.category_id === "all" ? "1" : filters.category_id);
  formData.append('language_id', filters.language_id || "1"); // <-- use passed value not '1'
  
  // Add search parameter - try different parameter names
  if (filters.search && filters.search.trim()) {
    formData.append('search', filters.search.trim());
    formData.append('keyword', filters.search.trim()); // Try alternative parameter name
    formData.append('query', filters.search.trim()); // Try another alternative
  }
  
  // Add pagination parameters
  formData.append('page', filters.page.toString());
  formData.append('per_page', filters.per_page.toString());
  
  console.log(`[${callId}] Pagination parameters - page: ${filters.page}, per_page: ${filters.per_page}`);

  // Debug: Log all FormData being sent
  console.log(`[${callId}] Search value being sent:`, filters.search);
  console.log(`[${callId}] All FormData entries:`);
  for (let [key, value] of formData.entries()) {
    console.log(`[${callId}] ${key}: ${value}`);
  }

  // Try different approaches for search
  let response;
  
  if (filters.search && filters.search.trim()) {
    // Try using search_page endpoint for search queries, but include pagination
    console.log(`[${callId}] Using search_page endpoint for search query:`, filters.search.trim());
    
    const searchFormData = new FormData();
    searchFormData.append('search', filters.search.trim());
    searchFormData.append('language_id', "1");
    // Add pagination parameters to search as well
    searchFormData.append('page', filters.page.toString());
    searchFormData.append('per_page', filters.per_page.toString());
    
    console.log(`[${callId}] Search pagination parameters - page: ${filters.page}, per_page: ${filters.per_page}`);
    
    response = await fetch(`${baseUrl}search_page`, {
      method: 'POST',
      body: searchFormData,
    });
  } else {
    // Use regular reports endpoint for non-search queries
    console.log(`[${callId}] Using reports_store_page endpoint for non-search query`);
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
  
  // Debug: Log the response
  console.log(`[${callId}] API Response:`, data);
  console.log(`[${callId}] Number of reports in response:`, Array.isArray(data) ? data.length : data.reports?.length || data.data?.length || 0);
  
  // Helper function to deduplicate reports by ID
  const deduplicateReports = (reports: any[]) => {
    const seen = new Set();
    return reports.filter(report => {
      if (seen.has(report.id)) {
        console.log('Removing duplicate report with ID:', report.id);
        return false;
      }
      seen.add(report.id);
      return true;
    });
  };

  // Handle different response formats
  let formattedData: ReportsResponse;
  let reportsArray: any[] = [];
  
  if (Array.isArray(data)) {
    // If API returns array directly
    reportsArray = data;
  } else if (data.reports) {
    // If API returns object with reports property
    reportsArray = data.reports || [];
  } else if (data.data && Array.isArray(data.data)) {
    // If API returns object with data property containing reports array
    reportsArray = data.data;
  } else {
    // Fallback - treat entire response as single report if it has required fields
    if (data.id && data.title) {
      reportsArray = [data];
    } else {
      reportsArray = [];
    }
  }

  // Deduplicate reports
  const uniqueReports = deduplicateReports(reportsArray);
  console.log(`[${callId}] Original reports count:`, reportsArray.length);
  console.log(`[${callId}] After deduplication:`, uniqueReports.length);
  
  // Apply client-side pagination as fallback if backend doesn't respect per_page
  const startIndex = (filters.page - 1) * filters.per_page;
  const endIndex = startIndex + filters.per_page;
  const paginatedReports = uniqueReports.slice(startIndex, endIndex);
  
  console.log(`[${callId}] Client-side pagination - startIndex: ${startIndex}, endIndex: ${endIndex}, paginated count: ${paginatedReports.length}`);

  // Create formatted data with paginated reports
  const totalPages = Math.ceil(uniqueReports.length / filters.per_page);
  
  if (Array.isArray(data)) {
    formattedData = {
      reports: paginatedReports,
      totalPages: totalPages,
      currentPage: filters.page,
      totalCount: uniqueReports.length,
    };
  } else if (data.reports) {
    formattedData = {
      reports: paginatedReports,
      totalPages: data.totalPages || totalPages,
      currentPage: data.currentPage || filters.page,
      totalCount: data.totalCount || uniqueReports.length,
    };
  } else if (data.data && Array.isArray(data.data)) {
    formattedData = {
      reports: paginatedReports,
      totalPages: data.totalPages || totalPages,
      currentPage: data.currentPage || filters.page,
      totalCount: data.totalCount || uniqueReports.length,
    };
  } else {
    formattedData = {
      reports: paginatedReports,
      totalPages: totalPages,
      currentPage: filters.page,
      totalCount: uniqueReports.length,
    };
  }
  
  return formattedData;
};

export const useReportsPage = () => {
  return useMutation<ReportsResponse, Error, Filters>({
    mutationFn: fetchReports,
    onError: (error) => {
      console.error('Reports fetch error:', error);
    },
  });
};
