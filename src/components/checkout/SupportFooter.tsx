"use client";

import React from "react";
import Link from "next/link";
import ArrowIcon from "@/components/common/ArrowIcon";

interface SupportFooterProps {
  className?: string;
  heading?: string;
}

export default function SupportFooter({ className = "", heading }: SupportFooterProps) {
  const title = heading || "Need help? We are available 24/7 for your queries";

  return (
    <div className={`w-full bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] ${className}`}>
      <div className="m-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div
          className="text-white text-left"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 400 }}
        >
          <div>Need help? We are available:</div>
          <div>24/7 for your queries</div>
        </div>

        <Link href="/contact" className="inline-flex">
          <button
            className="mt-10 flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-black p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full relative"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="flex w-full justify-end">
              <ArrowIcon variant="white" />
            </span>
            <span>Contact Us</span>
          </button>
        </Link>
      </div>
    </div>
  );
}


