import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import SeoSchema from "@/components/seo/SeoSchema";
import { buildSeoMetadata, fetchSeoData } from "@/lib/seo";
import { codeToId, supportedLanguages } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const langObj =
    supportedLanguages.find((l) => l.code === langCode) ||
    supportedLanguages[0];
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];

  const { seo } = await fetchSeoData({
    endpoint: `homepage/${languageId}`,
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: "/",
    fallback: {
      title: `Home | ${langObj.label}`,
      description: `Welcome to the ${langObj.label} version of our site.`,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];
  const { schemas } = await fetchSeoData({
    endpoint: `homepage/${languageId}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <HomeClient />
    </>
  );
}
