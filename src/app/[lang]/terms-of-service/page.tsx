import { Metadata } from "next";
import { codeToId } from "@/lib/utils";
import TermsClient from "./TermsClient";
import { generateSeoMetadata, SeoData, SeoJsonLd } from "@/lib/seo";

async function getTermsData(languageId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}terms/${languageId}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching terms data:", error);
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
    const data = await getTermsData(languageId);
    const seoData: SeoData | undefined = data?.seo;

    const fallbackMetadata: Metadata = {
        title: "Terms of Service | SynapSEA Global",
        description: "Read our terms of service.",
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
    const data = await getTermsData(languageId);

    return (
        <>
            <SeoJsonLd data={data?.seo} />
            <TermsClient />
        </>
    );
}
