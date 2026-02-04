import { NextRequest, NextResponse } from "next/server";
import { supportedLanguages } from "@/lib/utils";

const BASE_URL = "https://www.synapseaglobal.com";
const languageCodes = supportedLanguages.map((lang) => lang.code);
const SITEMAP_TYPES = ["static-pages", "categories", "reports"] as const;
type SitemapType = (typeof SITEMAP_TYPES)[number];

const staticPages = [
  "",
  "about",
  "contact",
  "privacy",
  "terms-of-service",
  "cookie-policy",
  "sitemap.html",
  "reports",
];

export const dynamic = "force-static";
export const revalidate = 86400;
const CACHE_CONTROL_HEADER =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400";

type SitemapParams = {
  sitemap: string;
};

function parseSitemapParam(value: string): { lang: string; type: SitemapType } | null {
  if (!value.endsWith(".xml")) return null;
  const withoutExtension = value.slice(0, -4);
  const dashIndex = withoutExtension.indexOf("-");
  if (dashIndex === -1) return null;

  const lang = withoutExtension.slice(0, dashIndex);
  const type = withoutExtension.slice(dashIndex + 1) as SitemapType;

  if (!languageCodes.includes(lang)) return null;
  if (!SITEMAP_TYPES.includes(type)) return null;

  return { lang, type };
}

function buildLoc(path: string, lang: string) {
  const base = lang === "en" ? BASE_URL : `${BASE_URL}/${lang}`;
  if (!path) return base;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${base}/${normalized}`;
}

function wrapUrlset(nodes: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nodes}
</urlset>`;
}

function buildUrlNode(loc: string, changefreq: string) {
  return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
  </url>`;
}

function getStaticChangefreq(path: string) {
  if (path === "") return "monthly";
  if (["about", "contact"].includes(path)) return "monthly";
  return "monthly";
}

function getLanguageId(lang: string) {
  const match = supportedLanguages.find((entry) => entry.code === lang);
  return match?.id ?? supportedLanguages[0]?.id ?? "1";
}

async function getCategories(lang: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return [];
    const languageId = getLanguageId(lang);
    const res = await fetch(`${baseUrl}homepage/${languageId}`, { next: { revalidate: 86400 } });
    const data = await res.json();
    if (data && Array.isArray(data.report_store_dropdown)) {
      return data.report_store_dropdown;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

function buildStaticPagesXml(lang: string) {
  const nodes = staticPages
    .map((path) => {
      const loc = buildLoc(path, lang);
      const changefreq = getStaticChangefreq(path);
      return buildUrlNode(loc, changefreq);
    })
    .join("");
  return wrapUrlset(nodes);
}

async function buildCategoriesXml(lang: string) {
  const categories = await getCategories(lang);

  const uniqueCategories = new Map<string, any>();
  categories.forEach((category: any) => {
    const refId = category.category_reference_id || category.category_id;
    if (!refId) return;
    if (!uniqueCategories.has(String(refId))) {
      uniqueCategories.set(String(refId), category);
    }
  });

  const nodes = Array.from(uniqueCategories.values())
    .map((category) => {
      const categoryId = category.category_id || category.category_reference_id;
      if (!categoryId) return "";
      const loc = buildLoc(`reports?category=${encodeURIComponent(String(categoryId))}`, lang);
      return buildUrlNode(loc, "weekly");
    })
    .filter(Boolean)
    .join("");

  return wrapUrlset(nodes);
}

async function getAllReports(lang: string) {
  const reports: any[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) return [];

  const categories = await getCategories(lang);
  const categoryIds = categories.map((category: any) => category.category_reference_id || category.category_id);
  const languageId = getLanguageId(lang);

  const MAX_PAGES = 50;

  for (const catId of categoryIds) {
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      try {
        const formData = new FormData();
        formData.append("language_id", String(languageId));
        formData.append("page", page.toString());
        formData.append("per_page", perPage.toString());
        formData.append("category_reference_id", String(catId));

        const response = await fetch(`${baseUrl}reports_store_page`, {
          method: "POST",
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

async function fetchReportSlugByReferenceId(referenceId: string | number, lang: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;
    const languageId = getLanguageId(lang);
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
    const trimmedBackendSlug = typeof backendSlug === "string" ? backendSlug.trim() : "";
    return trimmedBackendSlug || null;
  } catch (error) {
    console.error("Error fetching report slug for sitemap:", error);
    return null;
  }
}

async function resolveReportSlug(report: any, lang: string, cache: Map<string, string | null>) {
  const existingSlug = typeof report?.slug === "string" ? report.slug.trim() : "";
  if (existingSlug) return existingSlug;

  const refId = report?.report_reference_id || report?.report_identity?.report_reference_id || report?.id;
  if (!refId) return null;

  const key = String(refId);
  if (cache.has(key)) return cache.get(key) || null;

  const resolved = await fetchReportSlugByReferenceId(refId, lang);
  cache.set(key, resolved);
  return resolved;
}

async function buildReportsXml(lang: string) {
  const reports = await getAllReports(lang);

  const uniqueReports = new Map<string, any>();
  reports.forEach((report: any) => {
    const refId = report.report_reference_id || report.id;
    if (!refId) return;
    if (!uniqueReports.has(String(refId))) {
      uniqueReports.set(String(refId), report);
    }
  });

  const slugCache = new Map<string, string | null>();
  const nodes: string[] = [];
  for (const report of Array.from(uniqueReports.values())) {
    const refId =
      report.report_reference_id ||
      report.report_identity?.report_reference_id ||
      report.id;
    if (!refId) continue;

    const resolvedSlug = await resolveReportSlug(report, lang, slugCache);
    if (!resolvedSlug) continue;

    const slug = `${resolvedSlug}-${refId}`;
    const loc = buildLoc(`reports/${slug}`, lang);
    nodes.push(buildUrlNode(loc, "daily"));
  }

  return wrapUrlset(nodes.join(""));
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<SitemapParams> }
) {
  const { sitemap } = await params;
  const parsed = parseSitemapParam(sitemap);
  if (!parsed) {
    return new NextResponse("Not found", { status: 404 });
  }

  let xml = "";
  if (parsed.type === "static-pages") {
    xml = buildStaticPagesXml(parsed.lang);
  } else if (parsed.type === "categories") {
    xml = await buildCategoriesXml(parsed.lang);
  } else if (parsed.type === "reports") {
    xml = await buildReportsXml(parsed.lang);
  }

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": CACHE_CONTROL_HEADER,
    },
  });
}
