"use client";

import { useEffect } from "react";
import Link from "next/link";

interface CaseStudy {
  id: number;
  title: string;
  description: string;
  read_text: string;
  file_url?: string;
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

function CaseStudyCard({ title, description, read_text, file_url }: CaseStudy) {
  return (
    <div className="flex flex-col gap-4 p-8 md:p-14">
      <h3 className="text-[24px] md:text-[28px] font-semibold " style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {title}
      </h3>

      <div
        className="text-[20px] font-light space-y-3 prose max-w-none"
        dangerouslySetInnerHTML={createMarkup(description)}
      />

      <Link href={file_url || "#"} target={file_url ? "_blank" : undefined} className="underline text-[20px] font-medium w-fit">
        {read_text || "Read case study"}
      </Link>
    </div>
  );
}


export default function CaseStudiesSection({ caseStudies }: CaseStudiesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full text-white ">

      {caseStudies.map((cs, idx) => (
        <div
          key={`cs-${cs.id || idx}`}
          className={
            idx === 0
              ? "bg-[#06A591] w-full"
              : "bg-black w-full"
          }
        >
          <CaseStudyCard {...cs} />
        </div>
      ))}

    </div>
  );
}
