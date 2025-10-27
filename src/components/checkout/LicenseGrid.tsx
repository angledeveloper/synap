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
    <div className=" grid md:grid-cols-3 gap-8 mt-18">
      {licenses.map((license) => (
        <LicenseCard key={license.id} license={license} onBuy={onBuy} whatYouGetHeading={whatYouGetHeading} />
      ))}
    </div>
  );
}


