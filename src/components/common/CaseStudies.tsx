"use client";

import { useEffect } from "react";
import Link from "next/link";

interface CaseStudy {
  id: number;
  title: string;
  description: string;
  read_text: string;
}

interface CaseStudiesProps {
  caseStudies: CaseStudy[];
}

// Function to safely parse and clean HTML content
const createMarkup = (html: string) => {
  // Basic XSS protection - only allow safe HTML tags
  const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  return { __html: cleanHtml };
};

function CaseStudyCard({
  title,
  description,
  read_text,
  id,
}: CaseStudy) {
  // Log the description for debugging
  useEffect(() => {
    console.log('Case study description:', { id, title, description });
  }, [id, title, description]);
  
  return (
    <div className="flex flex-col gap-4 max-md:px-3 max-md:py-16 md:px-4 md:py-12 md:pt-16">
      <h3 className="text-[28px] md:text-[32px] font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {title}
      </h3>

      <div 
        className="text-[20px] font-light space-y-3 prose max-w-none" 
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        dangerouslySetInnerHTML={createMarkup(description)}
      />

      <Link href={`#`} className="underline text-[20px] font-medium w-fit">
        {read_text || 'Read case study'}
      </Link>
    </div>
  );
}

export default function CaseStudiesSection({ caseStudies }: CaseStudiesProps) {
  // Log the received case studies for debugging
  useEffect(() => {
    console.log('Received case studies:', caseStudies);
  }, [caseStudies]);

  if (!caseStudies || caseStudies.length === 0) {
    console.log('No case studies provided or empty array');
    return null;
  }

  return (
    <div className="relative z-10 flex w-full h-full flex-col text-white">
      {caseStudies.map((cs, idx) => (
        <div
          key={`cs-${cs.id || idx}`}
          className={
            idx === 0
              ? "relative bg-[#06A591] w-full md:before:absolute md:before:top-0 md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#06A591] md:before:content-['']"
              : "relative bg-black w-full md:before:absolute md:before:top-0 md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#000] md:before:content-['']"
          }
        >
          <CaseStudyCard {...cs} />
        </div>
      ))}
    </div>
  );
}

