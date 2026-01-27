import { NextResponse } from "next/server";
import { slugify, supportedLanguages } from "@/lib/utils";

const BASE_URL = "https://www.synapseaglobal.com";
const languages = supportedLanguages.map(l => l.code);

// Cache for 1 hour
export const dynamic = 'force-static';
export const revalidate = 3600;

async function getCategories() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) return [];

        // Fetch homepage data for English to get base category data
        // We assume categories are consistent across languages in terms of IDs/Reference IDs
        // But we need translated slugs if possible? 
        // User said: "Category slug is: Stable, Language-agnostic, Derived from category_reference_id"
        // So we don't need translated slugs. We just need the list of categories.
        const res = await fetch(`${baseUrl}homepage/1`, { next: { revalidate: 3600 } });
        const data = await res.json();

        // Extract categories from report_store_dropdown or similar structure
        if (data && data.report_store_dropdown && Array.isArray(data.report_store_dropdown)) {
            return data.report_store_dropdown;
        }
        return [];
    } catch (e) {
        console.error("Error fetching categories for sitemap:", e);
        return [];
    }
}

function buildUrlNode(category: any, lang: string) {
    const refId = category.category_reference_id || category.category_id;
    const slugName = category.category_name || "category";
    const slug = slugify(slugName, refId);

    // 1. Determine Loc for THIS node
    const isEn = lang === "en";
    // English -> /reports/slug, Others -> /lang/reports/slug
    // Assuming /reports route exists at root for English
    const loc = isEn
        ? `${BASE_URL}/reports/${slug}`
        : `${BASE_URL}/${lang}/reports/${slug}`;

    // 2. Alternates (same for all variants)
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
  <priority>0.8</priority>
  <changefreq>weekly</changefreq>
</url>`;
}

export async function GET() {
    const categories = await getCategories();

    // Deduplicate by reference ID
    const uniqueCategories = new Map();
    categories.forEach((cat: any) => {
        const refId = cat.category_reference_id || cat.category_id;
        if (!uniqueCategories.has(refId)) {
            uniqueCategories.set(refId, cat);
        }
    });

    const nodes: string[] = [];
    uniqueCategories.forEach((category) => {
        languages.forEach((lang) => {
            nodes.push(buildUrlNode(category, lang));
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
