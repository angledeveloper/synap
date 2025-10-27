"use client";

import React, { useState, useEffect } from "react";
import { useHomePageStore } from "@/store";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ArrowIcon from "@/components/common/ArrowIcon";

// Ticker component for counting from 0 to 10
const TickerCounter = () => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount >= 10) {
          setIsAnimating(false);
          return 10;
        }
        return prevCount + 1;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [isAnimating]);

  return (
    <span style={{ fontFamily: 'var(--font-orbitron)' }}>
      {count}
      <span className="text-[64px] text-left md:text-[164px]">
        +
      </span>
    </span>
  );
};

export default function GlobalAboveFooter() {
  const { HomePage } = useHomePageStore();

  // Show loading state if HomePage data is not available
  if (!HomePage || !HomePage.common_layout_above_footer) {
    return (
      <div className="w-full overflow-hidden bg-[#F5F5F5]">
        <div className="m-auto grid w-full max-w-[1440px] grid-cols-1 flex-col justify-center md:grid-cols-2">
          <div className="relative z-10 h-full w-full bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-3 py-12 md:from-transparent md:to-transparent md:p-16 md:before:absolute md:before:top-0 md:before:right-[0%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-gradient-to-l md:before:from-[#1160C9] md:before:to-[#08D2B8] md:before:to-60% md:before:content-['']">
            <h4 className="text-[32px] text-left md:text-[64px]">
              <div>Empowering</div>
              <div><span className="whitespace-nowrap">Success Across</span></div>
            </h4>
            <p className="mt-10 text-[20px]">
              Loading...
            </p>
          </div>
          <div className="w-full bg-[#F5F5F5] p-3 py-12 text-black md:h-full md:p-16">
          <div className="flex items-end gap-4">
            <h5 className="flex flex-wrap items-end gap-2 text-[64px] text-left md:gap-10 md:text-[164px]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              <TickerCounter />
            </h5>
            <div className="font-space-grotesk text-left">
              <div className="text-[24px] font-low text-[#1c1c1c] md:text-[40px]">
                Major
              </div>
              <div className="text-[24px] font-low text-[#1c1c1c] md:text-[40px]">
                Industries
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-[#F5F5F5]">
      <div className="m-auto grid w-full max-w-[1440px] grid-cols-1 flex-col justify-center md:grid-cols-2">
        <div className="relative z-10 h-full w-full bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-3 py-12 md:from-transparent md:to-transparent md:p-16 md:before:absolute md:before:top-0 md:before:right-[0%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-gradient-to-l md:before:from-[#1160C9] md:before:to-[#08D2B8] md:before:to-60% md:before:content-['']">
          <h4 className="text-[32px] text-left md:text-[64px]">
            <div>Empowering</div>
            <div><span className="whitespace-nowrap">Success Across</span></div>
          </h4>
          <p className="mt-10 text-[20px]">
            {HomePage.common_layout_above_footer?.description || ""}
          </p>
        </div>
        <div className="w-full bg-[#F5F5F5] p-3 py-12 text-black md:h-full md:p-16">
          <div className="flex items-end gap-4">
            <h5 className="flex flex-wrap items-end gap-2 text-[64px] text-left md:gap-10 md:text-[164px]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              <TickerCounter />
            </h5>
            <div className="font-space-grotesk text-left">
              <div className="text-[24px] font-low text-[#1c1c1c] md:text-[40px]">
                Major
              </div>
              <div className="text-[24px] font-low text-[#1c1c1c] md:text-[40px]">
                Industries
              </div>
            </div>
          </div>
          <Link href="/reports" className="mt-10 inline-flex h-[105px] min-w-[300px] w-fit cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] text-white font-bold hover:opacity-85 max-md:w-full border border-black">
            <span className="flex w-full justify-end">
              <ArrowIcon variant="gradient" />
            </span>
            <span>{HomePage.home_section1?.first_button || "Explore Reports"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
