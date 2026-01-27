import { NextResponse } from "next/server";

const BASE_URL = "https://www.synapseaglobal.com";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/static-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/reports.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
