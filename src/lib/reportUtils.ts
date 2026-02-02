import { codeToId } from "@/lib/utils";

type ReportLike = {
    id?: number | string;
    slug?: string;
    report_reference_id?: number | string;
    report_identity?: { report_reference_id?: number | string };
};

export function getReportStableId(report: ReportLike): string | number | null {
    return (
        report?.report_identity?.report_reference_id ||
        report?.report_reference_id ||
        report?.id ||
        null
    );
}

export function buildCanonicalReportSlug(report: ReportLike): string | null {
    const stableId = getReportStableId(report);
    const trimmedBackendSlug =
        typeof report?.slug === "string" ? report.slug.trim() : "";
    if (trimmedBackendSlug && stableId) {
        return `${trimmedBackendSlug}-${stableId}`;
    }
    if (stableId) {
        return `${stableId}`;
    }
    return null;
}

export async function fetchReportBackendSlugByReferenceId(
    referenceId: string | number,
    languageId: string | number
): Promise<string | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl || !referenceId || !languageId) return null;

        const formData = new FormData();
        formData.append("report_reference_id", String(referenceId));
        formData.append("language_id", String(languageId));

        const response = await fetch(`${baseUrl}reports_store`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) return null;

        const data = await response.json();
        const report = data?.data?.report;
        const reportSeo = data?.data?.seo;
        const backendSlug = report?.slug ?? reportSeo?.slug ?? data?.slug;
        const trimmedBackendSlug =
            typeof backendSlug === "string" ? backendSlug.trim() : "";

        return trimmedBackendSlug || null;
    } catch (error) {
        console.error("Error fetching report slug:", error);
        return null;
    }
}

/**
 * Fetches the report ID by title using the reports_store_page API.
 * This is a workaround for the deep_search API missing report IDs.
 */
export async function fetchReportSlugByTitle(
    title: string,
    language: string
): Promise<{ slug: string | null; stableId: string | number | null } | null> {
    try {
        const formData = new FormData();
        formData.append('search', title);
        formData.append('language_id', codeToId[language as keyof typeof codeToId] || '1');
        formData.append('page', '1');
        formData.append('per_page', '10');
        formData.append('category_id', 'all');

        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) return null;

        const response = await fetch(`${baseUrl}reports_store_page`, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();

            // Check filtered categories for the report
            if (data.filtered && Array.isArray(data.filtered)) {
                for (const category of data.filtered) {
                    if (category.reports && Array.isArray(category.reports)) {
                        const foundReport = category.reports.find((r: any) => r.title === title);
                        if (foundReport) {
                            const stableId = getReportStableId(foundReport);
                            let slug = typeof foundReport.slug === "string" ? foundReport.slug.trim() : "";
                            if (!slug && stableId) {
                                slug = (await fetchReportBackendSlugByReferenceId(
                                    stableId,
                                    codeToId[language as keyof typeof codeToId] || "1"
                                )) || "";
                            }
                            return {
                                slug: slug || null,
                                stableId,
                            };
                        }
                    }
                }
            }

            // Fallback to direct data check
            if (data.reports && data.reports.length > 0) {
                const found = data.reports.find((r: any) => r.title === title);
                if (found) {
                    const stableId = getReportStableId(found);
                    let slug = typeof found.slug === "string" ? found.slug.trim() : "";
                    if (!slug && stableId) {
                        slug = (await fetchReportBackendSlugByReferenceId(
                            stableId,
                            codeToId[language as keyof typeof codeToId] || "1"
                        )) || "";
                    }
                    return {
                        slug: slug || null,
                        stableId,
                    };
                }
            } else if (data.data && data.data.length > 0) {
                const found = data.data.find((r: any) => r.title === title);
                if (found) {
                    const stableId = getReportStableId(found);
                    let slug = typeof found.slug === "string" ? found.slug.trim() : "";
                    if (!slug && stableId) {
                        slug = (await fetchReportBackendSlugByReferenceId(
                            stableId,
                            codeToId[language as keyof typeof codeToId] || "1"
                        )) || "";
                    }
                    return {
                        slug: slug || null,
                        stableId,
                    };
                }
            }
        }
    } catch (error) {
        console.error('Error fetching report slug:', error);
    }
    return null;
}

export async function fetchReportIdByTitle(title: string, language: string): Promise<number | null> {
    const result = await fetchReportSlugByTitle(title, language);
    if (result?.stableId == null) return null;
    const parsed = Number(result.stableId);
    return Number.isNaN(parsed) ? null : parsed;
}
