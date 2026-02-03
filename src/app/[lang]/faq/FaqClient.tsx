"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import FaqContent from "@/components/common/FaqContent";
import CallToAction from "@/components/common/CallToAction";

interface FaqTab {
  id: number;
  question: string;
  answer: string;
}

interface FaqContentData {
  title: string;
  description: string;
  faq_contact_title?: string;
  contact_description?: string;
  tabs: FaqTab[];
}

interface FaqData {
  id: string;
  content: FaqContentData;
  language_id: string;
  created_at: string;
  updated_at: string;
  common_layout?: {
    id: number;
    common_title: string;
    common_button: string;
  };
}

// metadata must be exported from a server component. Kept in parent layout.

const formatFaqAnswer = (answer: string) => {
  if (!answer) return "";
  const normalized = answer.replace(/\r\n/g, "\n").trim();
  const blocks = normalized.split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const withLabels = block
        .replace(/(^|[\n])Q:/g, "$1<strong>Q:</strong>")
        .replace(/(^|[\n])A:/g, "$1<strong>A:</strong>");
      const withBreaks = withLabels.replace(/\n/g, "<br />");
      return `<p>${withBreaks}</p>`;
    })
    .join("");
};

export default function FaqClient() {
  const { language } = useLanguageStore();
  const { id } = useParams(); // Keeping for consistency with other pages
  const searchParams = useSearchParams();
  const highlight = searchParams?.get("highlight");
  const [faqData, setFaqData] = useState<FaqData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFaqData(null);
    setIsLoading(true);
  }, [language]);

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_DB_URL is not defined");
        }

        // Get language ID from language code
        const languageId = codeToId[language] || codeToId["en"];

        const response = await fetch(`${baseUrl}faq/${languageId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch faq data: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        console.log("FAQ API Response:", data);

        // Validate the response data structure
        if (data && typeof data === "object" && data.content) {
          setFaqData({
            id: data.id || "",
            content: {
              title: data.content.title || "FAQs",
              description: data.content.description || "",
              faq_contact_title: data.content.faq_contact_title || "",
              contact_description: data.content.contact_description || "",
              tabs: data.content.tabs || [],
            },
            language_id: data.language_id || "",
            created_at: data.created_at || "",
            updated_at: data.updated_at || "",
            common_layout: data.common_layout,
          });
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        console.error("FAQ data fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch faq data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqData();
  }, [language, id]);

  // Helper function to highlight text
  const highlightText = (text: string | undefined | null) => {
    if (!text) return "";
    if (!highlight) return text;

    try {
      const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedHighlight})`, "gi");
      return text.replace(
        regex,
        '<mark class="bg-yellow-300 text-black rounded-sm px-0.5">$1</mark>',
      );
    } catch (e) {
      return text;
    }
  };

  // Auto-scroll to highlight
  useEffect(() => {
    if (!highlight || !faqData) return;

    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName("mark");
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [highlight, faqData]);

  const faqTabs = useMemo(() => {
    const rawTabs = faqData?.content?.tabs || [];
    return rawTabs.map((tab) => ({
      id: tab.id,
      title: tab.question || "",
      description: formatFaqAnswer(tab.answer || ""),
    }));
  }, [faqData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-6 h-12 rounded bg-gray-800"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 rounded bg-gray-800"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold">FAQs</h1>
            <p className="mb-4 text-red-400">
              Error loading FAQ: {error}
            </p>
            <p className="text-gray-400">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log("FAQ Page State:", {
    faqData,
    isLoading,
    error,
    language,
  });

  return (
    <div className="min-h-screen bg-black pt-20 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-4xl font-bold text-white">
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(faqData?.content?.title || "FAQs"),
            }}
          />
        </h1>

        {faqData?.content?.description && (
          <div
            className="prose prose-invert mb-8 max-w-none leading-normal text-gray-300 [&_a]:text-blue-400 [&_li]:leading-normal [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: highlightText(faqData.content.description),
            }}
          />
        )}

        {faqTabs.length > 0 && (
          <FaqContent tabs={faqTabs} highlight={highlight} />
        )}

        <h1 className="mt-12 mb-6 text-4xl font-bold text-white">
          <span
            dangerouslySetInnerHTML={{
              __html: highlightText(
                faqData?.content?.faq_contact_title || "Still Have Questions?",
              ),
            }}
          />
        </h1>

        {faqData?.content?.contact_description && (
          <div
            className="prose prose-invert mb-8 max-w-none leading-normal text-gray-300 [&_a]:text-blue-400 [&_li]:leading-normal [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
            dangerouslySetInnerHTML={{
              __html: highlightText(faqData.content.contact_description),
            }}
          />
        )}
      </div>

      <CallToAction
        title={
          faqData?.common_layout?.common_title ||
          "Ready to Transform Your Market Strategy?"
        }
        buttonText={
          faqData?.common_layout?.common_button || "Check our Research"
        }
        buttonLink={`/${language}/reports`}
      />
    </div>
  );
}
