"use client";

import { useState } from 'react';

interface PrivacyTab {
  id: number;
  title: string;
  description: string;
}

interface PrivacyPolicyContentProps {
  tabs: PrivacyTab[];
  highlight?: string | null;
}

export default function PrivacyPolicyContent({ tabs, highlight }: PrivacyPolicyContentProps) {
  const [expandedTab, setExpandedTab] = useState<number | null>(3); // "Disclosure of Your Information" is expanded by default

  const toggleTab = (tabId: number) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  // Helper function to highlight text
  const highlightText = (text: string) => {
    if (!text) return '';
    if (!highlight) return text;

    try {
      const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedHighlight})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-300 text-black rounded-sm px-0.5">$1</mark>');
    } catch (e) {
      return text;
    }
  };

  // Auto-expand tab if it contains the highlight
  useState(() => {
    if (highlight) {
      const query = highlight.toLowerCase();
      const foundTab = tabs.find(tab =>
        tab.title.toLowerCase().includes(query) ||
        tab.description.toLowerCase().includes(query)
      );
      if (foundTab) {
        setExpandedTab(foundTab.id);
      }
    }
  });

  return (
    <div className="space-y-0">
      {tabs.map((tab, index) => (
        <div key={tab.id} className="border-b border-gray-700">
          <button
            onClick={() => toggleTab(tab.id)}
            className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-900/30 transition-colors group"
            aria-expanded={expandedTab === tab.id}
            aria-controls={`privacy-tab-${tab.id}`}
          >
            <h3 className="text-xl font-semibold text-white group-hover:text-gray-200 transition-colors">
              <span dangerouslySetInnerHTML={{ __html: highlightText(tab.title) }} />
            </h3>
            <div className="flex items-center justify-center w-6 h-6">
              {expandedTab === tab.id ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
          </button>

          {expandedTab === tab.id && (
            <div
              id={`privacy-tab-${tab.id}`}
              className="pb-6"
            >
              <div
                className="text-gray-300 leading-relaxed pr-8 prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: highlightText(tab.description || "") }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}