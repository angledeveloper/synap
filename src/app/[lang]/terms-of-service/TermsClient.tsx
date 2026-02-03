"use client";

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';
import { useSearchParams } from "next/navigation";
import TermsOfServiceContent from '@/components/common/TermsOfServiceContent';
import CallToAction from '@/components/common/CallToAction';

export interface Tab {
  id: number;
  title: string;
  description: string;
}

interface TermsContent {
  title: string;
  description: string;
  tabs: Tab[];
}

interface TermsData {
  id: string;
  content: TermsContent;
  language_id: string;
  created_at: string;
  updated_at: string;
  common_layout?: {
    id: number;
    common_title: string;
    common_button: string;
  };
}

export default function TermsClient() {
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();
  const highlight = searchParams?.get('highlight');
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTermsData(null);
    setIsLoading(true);
  }, [language]);

  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_DB_URL is not defined');
        }

        // Get language ID from language code
        const languageId = codeToId[language] || codeToId['en'];

        const response = await fetch(`${baseUrl}terms/${languageId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch terms of service: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // Validate the response data structure
        if (data && typeof data === 'object' && data.content) {
          setTermsData({
            id: data.id || '',
            content: {
              title: data.content.title || 'Terms of Service',
              description: data.content.description || '',
              tabs: data.content.tabs || []
            },
            language_id: data.language_id || '',
            created_at: data.created_at || '',
            updated_at: data.updated_at || '',
            common_layout: data.common_layout
          });
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('Terms of service fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch terms of service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermsData();
  }, [language]); // Kept language as dependency, 'id' was not defined in the component

  // Helper function to highlight text
  const highlightText = (text: string | undefined | null) => {
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

  // Auto-scroll to highlight
  useEffect(() => {
    if (!highlight || !termsData) return;

    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName('mark');
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [highlight, termsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
            <p className="text-red-400 mb-4">Error loading terms of service: {error}</p>
            <p className="text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-white">
          <span dangerouslySetInnerHTML={{ __html: highlightText(termsData?.content?.title || 'Terms of Service') }} />
        </h1>

        {termsData?.content?.description && (
          <div
            className="text-gray-300 mb-8 leading-relaxed prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: highlightText(termsData.content.description) }}
          />
        )}

        {termsData?.content?.tabs && termsData.content.tabs.length > 0 && (
          <TermsOfServiceContent
            tabs={termsData.content.tabs}
            highlight={highlight}
          />
        )}
      </div>

      <CallToAction
        title={termsData?.common_layout?.common_title || "Ready to Transform Your Market Strategy?"}
        buttonText={termsData?.common_layout?.common_button || "Check our Research"}
        buttonLink={`/${language}/reports`}
      />
    </div>
  );
}
