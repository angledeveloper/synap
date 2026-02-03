import type { Metadata } from "next";
import ContactClient from "./ContactClient";
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
    endpoint: `contactus/${languageId}`,
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: "/contact",
    fallback: {
      title: "Contact Us | SynapSEA",
      description:
        "Contact SynapSEA Global to discuss your research needs, custom reports, or partnership opportunities.",
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
    endpoint: `contactus/${languageId}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <ContactClient />
    </>
  );
}
