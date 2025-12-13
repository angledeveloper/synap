import { NextResponse } from "next/server";

const BASE_URL = "https://www.synapseaglobal.com";

const languages = ["en", "fr", "es", "de", "ja", "zh", "ko", "ar"] as const;

const staticPages = [
    "",                 // homepage
    "reports",          // reports store
    "about",
    "contact",
    "privacy",
    "terms-of-service",
];

function buildAlternates(path: string) {
    const links = languages
        .map(
            (lang) => {
                const href = lang === "en"
                    ? `${BASE_URL}${path ? `/${path}` : ""}`
                    : `${BASE_URL}/${lang}${path ? `/${path}` : ""}`;
                return `
    <xhtml:link rel="alternate" hreflang="${lang}"
      href="${href}" />`
            }
        )
        .join("");

    const xDefault = `
    <xhtml:link rel="alternate" hreflang="x-default"
      href="${BASE_URL}${path ? `/${path}` : ""}" />`;

    return links + xDefault;
}

function getPriority(path: string): string {
    if (path === "") return "1.0"; // homepage
    if (path === "reports") return "0.9";
    if (["about", "contact"].includes(path)) return "0.7";
    return "0.4"; // legal, etc.
}

export async function GET() {
    const urls = staticPages
        .map((path) => {
            // homepage special-case: /en, not /en/
            // Update: 'en' is now root, so it's just BASE_URL
            const loc = `${BASE_URL}${path ? `/${path}` : ""}`;
            const alternates = buildAlternates(path);
            const priority = getPriority(path);

            return `
<url>
  <loc>${loc}</loc>
  ${alternates}
  <priority>${priority}</priority>
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
