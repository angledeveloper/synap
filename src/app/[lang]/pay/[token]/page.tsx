import type { Metadata } from "next";
import CustomPaymentClient from "./CustomPaymentClient";
import SeoSchema from "@/components/seo/SeoSchema";
import { buildSeoMetadata, fetchSeoData, extractSeoFromData } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}): Promise<Metadata> {
  const { lang, token } = (await params) || ({} as any);
  const langCode = lang || "en";

  const tokenResponse = await fetchSeoData({
    endpoint: `https://dashboard.synapseaglobal.com/api/custom-payment/${token}`,
  });

  const seo = tokenResponse.seo || extractSeoFromData(tokenResponse.data);
  const tokenData = tokenResponse.data?.data;
  const reportTitle = typeof tokenData?.report_title === "string" ? tokenData.report_title : null;
  const reportImage = typeof tokenData?.report_image === "string" ? tokenData.report_image : null;

  return buildSeoMetadata({
    seo,
    lang: langCode,
    path: `/pay/${token}`,
    fallback: {
      title: reportTitle ? `${reportTitle} | Checkout` : "Checkout | SynapSEA",
      description: reportTitle
        ? `Complete your purchase for ${reportTitle}.`
        : "Complete your report purchase securely with SynapSEA Global.",
    },
    openGraph: {
      type: "website",
      images: reportImage ? [reportImage] : undefined,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; token: string }>;
}) {
  const { token } = (await params) || ({} as any);
  const { schemas } = await fetchSeoData({
    endpoint: `https://dashboard.synapseaglobal.com/api/custom-payment/${token}`,
  });

  return (
    <>
      <SeoSchema schemas={schemas} />
      <CustomPaymentClient />
    </>
  );
}
