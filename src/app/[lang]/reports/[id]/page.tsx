import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReportView from './ReportView';
import { extractIdFromSlug, codeToId } from '@/lib/utils';
import SeoSchema from '@/components/seo/SeoSchema';
import { buildSeoMetadata, getSeoSchemas } from '@/lib/seo';

export const revalidate = 3600;
export const dynamic = 'force-static';

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
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const langCode = lang || 'en';

  // id is the slug
  const languageId = (codeToId[langCode as keyof typeof codeToId] || codeToId['en']).toString();
  const idFromSlug = extractIdFromSlug(id);
  const referenceId = idFromSlug;

  const data = await getReportData(id, languageId, referenceId);
  const report = data?.data?.report;
  const reportSeo = data?.data?.seo;

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
  const fallbackDescription =
    report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title;

  return buildSeoMetadata({
    seo: reportSeo,
    lang: langCode,
    path: `/reports/${canonicalSlug}`,
    fallback: {
      title: `${report.title} | SynapSEA`,
      description: fallbackDescription,
    },
    openGraph: {
      type: 'article',
      images: report.image ? [report.image] : undefined,
    },
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();

  // Extract ID from slug (works for both old ID and new Reference ID style URLs)
  const idFromSlug = extractIdFromSlug(id);

  // Only use the slug-derived ID for server render to avoid cache fragmentation by query params.
  const referenceId = idFromSlug;

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

  const schemas = getSeoSchemas(reportData.data.seo, reportData.data);

  return (
    <>
      <SeoSchema schemas={schemas} />
      <ReportView data={reportData} lang={lang} id={id} refId={referenceId} />
    </>
  );
}
