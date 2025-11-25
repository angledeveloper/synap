import { codeToId } from "@/lib/utils";

/**
 * Fetches the report ID by title using the reports_store_page API.
 * This is a workaround for the deep_search API missing report IDs.
 */
export async function fetchReportIdByTitle(title: string, language: string): Promise<number | null> {
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
                            return foundReport.id;
                        }
                    }
                }
            }

            // Fallback to direct data check
            if (data.reports && data.reports.length > 0) {
                const found = data.reports.find((r: any) => r.title === title);
                if (found) return found.id;
            } else if (data.data && data.data.length > 0) {
                const found = data.data.find((r: any) => r.title === title);
                if (found) return found.id;
            }
        }
    } catch (error) {
        console.error('Error fetching report ID:', error);
    }
    return null;
}
