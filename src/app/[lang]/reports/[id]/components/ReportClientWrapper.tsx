"use client";

import { useState, useEffect } from "react";
import { ReportDetailResponse, ReportSection } from "@/types/reports";
import { useIdentityStore } from "@/store";
import { codeToId, extractIdFromSlug } from "@/lib/utils";

interface ReportClientWrapperProps {
  sections: ReportSection[];
  children: React.ReactNode;
  reportData?: ReportDetailResponse;
  lang?: string;
  slug?: string;
}

export default function ReportClientWrapper({
  sections,
  children,
  reportData,
  lang,
  slug,
}: ReportClientWrapperProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { cacheReportData, cacheIdentity } = useIdentityStore();

  // Cache the report data on mount
  useEffect(() => {
    if (reportData && lang && slug) {
      const extractedId = extractIdFromSlug(slug);
      const languageId =
        codeToId[lang as keyof typeof codeToId] || codeToId["en"];
      const cacheKey = `${extractedId}-${languageId}`;

      // console.log(`[ReportClientWrapper] Caching data for ${cacheKey}`);
      cacheReportData(cacheKey, reportData);

      if (reportData.report_identity?.report_reference_id) {
        cacheIdentity(cacheKey, reportData.report_identity.report_reference_id);
      }
    }
  }, [reportData, lang, slug, cacheReportData, cacheIdentity]);

  // ... existing tab logic ...

  // We need to keep the existing tab logic mostly as is, just wrapped in the new component structure
  // Copying the previous logic down here
  const [highlight, setHighlight] = useState<string | null>(null);

  // Effect to handle auto-scrolling and tab switching for search results
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const h = searchParams.get("highlight");
    if (h) setHighlight(h);
  }, []);

  useEffect(() => {
    if (!highlight || sections.length === 0) return;

    const query = highlight.toLowerCase();
    const foundSectionIndex = sections.findIndex(
      (s: ReportSection) =>
        s.section_description.toLowerCase().includes(query) ||
        s.section_name.toLowerCase().includes(query),
    );

    if (foundSectionIndex !== -1) {
      setActiveTab(foundSectionIndex);
    }

    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName("mark");
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [highlight, sections]);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        {/* Mobile Dropdown */}
        <div className="mb-4 sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(parseInt(e.target.value))}
            className="focus:ring-1.5 w-full rounded-lg border border-gray-300 bg-white p-3 text-[14px] font-medium text-[#000000] focus:ring-[#1160C9] focus:outline-none"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {sections.map((section: ReportSection, index: number) => (
              <option
                key={section.id}
                value={index}
                className="text-[14px] font-medium text-[#000000]"
              >
                {section.section_name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="no-scrollbar hidden w-full overflow-x-auto sm:flex">
          <div className="flex w-full gap-[1px]">
            {sections.map((section: ReportSection, index: number) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center justify-center transition-colors ${
                  activeTab === index
                    ? "bg-black text-white"
                    : "border border-[#7C7C7C] bg-white text-gray-600 hover:bg-gray-50"
                }`}
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  flex: "1 1 0",
                  minWidth: "0",
                  height: "51px",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "20px",
                  letterSpacing: "0.1px",
                }}
              >
                <span className="truncate px-2">
                  {section.section_name.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Wrapper */}
        <div className="mt-[-1px]">
          {Array.isArray(children) ? (
            children.map((child, index) => (
              <div
                key={index}
                className={activeTab === index ? "block" : "hidden"}
              >
                {child}
              </div>
            ))
          ) : (
            <div className="block">{children}</div>
          )}
        </div>
      </div>
    </>
  );
}
