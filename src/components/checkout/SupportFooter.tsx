"use client";

import React from "react";
import Link from "next/link";
import { useLanguageStore } from "@/store";
import ArrowIcon from "@/components/common/ArrowIcon";

interface PaymentCommonLayout {
  need_help_heading: string;
  conatct_us_btn_text: string; // Note: Typo in the API response (conatct_us_btn_text)
}

interface SupportFooterProps {
  className?: string;
  payment_common_layout?: PaymentCommonLayout;
}

export default function SupportFooter({ className = "", payment_common_layout }: SupportFooterProps) {
  const { language } = useLanguageStore();
  
  // Get title and button text from API response or use defaults
  const title = payment_common_layout?.need_help_heading || "Need help? We are available 24/7 for your queries";
  const contactUsText = payment_common_layout?.conatct_us_btn_text || "Contact Us";
  
  // Split title for responsive line break
  const splitIndex = title.toLowerCase().indexOf('24/7');
  const firstLine = splitIndex >= 0 ? title.substring(0, splitIndex) : title;
  const secondLine = splitIndex >= 0 ? title.substring(splitIndex) : '';

  return (
    <div className={`w-full bg-gradient-to-r from-[#1160C9] to-[#08D2B8] mt-0 ${className}`}>
      <div className="w-full max-w-[1352px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Left side - Title */}
          <h2 className="text-[18px] md:text-[40px] font-normal text-white text-left leading-tight" style={{
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            <span className="md:block">{firstLine}</span>
            {secondLine && <span className="md:block">{secondLine}</span>}
          </h2>
          
          {/* Right side - Contact Button */}
          <Link 
            href={`/${language}/contact`} 
            className="w-full md:w-auto"
          >
            <div className="group relative bg-black text-white p-4 rounded-lg h-24 md:h-28 w-full md:w-72 flex flex-col justify-between hover:opacity-90 transition-opacity">
              <div className="flex justify-end">
                <ArrowIcon variant="white" className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold">{contactUsText}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}