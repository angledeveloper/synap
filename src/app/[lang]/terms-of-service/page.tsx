import type { Metadata } from "next";
import TermsClient from "./TermsClient";
import SeoSchema from "@/components/seo/SeoSchema";
import { buildSeoMetadata, fetchSeoData } from "@/lib/seo";
import { codeToId } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];

  const { seo } = await fetchSeoData({
    endpoint: `terms/${languageId}`,
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: "/terms-of-service",
    fallback: {
      title: "Terms of Service | SynapSEA",
      description:
        "Review SynapSEA Global's terms of service, governing access to and use of our website and services.",
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
    endpoint: `terms/${languageId}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <TermsClient />
    </>
  );
}
