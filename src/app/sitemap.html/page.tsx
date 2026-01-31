import SitemapHtmlPage from "../[lang]/sitemap.html/page";

export default async function SitemapHtmlRoot() {
  return SitemapHtmlPage({
    params: Promise.resolve({ lang: "en" }),
  });
}
