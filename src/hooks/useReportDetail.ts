import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ReportDetailResponse } from "@/types/reports";
import { useHomePageStore, useIdentityStore } from "@/store";

interface Category {
  category_id: number | string;
  language_id: number | string;
  category_name: string;
  title?: string;
  icon?: string;
  category_tagline?: string;
}

interface UseReportDetailParams {
  reportId: string;
  categoryId: string;
  languageId: string;
  reportReferenceId?: string; // New optional param
  slug?: string; // New optional param for bootstrap search
  initialData?: any; // Server-side data
  onCategoryChange?: (newCategoryId: string) => void;
}

export function useReportDetail({
  reportId,
  categoryId,
  languageId,
  reportReferenceId,
  slug,
  initialData,
  onCategoryChange
}: UseReportDetailParams) {
  const { HomePage, setIdentity, currentIdentity } = useHomePageStore();
  const { reportCache, reportDataCache, cacheIdentity, cacheReportData } = useIdentityStore();

  // Create a language-specific cache key to prevent collision
  const cacheKey = `${reportId}-${languageId}`;

  // Determine the effective reference ID: Prop (URL) > Cache > Store
  // 1. Prop: From current URL (fresh navigation)
  // 2. Cache: From persistent storage (refresh/tab switch)
  // 3. Store: Global volatile state (less reliable for refresh)
  const cachedRefId = reportCache[cacheKey];
  const effectiveReferenceId = reportReferenceId || cachedRefId || currentIdentity?.report_reference_id;
  // Resolve initial data: Server Prop (Freshest) > Local Cache (Fastest) & Safe fallback
  // We prefer server prop if it exists, otherwise cache.
  const resolvedInitialData = initialData || reportDataCache[cacheKey];

  const query = useQuery({
    queryKey: ["report-detail", reportId, categoryId, languageId, effectiveReferenceId, slug],
    initialData: resolvedInitialData,
    queryFn: async (): Promise<ReportDetailResponse> => {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_DB_URL is not defined");
      }

      // STRICT: Attempt fetch ONLY if we have a reference ID
      if (effectiveReferenceId) {
        // We only use reference ID + language ID. No category needed.
        const response = await fetchReport(baseUrl, languageId, effectiveReferenceId);

        if (isValidResponse(response)) {
          // Trust and Cache
          // Note: useEffect handles the main caching now, but we can do it here too for redundancy if needed.
          // But strict separation of concerns suggests leaving it to the effect or do it here.
          // Let's stick to the Trust-Based useEffect strategy for consistency.
          return response!;
        }
      }

      console.error("Missing Report Reference ID. Cannot fetch report securely.");
      throw new Error("Missing Report Reference ID");
    },
    enabled: !!reportId && !!categoryId && !!languageId && !!HomePage?.report_store_dropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // We handle retries manually
  });

  // Debug: Monitor Hook State
  console.log(`[useReportDetail Render] ID: ${reportId}, CacheKey: ${cacheKey}, RefID: ${effectiveReferenceId}, HasData: ${!!query.data}`);

  useEffect(() => {
    // console.log("[useReportDetail Effect] Data:", JSON.stringify(query.data, null, 2)); // Reduced noise

    if (query.data) {
      // Strategy: Extract canonical ID from response, OR trust the effective ID used to fetch it.
      const responseIdentity = query.data?.data?.report?.report_identity;
      const idToCache = responseIdentity?.report_reference_id || effectiveReferenceId;

      if (idToCache) {
        console.log(`[useReportDetail] Caching identity for ${cacheKey}: ${idToCache}`);

        // 1. Cache the Reference ID link
        cacheIdentity(cacheKey, idToCache);

        // 2. Cache the Content
        // We cache the whole response structure to ensure we have it all on refresh
        console.log(`[useReportDetail] Caching data for ${cacheKey}`);
        cacheReportData(cacheKey, query.data);

        // 3. Sync to global store (if Identity object is present)
        if (responseIdentity) {
          setIdentity({
            report_reference_id: responseIdentity.report_reference_id,
            category_reference_id: String(responseIdentity.category_reference_id)
          });
        }
      } else {
        console.warn(`[useReportDetail] Data loaded but no ID to cache for ${cacheKey}`);
      }
    }
  }, [query.data, effectiveReferenceId, setIdentity, cacheIdentity, cacheReportData, cacheKey]);

  return query;
}

function isValidResponse(response: ReportDetailResponse | null): boolean {
  return !!response && !!response.data && !!response.data.report;
}

// Helper function to fetch the report
async function fetchReport(
  baseUrl: string,
  languageId: string,
  reportReferenceId: string
): Promise<ReportDetailResponse | null> {
  const url = `${baseUrl}reports_store`;

  const formData = new FormData();
  formData.append('report_reference_id', reportReferenceId);
  formData.append('language_id', languageId);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // If response is 404/500, return null so we don't crash
      return null;
    }

    const data = await response.json();

    if (!data || !data.data || !data.data.report) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}