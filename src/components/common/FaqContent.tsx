"use client";

import { useState } from "react";

interface FaqTab {
  id: number;
  title: string;
  description: string;
}

const tabs: FaqTab[] = [
  {
    id: 1,
    title: "About SynapSEA Global",
    description: `
      <p><strong>Q:</strong> What does SynapSEA Global do?<br />
      <strong>A:</strong> We’re a global market intelligence platform that delivers in-depth market research reports, custom forecasting, and competitive insights across 10+ key industries. Our goal is to help businesses make data-backed strategic decisions.</p>

      <p><strong>Q:</strong> What industries do you cover?<br />
      <strong>A:</strong> We provide deep research in Technology, Healthcare, Automotive, Consumer Goods, Energy, Financial Services, Manufacturing, Agriculture, and more. [View All Industries &rarr;]</p>

      <p><strong>Q:</strong> Where is SynapSEA Global based?<br />
      <strong>A:</strong> SynapSEA Global operates globally, with regional research teams covering APAC, EMEA, North America, and LATAM markets.</p>
    `,
  },
  {
    id: 2,
    title: "Purchasing & Payments",
    description: `
      <p><strong>Q:</strong> How do I purchase a report?<br />
      <strong>A:</strong> Simply browse our [Reports Store], add a report to your cart, and proceed to checkout. You’ll receive instant access after payment.</p>

      <p><strong>Q:</strong> What payment methods are accepted?<br />
      <strong>A:</strong> We accept all major credit cards, debit cards, and bank transfers via secure checkout. For enterprise or bulk purchases, contact us for invoicing options.</p>

      <p><strong>Q:</strong> Will I receive an invoice?<br />
      <strong>A:</strong> Yes. Invoices are automatically generated and emailed post-purchase. You can also download them from your [My Orders] dashboard.</p>

      <p><strong>Q:</strong> Can I get a sample before I buy?<br />
      <strong>A:</strong> Absolutely. Most reports include a downloadable sample or executive summary. You may request one directly from the report detail page.</p>
    `,
  },
  {
    id: 3,
    title: "Customization & Requests",
    description: `
      <p><strong>Q:</strong> Can I customize a report to suit my needs?<br />
      <strong>A:</strong> Yes. We offer tailored modifications based on geography, segment, competitor scope, or timeframe. Use the [Request Custom Report] form to start a consultation.</p>

      <p><strong>Q:</strong> What if I need research that’s not listed?<br />
      <strong>A:</strong> We regularly handle niche, emerging, or client-specific market requests. Reach out to our research team via [Contact Sales].</p>
    `,
  },
  {
    id: 4,
    title: "Access & Account",
    description: `
      <p><strong>Q:</strong> Do I need an account to purchase a report?<br />
      <strong>A:</strong> Yes. You’ll create a secure account during checkout. It allows you to download purchases, view past orders, and request updates.</p>

      <p><strong>Q:</strong> How do I access my purchased reports?<br />
      <strong>A:</strong> Log in to your [My Account] dashboard, go to [My Reports], and download directly from there.</p>

      <p><strong>Q:</strong> What format are the reports delivered in?<br />
      <strong>A:</strong> Reports are delivered in PDF format. Some reports may also include Excel data tables or visual dashboards depending on your package.</p>
    `,
  },
  {
    id: 5,
    title: "Delivery & Support",
    description: `
      <p><strong>Q:</strong> How soon will I receive my report?<br />
      <strong>A:</strong> Instant downloads are available for all off-the-shelf reports. For custom research, delivery timelines range from 3–10 business days depending on complexity.</p>

      <p><strong>Q:</strong> Who do I contact for support?<br />
      <strong>A:</strong> You can reach our support team at support@synapsea.global or through the [Contact Us] form. We typically respond within 24 hours.</p>

      <p><strong>Q:</strong> Can I speak to a research analyst before buying?<br />
      <strong>A:</strong> Yes. Use the “Talk to an Analyst” button on the report detail page to schedule a consultation.</p>
    `,
  },
  {
    id: 6,
    title: "Legal & Policy",
    description: `
      <p><strong>Q:</strong> Can I share my purchased report with others?<br />
      <strong>A:</strong> Reports are licensed per user or organization. Redistribution or resale is not permitted without a commercial agreement. See our [Terms of Use].</p>

      <p><strong>Q:</strong> What is your refund policy?<br />
      <strong>A:</strong> Due to the digital and intellectual nature of our content, we do not offer refunds. If you have concerns about your purchase, contact us and we’ll make it right.</p>

      <p><strong>Q:</strong> Is my data secure on your platform?<br />
      <strong>A:</strong> Yes. We comply with global data protection standards including GDPR. All transactions are encrypted and securely processed.</p>
    `,
  },
];

export default function FaqContent() {
  const [expandedTab, setExpandedTab] = useState<number | null>(1);

  const toggleTab = (tabId: number) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  return (
    <div className="space-y-0">
      {tabs.map((tab) => (
        <div key={tab.id} className="border-b border-gray-700">
          <button
            onClick={() => toggleTab(tab.id)}
            className="group flex w-full items-center justify-between py-6 text-left transition-colors hover:bg-gray-900/30"
            aria-expanded={expandedTab === tab.id}
            aria-controls={`faq-tab-${tab.id}`}
          >
            <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-gray-200">
              {tab.title}
            </h3>
            <div className="flex h-6 w-6 items-center justify-center">
              {expandedTab === tab.id ? (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </div>
          </button>

          {expandedTab === tab.id && (
            <div id={`faq-tab-${tab.id}`} className="pb-6">
              <div
                className="prose prose-invert max-w-none pr-8 leading-relaxed text-gray-300 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: tab.description }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
