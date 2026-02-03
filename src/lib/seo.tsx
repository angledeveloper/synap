import { Metadata } from 'next';

export interface SeoData {
    page_url?: string;
    meta_title?: string;
    meta_description?: string;
    other_meta_tags?: string; // Often contains raw HTML meta tags
    primary_keyword?: string;
    secondary_keyword?: string;
    other_seo_tags?: string;
    seo_schema?: string; // JSON-LD string
    canonical_url?: string;
}

export function generateSeoMetadata(seoData: SeoData | null | undefined, fallback: Metadata): Metadata {
    if (!seoData) {
        return fallback;
    }

    const title = seoData.meta_title || fallback.title;
    const description = seoData.meta_description || fallback.description;

    const metadata: Metadata = {
        ...fallback,
        title,
        description,
        openGraph: {
            ...fallback.openGraph,
            title: title as string,
            description: description as string,
        },
        twitter: {
            ...fallback.twitter,
            title: title as string,
            description: description as string,
        },
        keywords: [
            seoData.primary_keyword,
            seoData.secondary_keyword
        ].filter(Boolean) as string[],
    };

    if (seoData.canonical_url) {
        metadata.alternates = {
            ...fallback.alternates,
            canonical: seoData.canonical_url,
        };
    }

    // Note: other_meta_tags and other_seo_tags are often raw HTML strings
    // Next.js Metadata API doesn't support injecting raw HTML directly into <head> easily via the Metadata object
    // deeply. For now, we map the standard fields.

    return metadata;
}

export function SeoJsonLd({ data }: { data: SeoData | null | undefined }) {
    if (!data?.seo_schema) return null;

    try {
        // Validate JSON if possible, but mainly just render it.
        // We minify/normalize the JSON string to avoid hydration mismatches (e.g., \r\n vs \n).
        let schema = typeof data.seo_schema === 'string'
            ? data.seo_schema
            : JSON.stringify(data.seo_schema);

        // Try to parse and re-stringify to ensure consistent formatting across server/client
        try {
            const parsed = JSON.parse(schema);
            schema = JSON.stringify(parsed);
        } catch (e) {
            // If parsing fails, just simple normalize
            schema = schema.replace(/\r\n/g, '').replace(/\n/g, '');
        }

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: schema }}
            />
        );
    } catch (e) {
        console.error("Error parsing SEO Schema", e);
        return null;
    }
}
