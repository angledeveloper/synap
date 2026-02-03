"use client";

import { useEffect, useState } from "react";

interface FaqTab {
  id: number;
  title: string;
  description: string;
}

interface FaqContentProps {
  tabs: FaqTab[];
  highlight?: string | null;
}

export default function FaqContent({ tabs, highlight }: FaqContentProps) {
  const [expandedTab, setExpandedTab] = useState<number | null>(null);

  const toggleTab = (tabId: number) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  useEffect(() => {
    if (tabs.length > 0 && expandedTab === null) {
      setExpandedTab(tabs[0].id);
    }
  }, [tabs, expandedTab]);

  const highlightText = (text: string) => {
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

  useEffect(() => {
    if (!highlight) return;
    const query = highlight.toLowerCase();
    const foundTab = tabs.find(
      (tab) =>
        tab.title.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query),
    );
    if (foundTab) {
      setExpandedTab(foundTab.id);
    }
  }, [highlight, tabs]);

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
              <span
                dangerouslySetInnerHTML={{ __html: highlightText(tab.title) }}
              />
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
                className="prose prose-invert max-w-none pr-8 leading-normal text-gray-300 [&_a]:text-blue-400 [&_li]:leading-normal [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{
                  __html: highlightText(tab.description || ""),
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
