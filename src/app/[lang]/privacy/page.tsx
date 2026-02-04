import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
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
    endpoint: `privacy/${languageId}`,
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: "/privacy",
    fallback: {
      title: "Privacy Policy | SynapSEA",
      description:
        "Read SynapSEA Global's privacy policy and learn how we collect, use, and protect your information.",
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
    endpoint: `privacy/${languageId}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <PrivacyClient />
    </>
  );
}
