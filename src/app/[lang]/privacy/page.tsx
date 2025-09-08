"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguageStore } from '../../../store';
import { codeToId } from '../../../lib/utils';
import PrivacyPolicyContent from '../../../components/PrivacyPolicyContent';

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
}

// metadata must be exported from a server component. Kept in parent layout.

export default function PrivacyPage() {
  const { language } = useLanguageStore();
  const [privacyData, setPrivacyData] = useState<PrivacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            updated_at: data.updated_at || ''
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
  }, [language]);

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
          {privacyData?.content?.title || 'Privacy Policy'}
        </h1>
        
        {privacyData?.content?.description && (
          <div
            className="text-gray-300 mb-8 leading-relaxed prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: privacyData.content.description }}
          />
        )}
        
        {privacyData?.content?.tabs && privacyData.content.tabs.length > 0 && (
          <PrivacyPolicyContent tabs={privacyData.content.tabs} />
        )}
      </div>
      
      {/* Call to Action Section - Full Width */}
      <div className="mt-16 bg-gradient-to-r from-[#08D2B8] to-[#1160C9] p-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-6">
            <h2 className="text-4xl font-bold text-white leading-tight text-left m-0">
              Ready to Transform Your Market Strategy?
            </h2>
            <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-black p-4 text-[20px] outline-white hover:opacity-85 hover:outline-2 max-md:w-full">
              <span className="flex w-full justify-end">
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" className="text-white">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m13 6l6 6l-6 6M5 6l6 6l-6 6" />
                </svg>
              </span>
              <span className="text-white">Check our Research</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
