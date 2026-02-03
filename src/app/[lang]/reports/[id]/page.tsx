import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReportView from './ReportView';
import { extractIdFromSlug, codeToId } from '@/lib/utils';
import { supportedLanguages } from '@/lib/utils';
import { generateSeoMetadata, SeoJsonLd } from "@/lib/seo";

// Helper to strictly fetch report by Reference ID
async function fetchReportStrict(baseUrl: string, languageId: string, referenceId: string) {
  try {
    const formData = new FormData();
    formData.append('report_reference_id', referenceId);
    formData.append('language_id', languageId);

    const res = await fetch(`${baseUrl}reports_store`, {
      method: "POST",
      body: formData,
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.report) return data;
    }
  } catch (e) {
    console.error("Error strictly fetching report:", e);
  }
  return null;
}

async function getReportData(id: string, languageId: string, referenceId?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) return null;

  // 1. Try with provided reference ID (Ideal case)
  if (referenceId) {
    const data = await fetchReportStrict(baseUrl, languageId, referenceId);
    if (data) return data;
  }

  // Without a reference ID, we cannot securely find the report.
  // Direct bootstrap search is forbidden.
  return null;
}

function buildCanonicalSlug({
  report,
  data,
  referenceId,
  fallbackId,
}: {
  report: any;
  data: any;
  referenceId?: string;
  fallbackId: string;
}): string | null {
  const reportSeo = data?.data?.seo;
  const backendSlug = report?.slug ?? reportSeo?.slug ?? data?.slug;
  const reportIdentity = report?.report_identity ?? data?.report_identity;
  const reportReferenceId =
    reportIdentity?.report_reference_id ?? report?.report_reference_id;
  const stableId = reportReferenceId ?? report?.id ?? referenceId;
  const trimmedBackendSlug =
    typeof backendSlug === 'string' ? backendSlug.trim() : '';

  if (trimmedBackendSlug && stableId) {
    return `${trimmedBackendSlug}-${stableId}`;
  }

  return null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const { ref_id } = await searchParams;

  // id is the slug
  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();
  const idFromSlug = extractIdFromSlug(id);
  const referenceId = typeof ref_id === 'string' ? ref_id : idFromSlug;

  const data = await getReportData(id, languageId, referenceId);
  const report = data?.data?.report;

  if (!report) {
    return {
      title: 'Report Not Found | SynapSEA',
      description: 'The requested market research report could not be found.',
    };
  }

  const canonicalSlug = buildCanonicalSlug({
    report,
    data,
    referenceId,
    fallbackId: id,
  });
  if (!canonicalSlug) {
    return {
      title: 'Report Not Found | SynapSEA',
      description: 'The requested market research report could not be found.',
    };
  }
  /*
  const canonicalUrl = `/${lang}/reports/${canonicalSlug}`;
  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = `/${l.code}/reports/${canonicalSlug}`;
  });
  alternates['x-default'] = `/reports/${canonicalSlug}`;

  return {
    title: `${report.title} | SynapSEA`,
    description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
    alternates: {
      canonical: canonicalUrl,
      languages: alternates
    },
    openGraph: {
      title: report.title,
      description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
      images: report.image ? [{ url: report.image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
      images: report.image ? [report.image] : [],
      type: 'article',
    }
  };
  */

  // Update: Use Dynamic SEO from API
  const seoData = data?.data?.seo;

  const fallbackMetadata: Metadata = {
    title: `${report.title} | SynapSEA`,
    description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
    openGraph: {
      title: report.title,
      description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
      images: report.image ? [{ url: report.image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: report.title,
      description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title,
      images: report.image ? [report.image] : [],
    }
  }

  return generateSeoMetadata(seoData, fallbackMetadata);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, id } = await params;
  const search = await searchParams;
  const { ref_id } = search;

  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();

  // Extract ID from slug (works for both old ID and new Reference ID style URLs)
  const idFromSlug = extractIdFromSlug(id);

  // Use provided ref_id OR fall back to extracted ID from slug
  // This supports both ?ref_id=123 (old/secure way) AND /title-123 (new SEO way)
  const referenceId = typeof ref_id === 'string' ? ref_id : idFromSlug;

  const reportData = await getReportData(id, languageId, referenceId);

  if (!reportData || !reportData.data || !reportData.data.report) {
    return notFound();
  }

  const canonicalSlug = buildCanonicalSlug({
    report: reportData.data.report,
    data: reportData,
    referenceId,
    fallbackId: id,
  });

  if (!canonicalSlug || canonicalSlug !== id) {
    return notFound();
  }

  return (
    <>
      <SeoJsonLd data={reportData?.data?.seo} />
      <ReportView data={reportData} lang={lang} id={id} refId={referenceId} />
    </>
  );
}
