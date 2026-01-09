import { useQuery } from '@tanstack/react-query';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';

export interface DeepSearchResult {
  id?: number;
  language_id?: number;
  title: string;
  description?: string;
  introduction_description?: string; // For reports
  cost?: string;
  report_date?: string;
  image?: string;
  category?: string;
  industry?: string;
  type: 'home' | 'about' | 'report' | 'legal';
  page_name?: string; // For legal docs
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

  let allResults: DeepSearchResult[] = [];

  // Process Home results
  if (data.home && Array.isArray(data.home)) {
    const homeResults = data.home.map((item: any) => ({
      ...item,
      type: 'home' as const,
      description: item.description || item.tagline // Handle tagline as description
    }));
    allResults = [...allResults, ...homeResults];
  }

  // Process About Us results
  if (data.about_us && Array.isArray(data.about_us)) {
    const aboutResults = data.about_us.map((item: any) => ({
      ...item,
      type: 'about' as const
    }));
    allResults = [...allResults, ...aboutResults];
  }

  // Process Reports results
  if (data.reports && Array.isArray(data.reports)) {
    const reportResults = data.reports.map((item: any) => ({
      ...item,
      id: item.id, // Ensure ID is captured
      language_id: item.language_id, // Capture language_id
      type: 'report' as const,
      description: item.introduction_description // Map for consistency
    }));
    allResults = [...allResults, ...reportResults];
  }

  // Process Legal (Terms/Privacy) results
  if (data.terms_privacy && Array.isArray(data.terms_privacy)) {
    const legalResults = data.terms_privacy.map((item: any) => ({
      ...item,
      type: 'legal' as const
    }));
    allResults = [...allResults, ...legalResults];
  }

  // Fallback for legacy/simple response structure
  if (allResults.length === 0) {
    if (Array.isArray(data)) {
      // Assume reports if array
      allResults = data.map((item: any) => ({ ...item, type: 'report' as const }));
    } else if (data.results || data.data) {
      const list = data.results || data.data || [];
      allResults = list.map((item: any) => ({ ...item, type: 'report' as const }));
    }
  }

  return {
    results: allResults,
    total: allResults.length,
    query: query.trim()
  };
};

export const useDeepSearch = (query: string, enabled: boolean = true) => {
  const { language } = useLanguageStore();
  const languageId = codeToId[language as keyof typeof codeToId] || codeToId['en'];

  return useQuery<DeepSearchResponse>({
    queryKey: ['deepSearch', query, languageId],
    queryFn: () => fetchDeepSearch(query, Number(languageId)),
    enabled: enabled && query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};
