import React from "react";
import Image from "next/image";
import type { LicenseOption } from "@/app/[lang]/reports/[id]/checkout/page";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import ArrowIcon from "@/components/common/ArrowIcon";

interface LicenseCardProps {
  license: LicenseOption;
  onBuy: (license: LicenseOption) => void;
  whatYouGetHeading?: string;
}

const getIconSrc = (licenseId: string) => {
  switch (licenseId) {
    case "single":
      return "/single.svg";
    case "team":
      return "/team.svg";
    case "enterprise":
      return "/enterprise.svg";
    default:
      return "/single.svg";
  }
};

const getIconDimensions = (licenseId: string) => {
  switch (licenseId) {
    case "single":
      return { width: 21.33, height: 36 };
    case "team":
      return { width: 62, height: 36.12 };
    case "enterprise":
      return { width: 51.83, height: 49.5 };
    default:
      return { width: 21.33, height: 36 };
  }
};

interface LicenseCardProps {
  license: LicenseOption;
  onBuy: (license: LicenseOption) => void;
  whatYouGetHeading?: string;
  isLastCard?: boolean;
}

export default function LicenseCard({ license, onBuy, whatYouGetHeading = 'What you get', isLastCard = false }: LicenseCardProps) {
  const isHighlighted = Boolean(license.highlight);

  return (
    <div className={`relative ${!isLastCard ? 'mt-8 sm:mt-0' : 'mt-0'}`}>
      {/* Most Popular banner - positioned behind the card */}
      {isHighlighted && (
        <div
          className="w-[310px] sm:w-[350px] lg:w-[398px] h-23.75 absolute left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white text-center rounded-t-xl text-[14px] sm:text-[16px] font-bold z-0"
          style={{
            top: '-32px',
            paddingTop: '6px',
            paddingBottom: '14px',
            paddingLeft: '18px',
            paddingRight: '8px'
          }}
        >
          {license.mostPopularText || 'MOST POPULAR'}
        </div>
      )}

      {/* Main card container - positioned on top of banner */}
      <div className={`bg-white shadow-md flex flex-col h-full relative z-10 ${isHighlighted
        ? "rounded-xl border-2 border-transparent"
        : "rounded-xl border border-gray-300"
        }`}
        style={{
          width: '100%',
          maxWidth: '420px',
          height: 'auto',
          minHeight: '760px',
          ...(isHighlighted ? {
            background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box',
            border: '2px solid transparent'
          } : {
            border: '1px solid #b5b5b5' // gray-300
          })
        }}>
        {/* Card content with proper spacing for banner and rounded top corners */}
        <div className={`relative p-4 sm:p-6 flex flex-col h-full ${isHighlighted ? 'pt-6' : ''}`}>
          {/* 20% off badge */}
          <div className="w-16 h-6 sm:w-20 sm:h-7.5 absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#C7D8E5] text-[#1074C6] px-2 sm:px-3 py-1 rounded-[25px] text-[12px] sm:text-[14px] font-bold" style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
            {license.discountPercent ? `${license.discountPercent}` : ''}
          </div>

          {/* Icon */}
          <div className=" mt-0 mb-6 flex items-center justify-start" style={{ height: '60px' }}>
            <Image
              src={license.icon?.startsWith('http') ? license.icon : '/' + license.icon?.replace(/^\//, '')}
              alt={`${license.title} icon`}
              width={getIconDimensions(license.id).width}
              height={getIconDimensions(license.id).height}
              className="text-gray-600"
            />
          </div>

          {/* Title */}
          <h3
            className="text-[18px] sm:text-[20px] lg:text-[24px] text-black mb-4 sm:mb-6"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
          >
            {license.title}
          </h3>

          {/* Description */}
          <p
            className="text-[14px] sm:text-[15px] lg:text-[16px] text-[#242424] mb-4 sm:mb-6 leading-relaxed"
            style={{ fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}
          >
            {license.description}
          </p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2 sm:gap-4">
              <span className="text-gray-500 font-bold line-through text-[20px] sm:text-[25px] lg:text-[30px]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {license.actualPrice || ''}
              </span>
              <span className="text-[24px] sm:text-[30px] lg:text-[35px] font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {license.price || ''}
              </span>
            </div>
          </div>

          {/* Buy Button */}
          <button
            aria-label={`Buy ${license.title}`}
            onClick={() => onBuy(license)}
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 text-[16px] sm:text-[18px] lg:text-[20px] rounded-lg font-extrabold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 sm:mb-7   ${isHighlighted
              ? "bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:opacity-90"
              : "bg-transparent border border-[#242424] text-[#242424] hover:bg-gray-50 hover:border-gray-400"
              }`}
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            <div className="flex items-center justify-between w-full">
              <span>{license.buyButtonText || 'Buy License Now'}</span>
              <div className="w-8 h-8 flex items-center justify-center">
                <ArrowIcon
                  variant={isHighlighted ? 'white' : 'gradient'}
                  className="w-6 h-6"
                />
              </div>
            </div>
          </button>

          {/* What you get section */}
          <div className="flex-1">
            <p
              className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-[#242424] mb-4 sm:mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {whatYouGetHeading}
            </p>
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
              {license.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 0C4.70995 0 0 4.70995 0 10.5C0 16.2901 4.70995 21 10.5 21C16.2901 21 21 16.2892 21 10.5C21 4.71077 16.2901 0 10.5 0ZM10.5 19.3734C5.60786 19.3734 1.62664 15.393 1.62664 10.5C1.62664 5.60704 5.60786 1.62664 10.5 1.62664C15.393 1.62664 19.3734 5.60704 19.3734 10.5C19.3734 15.393 15.3921 19.3734 10.5 19.3734Z" fill="#1074C6" />
                      <path d="M15.3219 6.84807C14.9909 6.54714 14.476 6.57072 14.1735 6.90336L9.21221 12.3665L6.81534 9.92978C6.49894 9.60932 5.98493 9.60444 5.6653 9.92002C5.34484 10.2348 5.33996 10.7496 5.65554 11.0701L8.65587 14.12C8.8096 14.2762 9.01779 14.3632 9.23575 14.3632C9.24063 14.3632 9.24633 14.3632 9.25121 14.364C9.47569 14.3591 9.68717 14.2632 9.83761 14.0973L15.3771 7.99733C15.6789 7.66383 15.6545 7.14982 15.3219 6.84807Z" fill="#1074C6" />
                    </svg>
                  </div>
                  <span
                    className="text-[14px] sm:text-[15px] lg:text-[16px] text-[#242424]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer - Mobile (plain text with title) */}
          <div className="block md:hidden">
            <p
              className="underline text-xs text-gray-500"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {license.disclaimerHeading || 'Disclaimer'}
            </p>
            <p
              className="text-xs text-gray-500 mt-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {license.disclaimer || 'No specific disclaimer provided.'}
            </p>
          </div>

          {/* Disclaimer - Desktop (hover popup) */}
          <div className="hidden md:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <p
                  className="underline text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {license.disclaimerHeading || 'Disclaimer'}
                </p>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {license.disclaimer || 'No specific disclaimer provided.'}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  );
}


