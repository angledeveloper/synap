"use client";

import React from "react";
import Link from "next/link";
import { useLanguageStore } from "@/store";
import ArrowIcon from "@/components/common/ArrowIcon";

interface PaymentCommonLayout {
  need_help_heading: string;
  contact_us_btn_text: string;
}

interface SupportFooterProps {
  className?: string;
  paymentCommonLayout?: PaymentCommonLayout;
}

export default function SupportFooter({ className = "", paymentCommonLayout }: SupportFooterProps) {
  const { language } = useLanguageStore();
  const formatTitle = (text: string) => {
    const words = text.split(' ');
    if (words.length > 5) {
      return `${words.slice(0, 5).join(' ')}\n${words.slice(5).join(' ')}`;
    }
    return text;
  };

  const title = paymentCommonLayout?.need_help_heading 
    ? formatTitle(paymentCommonLayout.need_help_heading)
    : "Need help? We are available\n24/7 for your queries";
  const contactUsText = paymentCommonLayout?.contact_us_btn_text || "Contact Us";

  return (
    <div className={`w-full bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] ${className}`}>
      <div className="ml-72 flex w-full max-w-[1440px] items-center justify-between px-6 py-6 sm:px-6 lg:px-8">
        <div
          className="text-white text-left whitespace-pre-line"
          style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 400 }}
        >
          {title.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <Link href={`/${language}/contact`} className="inline-flex">
          <button
            className=" flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-black p-4  text-[20px] font-bold hover:opacity-85 max-md:w-full relative"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="flex w-full justify-end">
              <ArrowIcon variant="white" />
            </span>
            <span>{contactUsText}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}


