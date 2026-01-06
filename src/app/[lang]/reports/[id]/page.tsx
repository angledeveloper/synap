import { Metadata } from 'next';
import ReportDetailPage from './ReportClient';
import { extractIdFromSlug, codeToId } from '@/lib/utils';
import { supportedLanguages } from '@/lib/utils';

// Helper to fetch report data on the server
async function fetchReportWithCategory(baseUrl: string, id: string, languageId: string, categoryId: string) {
  try {
    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('language_id', languageId);
    formData.append('report_id', id);

    const res = await fetch(`${baseUrl}reports_store`, {
      method: "POST",
      body: formData,
      next: { revalidate: 3600 }
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.data?.report) return data;
    return null;
  } catch (e) {
    return null;
  }
}

async function getReportData(id: string, languageId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  if (!baseUrl) return null;

  // 1. Try default category '1'
  const data = await fetchReportWithCategory(baseUrl, id, languageId, '1');
  if (data) return data;

  // 2. Fetch all categories
  try {
    const homeRes = await fetch(`${baseUrl}homepage/${languageId}`, {
      next: { revalidate: 3600 }
    });
    if (!homeRes.ok) return null;

    const homeData = await homeRes.json();
    const categories = homeData.report_store_dropdown || [];

    // Filter categories to excluding '1' which we already tried
    const categoryIds = categories
      .map((c: any) => c.category_id)
      .filter((cid: any) => String(cid) !== '1');

    if (categoryIds.length === 0) return null;

    // 3. Search in parallel
    const fetchPromises = categoryIds.map((cid: any) =>
      fetchReportWithCategory(baseUrl, id, languageId, String(cid))
        .then(res => {
          if (!res) throw new Error('Not found');
          return res;
        })
    );

    try {
      return await Promise.any(fetchPromises);
    } catch (aggregateError) {
      return null; // Report found in no categories
    }

  } catch (error) {
    console.error("Error fetching report for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const reportId = extractIdFromSlug(id);
  const languageId = (codeToId[lang as keyof typeof codeToId] || codeToId['en']).toString();

  const data = await getReportData(reportId, languageId);
  const report = data?.data?.report;

  if (!report) {
    return {
      title: 'Report Not Found | SynapSEA',
      description: 'The requested market research report could not be found.',
    };
  }

  // Construct absolute canonical URL
  const canonicalUrl = `/${lang}/reports/${id}`;

  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = `/${l.code}/reports/${id}`; // Note: This assumes same slug across languages which might not be true if titles differ
    // ideally we should fetch slugs for other languages, but for now this is a reasonable approximation 
    // or we can just point to the ID based URL if that's safer.
  });

  return {
    title: `${report.title} | SynapSEA`,
    description: report.introduction_description?.substring(0, 160).replace(/<[^>]*>/g, '') || report.title, // Strip HTML and limit length
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

export default function Page() {
  return <ReportDetailPage />;
}