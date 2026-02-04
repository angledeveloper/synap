import type { Metadata } from "next";
import AboutClient from "./AboutClient";
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
    endpoint: `aboutus/${languageId}`,
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: "/about",
    fallback: {
      title: "About Us | SynapSEA",
      description:
        "Learn about SynapSEA Global, our mission, and how we deliver market intelligence across industries.",
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
    endpoint: `aboutus/${languageId}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <AboutClient />
    </>
  );
}
