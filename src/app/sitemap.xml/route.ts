import { NextResponse } from "next/server";
import { supportedLanguages } from "@/lib/utils";

const BASE_URL = "https://www.synapseaglobal.com";
const SITEMAP_TYPES = ["static-pages", "categories", "reports"] as const;
const languageCodes = supportedLanguages.map((lang) => lang.code);

export async function GET() {
  const nodes = languageCodes
    .flatMap((lang) =>
      SITEMAP_TYPES.map(
        (type) => `
  <sitemap>
    <loc>${BASE_URL}/sitemaps/${lang}-${type}.xml</loc>
  </sitemap>`,
      ),
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nodes}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
