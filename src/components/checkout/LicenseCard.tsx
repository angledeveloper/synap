import React from "react";
import Image from "next/image";
import type { LicenseOption } from "@/app/[lang]/reports/[id]/checkout/page";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

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

export default function LicenseCard({ license, onBuy, whatYouGetHeading = 'What you get' }: LicenseCardProps) {
  const isHighlighted = Boolean(license.highlight);

  return (
    <div className="relative">
      {/* Most Popular banner - positioned behind the card */}
      {isHighlighted && (
        <div className="w-105 h-23.75 absolute left-0 right-0 bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white text-center rounded-t-xl text-[16px] font-bold z-0 "
             style={{ 
               top: '-32px',
               paddingTop: '6px',
               paddingBottom: '14px',
               paddingLeft: '18px',
               paddingRight: '8px'
             }}>
          MOST POPULAR
        </div>
      )}

      {/* Main card container - positioned on top of banner */}
      <div className={`bg-white shadow-md flex flex-col h-full relative z-10 ${
        isHighlighted 
          ? "rounded-xl border-2 border-transparent" 
          : "rounded-xl border border-gray-200"
      }`}
      style={{
        width: '420px',
        height: '800px',
        ...(isHighlighted ? {
          background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box',
          border: '1px solid transparent'
        } : {})
      }}>
        {/* Card content with proper spacing for banner and rounded top corners */}
        <div className={`relative p-6  flex flex-col h-full ${isHighlighted ? 'pt-6' : ''}`}>
        {/* 20% off badge */}
        <div className="w-20 h-7.5 absolute top-4 right-4 bg-[#C7D8E5] text-[#1074C6] px-3 py-1 rounded-[25px] text-[14px] font-bold"style={{fontFamily: 'var(--font-space-grotesk), sans-serif'}}>
          {license.discountPercent ? `${license.discountPercent}` : ''}
        </div>

        {/* Icon */}
        <div className=" mt-0 mb-4 flex items-center justify-start" style={{ height: '60px' }}>
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
        className="text-[24px] text-black mb-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {license.title}
      </h3>

      {/* Description */}
      <p 
        className="text-sm text-gray-700 mb-4 leading-relaxed"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        {license.description}
      </p>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-gray-500 line-through text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {license.actualPrice || ''}
          </span>
          <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {license.price || ''}
          </span>
        </div>
      </div>

      {/* Buy Button */}
      <button
        aria-label={`Buy ${license.title}`}
        onClick={() => onBuy(license)}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 ${
          isHighlighted 
            ? "bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:opacity-90" 
              : "bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
        }`}
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <div className="flex items-center justify-center gap-2">
          {license.buyButtonText || 'Buy License Now'}
          {license.buyButtonIcon && (
            <Image 
              src={license.buyButtonIcon.startsWith('http') ? license.buyButtonIcon : '/' + license.buyButtonIcon?.replace(/^\//, '')} 
              alt="" 
              width={32.19} 
              height={12.67} 
              className="text-white "
            />
          )}
        </div>
      </button>

      {/* What you get section */}
      <div className="flex-1">
        <p 
          className="text-sm font-medium text-gray-900 mb-3"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {whatYouGetHeading}:
        </p>
        <ul className="space-y-2">
          {license.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span 
                className="text-sm text-gray-700"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

        {/* Disclaimer link with hover tooltip */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <p 
              className="mt-4 underline text-xs text-gray-500 cursor-pointer hover:text-gray-700"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Disclaimer
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
  );
}


