"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import FaqContent from "@/components/common/FaqContent";
import CallToAction from "@/components/common/CallToAction";

interface PrivacyTab {
  id: number;
  title: string;
  description: string;
}

interface PrivacyContent {
  title: string;
  description: string;
  tabs: PrivacyTab[];
}

interface PrivacyData {
  id: string;
  content: PrivacyContent;
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

export default function PrivacyPage() {
  const { language } = useLanguageStore();
  const { id } = useParams(); // Assuming 'id' might be used for a specific privacy document if routing supports it
  const searchParams = useSearchParams();
  const highlight = searchParams?.get("highlight");
  const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrivacyData(null);
    setIsLoading(true);
  }, [language]);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_DB_URL is not defined");
        }

        // Get language ID from language code
        const languageId = codeToId[language] || codeToId["en"];

        const response = await fetch(`${baseUrl}privacy/${languageId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch privacy data: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        console.log("Privacy API Response:", data);

        // Validate the response data structure
        if (data && typeof data === "object" && data.content) {
          setPrivacyData({
            id: data.id || "",
            content: {
              title: data.content.title || "Privacy Policy",
              description: data.content.description || "",
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
        console.error("Privacy data fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch privacy data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyData();
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
    if (!highlight || !privacyData) return;

    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName("mark");
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [highlight, privacyData]);

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
            <h1 className="mb-6 text-4xl font-bold">Privacy Policy</h1>
            <p className="mb-4 text-red-400">
              Error loading privacy policy: {error}
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
  console.log("Privacy Page State:", {
    privacyData,
    isLoading,
    error,
    language,
  });

  return (
    <div className="min-h-screen bg-black pt-20 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-4xl font-bold text-white">
          {/* <span
            dangerouslySetInnerHTML={{
              __html: highlightText(
                privacyData?.content?.title || "Privacy Policy",
              ),
            }}
          /> */}
          <span>FAQs</span>
        </h1>

        {privacyData?.content?.description && (
          // <div
          //   className="prose prose-invert mb-8 max-w-none leading-relaxed text-gray-300 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          //   dangerouslySetInnerHTML={{
          //     __html: highlightText(privacyData.content.description),
          //   }}
          // />
          <div className="prose prose-invert mb-8 max-w-none leading-relaxed text-gray-300 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            Have Questions? We’ve Got Answers. Whether you’re considering a
            purchase, requesting a custom report, or just exploring what we
            offer, this page answers the most common questions our clients and
            visitors have.
          </div>
        )}

        {privacyData?.content?.tabs && privacyData.content.tabs.length > 0 && (
          <FaqContent />
        )}

        <h1 className="mt-12 mb-6 text-4xl font-bold text-white">
          {/* <span
            dangerouslySetInnerHTML={{
              __html: highlightText(
                privacyData?.content?.title || "Privacy Policy",
              ),
            }}
          /> */}
          <span>Still Have Questions?</span>
        </h1>

        {privacyData?.content?.description && (
          // <div
          //   className="prose prose-invert mb-8 max-w-none leading-relaxed text-gray-300 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          //   dangerouslySetInnerHTML={{
          //     __html: highlightText(privacyData.content.description),
          //   }}
          // />
          <div className="prose prose-invert mb-8 max-w-none leading-relaxed text-gray-300 [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
            Contact our support team at support@synapsea.global or fill out our
            Contact Us form. We're here to help, 24/5 across global time zones.
          </div>
        )}
      </div>

      {/* <CallToAction
        title={
          privacyData?.common_layout?.common_title ||
          "Ready to Transform Your Market Strategy?"
        }
        buttonText={
          privacyData?.common_layout?.common_button || "Check our Research"
        }
        buttonLink={`/${language}/reports`}
      /> */}
    </div>
  );
}
