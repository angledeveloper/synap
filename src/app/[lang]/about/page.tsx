import { Metadata } from "next";
import { codeToId } from "@/lib/utils";
import AboutClient from "./AboutClient";
import { generateSeoMetadata, SeoData, SeoJsonLd } from "@/lib/seo";

async function getAboutData(languageId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}aboutus/${languageId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching about data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();
  const data = await getAboutData(languageId);
  const seoData: SeoData | undefined = data?.seo;

  const fallbackMetadata: Metadata = {
    title: "About Us | SynapSEA Global",
    description: "Learn more about SynapSEA Global and our mission.",
  };

  return generateSeoMetadata(seoData, fallbackMetadata);
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();
  const data = await getAboutData(languageId);

  return (
    <>
      <SeoJsonLd data={data?.seo} />
      <AboutClient />
    </>
  );
}
