import { NextResponse } from "next/server";

const BASE_URL = "https://www.synapseaglobal.com";

const languages = ["en", "fr", "es", "de", "ja", "zh", "ko", "ar"] as const;

const staticPages = [
    "",                 // homepage
    "about",
    "contact",
    "privacy",
    "terms-of-service",
    "cookie-policy",
    "sitemap",          // html sitemap page
];

function getPriority(path: string): string {
    if (path === "") return "1.0"; // homepage
    if (["about", "contact"].includes(path)) return "0.9";
    return "0.6"; // Legal, HTML sitemap
}

function getChangeFreq(path: string): string {
    return "monthly";
}

function buildUrlNode(path: string, lang: string) {
    // 1. Determine the Loc for THIS url node
    // English -> Root (no /en), Others -> /lang
    const isEn = lang === "en";
    const basePath = isEn ? BASE_URL : `${BASE_URL}/${lang}`;
    const loc = `${basePath}${path ? `/${path}` : ""}`;

    // 2. Build the alternates block (same for all variants of this page)
    const alternates = languages
        .map(
            (l) => {
                const lIsEn = l === "en";
                const href = lIsEn
                    ? `${BASE_URL}${path ? `/${path}` : ""}`
                    : `${BASE_URL}/${l}${path ? `/${path}` : ""}`;
                return `
    <xhtml:link rel="alternate" hreflang="${l}"
      href="${href}" />`;
            }
        )
        .join("");

    // x-default: User explicitly requested pointing to English path
    // Since /en redirects to /, we point to the canonical English URL which is "/"
    // Best practice: Link to the 200 OK version.
    // Use the Root path for x-default.
    const xDefaultHref = `${BASE_URL}${path ? `/${path}` : ""}`;
    const xDefault = `
    <xhtml:link rel="alternate" hreflang="x-default"
      href="${xDefaultHref}" />`;

    const priority = getPriority(path);
    const changeFreq = getChangeFreq(path);

    return `
<url>
  <loc>${loc}</loc>
  ${alternates}
  ${xDefault}
  <priority>${priority}</priority>
  <changefreq>${changeFreq}</changefreq>
</url>`;
}

export async function GET() {
    // Generate a node for EVERY language for EVERY page
    const nodes: string[] = [];

    staticPages.forEach(path => {
        languages.forEach(lang => {
            nodes.push(buildUrlNode(path, lang));
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
