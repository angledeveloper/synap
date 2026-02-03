import { Metadata } from "next";
import { codeToId } from "@/lib/utils";
import ContactClient from "./ContactClient";
import { generateSeoMetadata, SeoData, SeoJsonLd } from "@/lib/seo";

async function getContactData(languageId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}contactus/${languageId}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching contact data:", error);
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
    const data = await getContactData(languageId);
    const seoData: SeoData | undefined = data?.seo;

    const fallbackMetadata: Metadata = {
        title: "Contact Us | SynapSEA Global",
        description: "Get in touch with us for your market research needs.",
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
    const data = await getContactData(languageId);

    return (
        <>
            <SeoJsonLd data={data?.seo} />
            <ContactClient />
        </>
    );
}
