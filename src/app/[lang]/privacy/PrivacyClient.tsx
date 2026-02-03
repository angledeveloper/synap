"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';
import PrivacyPolicyContent from '@/components/common/PrivacyPolicyContent';
import CallToAction from '@/components/common/CallToAction';

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
  const highlight = searchParams?.get('highlight');
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
          throw new Error('NEXT_PUBLIC_DB_URL is not defined');
        }

        // Get language ID from language code
        const languageId = codeToId[language] || codeToId['en'];

        const response = await fetch(`${baseUrl}privacy/${languageId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch privacy data: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Privacy API Response:', data);

        // Validate the response data structure
        if (data && typeof data === 'object' && data.content) {
          setPrivacyData({
            id: data.id || '',
            content: {
              title: data.content.title || 'Privacy Policy',
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
        console.error('Privacy data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch privacy data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacyData();
  }, [language, id]);

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
    if (!highlight || !privacyData) return;

    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName('mark');
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [highlight, privacyData]);

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
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-red-400 mb-4">Error loading privacy policy: {error}</p>
            <p className="text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Privacy Page State:', { privacyData, isLoading, error, language });

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-white">
          <span dangerouslySetInnerHTML={{ __html: highlightText(privacyData?.content?.title || 'Privacy Policy') }} />
        </h1>

        {privacyData?.content?.description && (
          <div
            className="text-gray-300 mb-8 leading-relaxed prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightText(privacyData.content.description) }}
          />
        )}

        {privacyData?.content?.tabs && privacyData.content.tabs.length > 0 && (
          <PrivacyPolicyContent
            tabs={privacyData.content.tabs}
            highlight={highlight}
          />
        )}
      </div>

      <CallToAction
        title={privacyData?.common_layout?.common_title || "Ready to Transform Your Market Strategy?"}
        buttonText={privacyData?.common_layout?.common_button || "Check our Research"}
        buttonLink={`/${language}/reports`}
      />
    </div>
  );
}
