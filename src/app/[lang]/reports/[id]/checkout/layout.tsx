import { Metadata } from "next";
import { supportedLanguages } from "@/lib/utils";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
    const { lang, id } = await params;

    const alternates: Record<string, string> = {};
    supportedLanguages.forEach((l) => {
        alternates[l.code] = `/${l.code}/reports/${id}/checkout`;
    });
    alternates['x-default'] = `/reports/${id}/checkout`;

    return {
        title: "Checkout | SynapSEA",
        description: "Secure checkout for your market research report purchase.",
        alternates: {
            canonical: `/${lang}/reports/${id}/checkout`,
            languages: alternates,
        },
        robots: {
            index: false,
            follow: false, // Checkout pages typically shouldn't be indexed to avoid stale carts or dupe content, but if user wants x-default...
            // User asked for "x-default for all pages".
        }
    };
}

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
