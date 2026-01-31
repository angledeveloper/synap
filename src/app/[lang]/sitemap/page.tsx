import { redirect } from "next/navigation";
import { supportedLanguages } from "@/lib/utils";

const languageCodes = supportedLanguages.map((lang) => lang.code);

function getLanguageParam(rawLang?: string) {
  if (rawLang && languageCodes.includes(rawLang)) {
    return rawLang;
  }
  return "en";
}

export default async function SitemapRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) || ({} as { lang?: string });
  const language = getLanguageParam(lang);
  const destination = language === "en" ? "/sitemap.html" : `/${language}/sitemap.html`;
  redirect(destination);
}
