import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import SeoSchema from "@/components/seo/SeoSchema";
import { buildSeoMetadata, fetchSeoData } from "@/lib/seo";
import { codeToId } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = (await params) || ({} as any);
  const langCode = lang || "en";
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];

  const { seo } = await fetchSeoData({
    endpoint: `https://dashboard.synapseaglobal.com/api/checkout/${languageId}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: `/reports/${id}/checkout`,
    fallback: {
      title: "Checkout | SynapSEA",
      description:
        "Complete your report purchase securely with SynapSEA Global's checkout.",
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];

  const { schemas } = await fetchSeoData({
    endpoint: `https://dashboard.synapseaglobal.com/api/checkout/${languageId}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <CheckoutClient />
    </>
  );
}
