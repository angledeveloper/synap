import { Metadata } from "next";
import { codeToId } from "@/lib/utils";
import CheckoutClient from "./CheckoutClient";
import { generateSeoMetadata, SeoData, SeoJsonLd } from "@/lib/seo";

async function getCheckoutData(languageId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
    if (!baseUrl) return null;

    try {
        const res = await fetch(`${baseUrl}checkout/${languageId}`, {
            method: 'POST',
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching checkout data:", error);
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
    const data = await getCheckoutData(languageId);
    const seoData: SeoData | undefined = data?.seo;

    const fallbackMetadata: Metadata = {
        title: "Checkout | SynapSEA Global",
        description: "Secure checkout for your market research report.",
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
    const data = await getCheckoutData(languageId);

    return (
        <>
            <SeoJsonLd data={data?.seo} />
            <CheckoutClient />
        </>
    );
}
