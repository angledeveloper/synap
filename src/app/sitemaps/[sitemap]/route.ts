import { NextResponse } from "next/server";
import { slugify, supportedLanguages } from "@/lib/utils";

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
export const revalidate = 3600;

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

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return [];
    const res = await fetch(`${baseUrl}homepage/1`, { next: { revalidate: 3600 } });
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
  const categories = await getCategories();

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
      const refId = category.category_reference_id || category.category_id;
      if (!refId) return "";
      const slugName = category.category_name || "category";
      const slug = slugify(slugName, refId);
      const loc = buildLoc(`reports/${slug}`, lang);
      return buildUrlNode(loc, "weekly");
    })
    .filter(Boolean)
    .join("");

  return wrapUrlset(nodes);
}

async function getAllReports() {
  const reports: any[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) return [];

  const categories = await getCategories();
  const categoryIds = categories.map((category: any) => category.category_reference_id || category.category_id);

  const MAX_PAGES = 50;

  for (const catId of categoryIds) {
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      try {
        const formData = new FormData();
        formData.append("language_id", "1");
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

async function buildReportsXml(lang: string) {
  const reports = await getAllReports();

  const uniqueReports = new Map<string, any>();
  reports.forEach((report: any) => {
    const refId = report.report_reference_id || report.id;
    if (!refId) return;
    if (!uniqueReports.has(String(refId))) {
      uniqueReports.set(String(refId), report);
    }
  });

  const nodes = Array.from(uniqueReports.values())
    .map((report) => {
      const titleVal = report.report_reference_title || report.title;
      const refId = report.report_reference_id || report.id;
      if (!refId || !titleVal) return "";
      const slug = slugify(titleVal, refId);
      const loc = buildLoc(`reports/${slug}`, lang);
      return buildUrlNode(loc, "daily");
    })
    .filter(Boolean)
    .join("");

  return wrapUrlset(nodes);
}

export async function GET(_: Request, { params }: { params: SitemapParams }) {
  const parsed = parseSitemapParam(params.sitemap);
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
    headers: { "Content-Type": "application/xml" },
  });
}
