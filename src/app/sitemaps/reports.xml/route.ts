import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

const BASE_URL = "https://www.synapseaglobal.com";
const languages = ["en", "fr", "es", "de", "ja", "zh", "ko", "ar"] as const;

async function getAllReports() {
    const reports = [];
    let page = 1;
    const perPage = 100; // Fetch in batches
    let hasMore = true;

    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return [];

    while (hasMore) {
        try {
            const formData = new FormData();
            formData.append('language_id', '1'); // Fetch in English to get IDs
            formData.append('page', page.toString());
            formData.append('per_page', perPage.toString());
            formData.append('category_id', 'all');

            const response = await fetch(`${baseUrl}reports_store_page`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) break;

            const data = await response.json();
            const pageReports = data.reports || data.data || [];

            if (pageReports.length === 0) {
                hasMore = false;
            } else {
                reports.push(...pageReports);
                if (page >= (data.totalPages || 0)) {
                    hasMore = false;
                } else {
                    page++;
                }
            }
        } catch (error) {
            console.error('Error fetching reports for sitemap:', error);
            hasMore = false;
        }
    }

    return reports;
}

function buildAlternates(report: any) {
    const slug = slugify(report.title, report.id);
    const links = languages
        .map(
            (lang) => `
    <xhtml:link rel="alternate" hreflang="${lang}"
      href="${BASE_URL}/${lang}/reports/${slug}" />`
        )
        .join("");

    const xDefault = `
    <xhtml:link rel="alternate" hreflang="x-default"
      href="${BASE_URL}/en/reports/${slug}" />`;

    return links + xDefault;
}

export async function GET() {
    const reports = await getAllReports();

    const urls = reports
        .map((report: any) => {
            const slug = slugify(report.title, report.id);
            const loc = `${BASE_URL}/en/reports/${slug}`;
            const alternates = buildAlternates(report);

            return `
<url>
  <loc>${loc}</loc>
  ${alternates}
  <priority>0.8</priority>
</url>`;
        })
        .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
</urlset>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "application/xml" },
    });
}
