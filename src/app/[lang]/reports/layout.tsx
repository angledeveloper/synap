import { Metadata } from "next";

import { supportedLanguages } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;

  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = `/${l.code}/reports`;
  });
  alternates['x-default'] = '/reports';

  return {
    title: "Reports Store | SynapSEA",
    description: "Browse our comprehensive collection of market research reports across various industries. Find insights that drive measurable, scalable results for your business strategy.",
    keywords: "market research reports, business intelligence, industry analysis, market insights, SynapSEA",
    alternates: {
      canonical: `/${lang}/reports`,
      languages: alternates,
    },
    openGraph: {
      title: "Reports Store | SynapSEA",
      description: "Browse our comprehensive collection of market research reports across various industries.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Reports Store | SynapSEA",
      description: "Browse our comprehensive collection of market research reports across various industries.",
    },
  };
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
