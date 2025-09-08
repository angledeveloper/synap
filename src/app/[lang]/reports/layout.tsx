import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports Store | SynapSEA",
  description: "Browse our comprehensive collection of market research reports across various industries. Find insights that drive measurable, scalable results for your business strategy.",
  keywords: "market research reports, business intelligence, industry analysis, market insights, SynapSEA",
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

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
