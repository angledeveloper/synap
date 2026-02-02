import { Metadata } from 'next';
import { unstable_cache } from "next/cache";
import { notFound } from 'next/navigation';
import ReportView from './ReportView';
import RefIdTracker from "@/components/common/RefIdTracker";
import { extractIdFromSlug, codeToId } from '@/lib/utils';
import { supportedLanguages } from '@/lib/utils';

export const revalidate = 3600;

const getReportDataCached = unstable_cache(
  async (languageId: string, referenceId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) return null;

      const formData = new FormData();
      formData.append('report_reference_id', referenceId);
      formData.append('language_id', languageId);

      const res = await fetch(`${baseUrl}reports_store`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data?.report) return data;
      }
    } catch (e) {
      console.error("Error strictly fetching report:", e);
    }
    return null;
  },
  ["report-detail"],
  { revalidate: 3600 },
);

async function getReportData(languageId: string, referenceId?: string) {
  if (!referenceId) return null;
  return getReportDataCached(languageId, referenceId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;

  // id is the slug
  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();
  const idFromSlug = extractIdFromSlug(id);
  const referenceId = idFromSlug;

  const data = await getReportData(languageId, referenceId);
  const report = data?.data?.report;

  if (!report) {
    return {
      title: 'Report Not Found | SynapSEA',
      description: 'The requested market research report could not be found.',
    };
  }

  const canonicalUrl = `/${lang}/reports/${id}`;
  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = `/${l.code}/reports/${id}`;
  });
  alternates['x-default'] = `/reports/${id}`;

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
    }
  };
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

  const referenceId = idFromSlug;

  const reportData = await getReportData(languageId, referenceId);

  if (!reportData || !reportData.data || !reportData.data.report) {
    return notFound();
  }

  const resolvedRefId =
    reportData.report_identity?.report_reference_id?.toString() || referenceId;

  return (
    <>
      <RefIdTracker />
      <ReportView data={reportData} lang={lang} id={id} refId={resolvedRefId} />
    </>
  );
}
