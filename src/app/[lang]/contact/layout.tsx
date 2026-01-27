import { Metadata } from "next";
import { supportedLanguages } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;

    const alternates: Record<string, string> = {};
    supportedLanguages.forEach((l) => {
        alternates[l.code] = `/${l.code}/contact`;
    });
    alternates['x-default'] = '/contact';

    // Fetch contact data logic could be here for better titles, but for now using static or simple defaults
    // since contact data is fetched in client. 

    return {
        title: "Contact Us | SynapSEA",
        description: "Get in touch with SynapSEA Global for your market research needs. Our team is ready to assist you with inquiries, custom research requests, and support.",
        alternates: {
            canonical: `/${lang}/contact`,
            languages: alternates,
        },
        openGraph: {
            title: "Contact Us | SynapSEA",
            description: "Get in touch with SynapSEA Global for your market research needs.",
            type: "website",
        },
    };
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
