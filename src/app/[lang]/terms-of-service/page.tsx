"use client";

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/store';
import { codeToId } from '@/lib/utils';
import TermsOfServiceContent from '@/components/common/TermsOfServiceContent';

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
}

export default function TermsOfServicePage() {
  const { language } = useLanguageStore();
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
            updated_at: data.updated_at || ''
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
          {termsData?.content?.title || 'Terms of Service'}
        </h1>
        
        {termsData?.content?.description && (
          <div
            className="text-gray-300 mb-8 leading-relaxed prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: termsData.content.description }}
          />
        )}
        
        {termsData?.content?.tabs && termsData.content.tabs.length > 0 && (
          <TermsOfServiceContent tabs={termsData.content.tabs} />
        )}
      </div>
      
      {/* Call to Action Section - Full Width */}
      <div className="mt-16 bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-12">
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
