"use client";

import { useEffect, useState, useRef } from "react";
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
  const cleanHtml = html?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') || '';
  return { __html: cleanHtml };
};

const CaseStudyCard = ({
  caseStudy,
  variant
}: {
  caseStudy: CaseStudy;
  variant: 'dark' | 'teal';
}) => {
  return (
    <div
      className={`relative flex h-[309px] flex-col justify-between p-6 ${variant === 'teal' ? 'bg-[#06A591]' : 'bg-[#0B0B0B]'
        }`}
    >
      <div>
        <h3 className="mb-3 text-[20px] font-semibold leading-snug text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {caseStudy.title}
        </h3>

        <div
          className="mb-4 text-[16px] font-light leading-relaxed text-white opacity-80 prose max-w-none line-clamp-4"
          dangerouslySetInnerHTML={createMarkup(caseStudy.description)}
        />
      </div>

      <Link
        href={caseStudy.file_url || "#"}
        target={caseStudy.file_url ? "_blank" : undefined}
        className="w-fit text-[16px] font-medium text-white underline decoration-1 underline-offset-4 hover:opacity-80"
      >
        {caseStudy.read_text || "Read case study"}
      </Link>
    </div>
  );
};

export default function CaseStudiesSection({ caseStudies }: CaseStudiesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [itemsPerPage, setItemsPerPage] = useState(1);
  const [displayData, setDisplayData] = useState<CaseStudy[]>([]);

  // Duplicate data for testing if not enough items
  useEffect(() => {
    if (!caseStudies) return;
    setDisplayData(caseStudies);
  }, [caseStudies]);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1440) setItemsPerPage(4); // Fits roughly 1440 / 4 ~ 360, but user wants 473px width.
      // If user wants EXACTLY 473px width, 1440px / 473px = ~3 items.
      // Let's adjust breakpoints to fit fixed width cards better.
      else if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 640) setItemsPerPage(2);
      else setItemsPerPage(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (displayData.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = prev + 1;
        // Logic for infinite loop or reset
        // With smooth scroll, resetting to 0 jumps back. Use simple loop for now.
        if (nextIndex > displayData.length - itemsPerPage) {
          return 0;
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [itemsPerPage, displayData.length]);

  // Smooth scroll to active index
  useEffect(() => {
    if (scrollContainerRef.current) {
      // We want strict card width?
      // If we use flex-basis with 100/itemsPerPage, the width is dynamic.
      // User requested 473px width.
      // If we force 473px, we might overflow the container or have gaps.
      // Better to check if the container is flex or grid.
      // Let's try to match the DESIGN width 473px on large screens.

      const containerWidth = scrollContainerRef.current.clientWidth;
      const itemWidth = containerWidth / itemsPerPage;

      scrollContainerRef.current.scrollTo({
        left: activeIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, itemsPerPage]);

  if (!displayData || displayData.length === 0) return null;

  return (
    <div className="w-full bg-white py-20 overflow-hidden">
      {/* Title - Centered */}
      <div className="mx-auto w-full max-w-[1920px] px-4">
        <h2
          className="mb-12 text-center text-[40px] text-black md:mb-16 md:text-[64px]"
          style={{ fontFamily: 'var(--font-orbitron)' }}
        >
          Case Studies
        </h2>
      </div>

      {/* Carousel Container - Full Width edge to edge */}
      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="flex w-full overflow-x-hidden snap-x snap-mandatory pl-[5vw] md:pl-[max(0px,calc(50vw-720px))]"
        >
          {displayData.map((cs, index) => (
            <div
              key={cs.id}
              className="flex-shrink-0 px-3 snap-start"
              style={{
                // Fixed width for consistent look, allow them to flow off-screen
                width: '473px',
                maxWidth: '90vw' // responsive fallback
              }}
            >
              <CaseStudyCard
                caseStudy={cs}
                variant={index % 4 === 2 ? 'teal' : 'dark'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="mt-10 flex justify-center gap-2">
        {/* Show limited number of dots to avoid overcrowding */}
        {displayData.map((_, idx) => {
          // If too many items, maybe only show dots for pages?
          // Let's show all for now since we have ~10
          if (idx > displayData.length - itemsPerPage) return null;

          return (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${activeIndex === idx
                ? 'bg-black w-3 opacity-100 scale-110'
                : 'bg-[#D9D9D9] opacity-100 hover:bg-black/50'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
