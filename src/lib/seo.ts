import type { Metadata } from "next";
import { getLocalizedPath, supportedLanguages } from "@/lib/utils";

type SeoFields = {
  page_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  other_meta_tags?: string | null;
  primary_keyword?: string | null;
  secondary_keyword?: string | null;
  other_seo_tags?: string | null;
  seo_schema?: string | null;
  faq_schema?: string | null;
  database_schema?: string | null;
  [key: string]: unknown;
};

type FetchSeoResult = {
  seo: SeoFields | null;
  data: any | null;
  schemas: string[];
};

type BuildMetadataInput = {
  seo: SeoFields | null | undefined;
  lang: string;
  path: string;
  fallback: {
    title: string;
    description: string;
    keywords?: string[];
  };
  openGraph?: {
    type?: string;
    images?: string[];
  };
};

const SEO_KEYS = [
  "page_url",
  "meta_title",
  "meta_description",
  "other_meta_tags",
  "primary_keyword",
  "secondary_keyword",
  "other_seo_tags",
  "seo_schema",
  "faq_schema",
  "database_schema",
];

const OPEN_GRAPH_TYPES = [
  "website",
  "article",
  "profile",
  "video.other",
  "music.song",
  "book",
  "music.album",
  "music.playlist",
  "music.radio_station",
  "video.movie",
  "video.episode",
  "video.tv_show",
] as const;
type OpenGraphType = (typeof OPEN_GRAPH_TYPES)[number];

function stripHtml(input: unknown): string {
  if (input == null) return "";
  const value = String(input);
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isSeoLike(value: any): value is SeoFields {
  if (!value || typeof value !== "object") return false;
  return SEO_KEYS.some((key) => key in value);
}

function safeJsonParse(value: string): any | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

type MetaEntry = { name?: string; property?: string; httpEquiv?: string; content?: string };

function extractMetaEntriesFromHtml(html: string): MetaEntry[] {
  const entries: MetaEntry[] = [];
  const tagRegex = /<meta\s+([^>]*?)\/?>(?:\s*<\/meta>)?/gi;
  const attrRegex = /([a-zA-Z:-]+)\s*=\s*["']([^"']*)["']/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html))) {
    const attrs = match[1];
    const entry: { name?: string; property?: string; httpEquiv?: string; content?: string } = {};
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrs))) {
      const key = attrMatch[1].toLowerCase();
      const value = attrMatch[2];
      if (key === "name") entry.name = value;
      if (key === "property") entry.property = value;
      if (key === "http-equiv") entry.httpEquiv = value;
      if (key === "content") entry.content = value;
    }
    if (entry.content && (entry.name || entry.property || entry.httpEquiv)) {
      entries.push(entry);
    }
  }
  return entries;
}

function extractMetaEntriesFromRecord(record: Record<string, any>): MetaEntry[] {
  return Object.entries(record)
    .map(([key, value]) => ({ name: key, content: String(value) }))
    .filter((entry) => entry.name && entry.content);
}

function extractMetaEntries(input?: string | null): MetaEntry[] {
  if (!input || typeof input !== "string") return [];
  const trimmed = input.trim();
  if (!trimmed) return [];

  const parsed = safeJsonParse(trimmed);
  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          return {
            name: typeof entry.name === "string" ? entry.name : undefined,
            property: typeof entry.property === "string" ? entry.property : undefined,
            httpEquiv: typeof entry["http-equiv"] === "string" ? entry["http-equiv"] : undefined,
            content: typeof entry.content === "string" ? entry.content : entry.content != null ? String(entry.content) : undefined,
          };
        })
        .filter((entry) => entry && entry.content && (entry.name || entry.property || entry.httpEquiv)) as Array<{
        name?: string;
        property?: string;
        httpEquiv?: string;
        content?: string;
      }>;
    }
    return extractMetaEntriesFromRecord(parsed as Record<string, any>);
  }

  if (/<meta\s/i.test(trimmed)) {
    return extractMetaEntriesFromHtml(trimmed);
  }

  if (/[=:]/.test(trimmed)) {
    const entries: Array<{ name?: string; content?: string }> = [];
    const segments = trimmed.split(/[;,]/).map((seg) => seg.trim()).filter(Boolean);
    segments.forEach((segment) => {
      const [rawKey, ...rest] = segment.split(/[:=]/);
      const key = rawKey?.trim();
      const content = rest.join(":").trim();
      if (key && content) entries.push({ name: key, content });
    });
    return entries;
  }

  return [];
}

function mergeMetaTags(...inputs: Array<string | null | undefined>) {
  const record: Record<string, string> = {};
  inputs.forEach((input) => {
    extractMetaEntries(input).forEach((entry) => {
      const key = entry.name || entry.property || entry.httpEquiv;
      if (!key || !entry.content) return;
      if (!(key in record)) {
        record[key] = entry.content;
      }
    });
  });
  return record;
}

