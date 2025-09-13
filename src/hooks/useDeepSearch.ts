import { useQuery } from '@tanstack/react-query';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';

export interface DeepSearchResult {
  id: number;
  title: string;
  introduction_description: string;
  cost: string;
  report_date: string;
  image?: string;
  category?: string;
  industry?: string;
}

export interface DeepSearchResponse {
  results: DeepSearchResult[];
  total: number;
  query: string;
}

const fetchDeepSearch = async (query: string, languageId: number): Promise<DeepSearchResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_DB_URL is not defined');
  }

  if (!query.trim()) {
    return { results: [], total: 0, query: '' };
  }

  const url = `${baseUrl}deep_search?query=${encodeURIComponent(query.trim())}&language_id=${languageId}`;

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch search results: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Handle response with 'home' property (based on your API response)
  if (data.home && Array.isArray(data.home)) {
    return {
      results: data.home,
      total: data.home.length,
      query: query.trim()
    };
  }
  
  // Handle different response formats
  if (Array.isArray(data)) {
    return {
      results: data,
      total: data.length,
      query: query.trim()
    };
  }
  
  if (data.results || data.data) {
    return {
      results: data.results || data.data || [],
      total: data.total || data.count || 0,
      query: query.trim()
    };
  }

  return {
    results: data,
    total: Array.isArray(data) ? data.length : 0,
    query: query.trim()
  };
};

export const useDeepSearch = (query: string, enabled: boolean = true) => {
  const { language } = useLanguageStore();
  const languageId = codeToId[language];

  return useQuery<DeepSearchResponse>({
    queryKey: ['deepSearch', query, languageId],
    queryFn: () => fetchDeepSearch(query, Number(languageId)),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};
