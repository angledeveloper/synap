import { NextResponse } from "next/server";
import { slugify, codeToId, supportedLanguages, targetLanguageIds } from "@/lib/utils";

const BASE_URL = "https://www.synapseaglobal.com";
const languages = supportedLanguages.map(l => l.code);

// Cache for 1 hour
export const dynamic = 'force-static';
export const revalidate = 3600;

// Helper to fetching categories from homepage
async function getCategories() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) return [];
        const res = await fetch(`${baseUrl}homepage/1`, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (data && data.report_store_dropdown && Array.isArray(data.report_store_dropdown)) {
            return data.report_store_dropdown.filter((c: any) => String(c.language_id) === '1');
        }
        return [];
    } catch (e) {
        console.error("Error fetching categories for reports sitemap:", e);
        return [];
    }
}

async function getAllReports() {
    const reports: any[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return [];

    // Get all categories first
    const categories = await getCategories();
    // Use category_reference_id if available, otherwise category_id
    // But API seems to prefer category_reference_id based on useReportsPage hook
    const categoryIds = categories.map((c: any) => c.category_reference_id || c.category_id);

    // Safety limit per category
    const MAX_PAGES = 50;

    // Iterate through each category
    for (const catId of categoryIds) {
        let page = 1;
        const perPage = 100;
        let hasMore = true;

        while (hasMore && page <= MAX_PAGES) {
            try {
                const formData = new FormData();
                formData.append('language_id', '1');
                formData.append('page', page.toString());
                formData.append('per_page', perPage.toString());

                // Important: Use category_reference_id as expected by the API
                formData.append('category_reference_id', String(catId));

                const response = await fetch(`${baseUrl}reports_store_page`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) break;

                const data = await response.json();

                let pageReports = [];
                if (Array.isArray(data)) pageReports = data;
                else if (data.reports) pageReports = data.reports;
                else if (data.data && Array.isArray(data.data)) pageReports = data.data;

                if (!pageReports || pageReports.length === 0) {
                    hasMore = false;
                } else {
                    reports.push(...pageReports);
                    const totalPages = data.totalPages || 0;
                    if (page >= totalPages || totalPages === 0) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                }
            } catch (error) {
                console.error(`Error fetching reports for category ${catId}:`, error);
                hasMore = false;
            }
        }
    }

    return reports;
}

function buildUrlNode(report: any, lang: string) {
    const titleVal = report.report_reference_title || report.title;
    const refId = report.report_reference_id || report.id;
    const slug = slugify(titleVal, refId);

    // 1. Loc
    const isEn = lang === "en";
    const loc = isEn
        ? `${BASE_URL}/reports/${slug}`
        : `${BASE_URL}/${lang}/reports/${slug}`;

    // 2. Alternates
    const alternates = languages
        .map(
            (l) => {
                const lIsEn = l === "en";
                const href = lIsEn
                    ? `${BASE_URL}/reports/${slug}`
                    : `${BASE_URL}/${l}/reports/${slug}`;
                return `
    <xhtml:link rel="alternate" hreflang="${l}"
      href="${href}" />`;
            }
        )
        .join("");

    // x-default -> English
    const xDefault = `
    <xhtml:link rel="alternate" hreflang="x-default"
      href="${BASE_URL}/reports/${slug}" />`;

    return `
<url>
  <loc>${loc}</loc>
  ${alternates}
  ${xDefault}
  <priority>0.7</priority>
  <changefreq>monthly</changefreq>
</url>`;
}

export async function GET() {
    const reports = await getAllReports();

    // Deduplicate by Reference ID!
    // Ensures one conceptual report = 1 set of multilingual URLs
    const uniqueReports = new Map();
    reports.forEach((r: any) => {
        const refId = r.report_reference_id || r.id;
        if (!uniqueReports.has(refId)) {
            uniqueReports.set(refId, r);
        }
    });

    const nodes: string[] = [];
    uniqueReports.forEach((report) => {
        languages.forEach((lang) => {
            nodes.push(buildUrlNode(report, lang));
        });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${nodes.join("")}
</urlset>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "application/xml" },
    });
}