function splitKeywords(value?: string | null): string[] {
  if (!value || typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (/<meta\s/i.test(trimmed)) return [];
  if (/\{[\s\S]*\}/.test(trimmed) && safeJsonParse(trimmed)) return [];
  if (/\w+\s*=/.test(trimmed)) return [];

  return trimmed
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    result.push(trimmed);
  });
  return result;
}

function normalizeSchema(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = safeJsonParse(trimmed);
    if (parsed) {
      try {
        return JSON.stringify(parsed);
      } catch {
        return null;
      }
    }
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return trimmed;
    }
  }
  return null;
}

function extractSchemas(seo: SeoFields | null | undefined, data: any): string[] {
  const sources: Array<unknown> = [];
  if (seo) {
    sources.push(seo.seo_schema, seo.faq_schema, seo.database_schema);
  }
  if (data && typeof data === "object") {
    sources.push(data.seo_schema, data.faq_schema, data.database_schema);
  }
  const schemas = sources
    .map(normalizeSchema)
    .filter((schema): schema is string => Boolean(schema));
  return uniqueStrings(schemas);
}

function resolveSeoPayload(data: any): SeoFields | null {
  if (!data || typeof data !== "object") return null;
  const candidates = [
    data.seo,
    data.data?.seo,
    data.page?.seo,
    data.about_us?.seo,
    data.contactus?.seo,
    data.content?.seo,
    data.checkout_page?.seo,
    data.terms?.seo,
    data.privacy?.seo,
    data.faq?.seo,
  ];
  return (candidates.find(isSeoLike) as SeoFields) || null;
}

function buildAlternates(path: string, lang: string) {
  const languages: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    languages[lang.code] = getLocalizedPath(path, lang.code);
  });
  languages["x-default"] = getLocalizedPath(path, "en");

  return {
    canonical: getLocalizedPath(path, lang),
    languages,
  };
}

function normalizeOpenGraphType(value?: string): OpenGraphType {
  if (!value) return "website";
  return OPEN_GRAPH_TYPES.includes(value as OpenGraphType) ? (value as OpenGraphType) : "website";
}

export function buildSeoMetadata({ seo, lang, path, fallback, openGraph }: BuildMetadataInput): Metadata {
  const title = stripHtml(seo?.meta_title || fallback.title);
  const description = stripHtml(seo?.meta_description || fallback.description);

  const keywordList = uniqueStrings([
    ...(fallback.keywords || []),
    ...splitKeywords(seo?.primary_keyword as string | null | undefined),
    ...splitKeywords(seo?.secondary_keyword as string | null | undefined),
    ...splitKeywords(seo?.other_seo_tags as string | null | undefined),
  ]);

  const otherMeta = mergeMetaTags(seo?.other_meta_tags as string | null | undefined, seo?.other_seo_tags as string | null | undefined);

  const alternates = buildAlternates(path, lang);
  const images = openGraph?.images?.filter(Boolean) || [];
  const openGraphType = normalizeOpenGraphType(openGraph?.type);

  const metadata: Metadata = {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: openGraphType,
      images: images.length ? images.map((url) => ({ url })) : undefined,
      locale: lang,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images: images.length ? images : undefined,
    },
    keywords: keywordList.length ? keywordList : undefined,
    other: Object.keys(otherMeta).length ? otherMeta : undefined,
  };

  return metadata;
}

export async function fetchSeoData({
  endpoint,
  method = "GET",
  body,
  headers,
  revalidate = 86400,
}: {
  endpoint: string;
  method?: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
  revalidate?: number;
}): Promise<FetchSeoResult> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DB_URL || "";
    const isAbsolute = endpoint.startsWith("http://") || endpoint.startsWith("https://");
    if (!isAbsolute && !baseUrl) return { seo: null, data: null, schemas: [] };

    const url = isAbsolute ? endpoint : `${baseUrl}${endpoint}`;

    if (!url) return { seo: null, data: null, schemas: [] };

    const response = await fetch(url, {
      method,
      body,
      headers,
      next: { revalidate },
    });

    if (!response.ok) {
      return { seo: null, data: null, schemas: [] };
    }

    const data = await response.json();
    const seo = resolveSeoPayload(data);
    const schemas = extractSchemas(seo, data);

    return { seo, data, schemas };
  } catch (error) {
    console.error("SEO fetch error:", error);
    return { seo: null, data: null, schemas: [] };
  }
}

export function extractSeoFromData(data: any): SeoFields | null {
  return resolveSeoPayload(data);
}

export function getSeoSchemas(seo: SeoFields | null | undefined, data: any): string[] {
  return extractSchemas(seo, data);
}
