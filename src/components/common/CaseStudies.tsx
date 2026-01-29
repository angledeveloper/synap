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
  title?: string;
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
      className={`relative flex h-[309px] flex-col justify-between p-6 transition-colors duration-300 ${variant === 'teal' ? 'bg-[#06A591]' : 'bg-[#0B0B0B]'
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

export default function CaseStudiesSection({ caseStudies, title }: CaseStudiesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
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
      if (window.innerWidth >= 1440) setItemsPerPage(4);
      else if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 640) setItemsPerPage(2);
      else setItemsPerPage(1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Center detection logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!displayData.length) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      // Calculate distance for all cards
      const distances = displayData.map((_, index) => {
        const card = cardsRef.current[index];
        if (!card) return { index, distance: Number.MAX_VALUE };
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        return { index, distance: Math.abs(containerCenter - cardCenter) };
      });

      // Sort by distance
      distances.sort((a, b) => a.distance - b.distance);

      // Determine how many to highlight
      // If mobile (itemsPerPage === 1), highlight 1. Otherwise highlight 2.
      const highlightCount = itemsPerPage > 1 ? 2 : 1;

      // Get top N indices
      const newHighlightedIndices = distances.slice(0, highlightCount).map(d => d.index);

      // Simple array comparison to avoid infinite loops if generic
      // (Using Set or JSON.stringify for simplicity here, or just simple check)
      setHighlightedIndices(prev => {
        if (prev.length !== newHighlightedIndices.length) return newHighlightedIndices;
        const sortedPrev = [...prev].sort();
        const sortedNew = [...newHighlightedIndices].sort();
        return sortedPrev.every((val, i) => val === sortedNew[i]) ? prev : newHighlightedIndices;
      });
    };

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll); // Recalculate on resize

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [displayData.length, itemsPerPage]);


  // Auto-scroll logic
  useEffect(() => {
    if (displayData.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = prev + 1;
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
          {title || "Case Studies"}
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
              ref={(el) => { cardsRef.current[index] = el; }}
              className="flex-shrink-0 px-3 snap-start"
              style={{
                // Fixed width for consistent look, allow them to flow off-screen
                width: '473px',
                maxWidth: '90vw' // responsive fallback
              }}
            >
              <CaseStudyCard
                caseStudy={cs}
                variant={highlightedIndices.includes(index) ? 'teal' : 'dark'}
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
