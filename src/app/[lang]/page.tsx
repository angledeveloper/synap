import { Metadata } from "next";
import { codeToId } from "@/lib/utils";
import HomeClient from "./HomeClient";
import { generateSeoMetadata, SeoData, SeoJsonLd } from "@/lib/seo";

async function getHomepageData(languageId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}homepage/${languageId}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching homepage data:", error);
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
    const data = await getHomepageData(languageId);
    const seoData: SeoData | undefined = data?.seo;

    const fallbackMetadata: Metadata = {
        title: "SynapSEA Global | Market Research Reports",
        description: "SynapSEA Global provides comprehensive market research reports...",
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
    const data = await getHomepageData(languageId);

    return (
        <>
            <SeoJsonLd data={data?.seo} />
            <HomeClient />
        </>
    );
}
