import SitemapHtmlPage from "../[lang]/sitemap.html/page";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function SitemapHtmlRoot() {
  return SitemapHtmlPage({
    params: Promise.resolve({ lang: "en" }),
  });
}
