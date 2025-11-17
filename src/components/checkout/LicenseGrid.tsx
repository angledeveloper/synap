import React from "react";
import type { LicenseOption } from "@/app/[lang]/reports/[id]/checkout/page";
import LicenseCard from "./LicenseCard";

interface LicenseGridProps {
  licenses: LicenseOption[];
  onBuy: (license: LicenseOption) => void;
  whatYouGetHeading?: string;
}

export default function LicenseGrid({ licenses, onBuy, whatYouGetHeading }: LicenseGridProps) {
  return (
    <div className="w-full max-w-[1352px] mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 lg:mt-18">
      {licenses.map((license, index) => (
        <LicenseCard 
          key={license.id} 
          license={license} 
          onBuy={onBuy} 
          whatYouGetHeading={whatYouGetHeading} 
          isLastCard={index === licenses.length - 1}
        />
      ))}
      </div>
    </div>
  );
}


