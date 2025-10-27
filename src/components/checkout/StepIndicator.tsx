import React from "react";

interface StepIndicatorProps {
  currentStep?: number;
  choosePlanHeading?: string;
  billingHeading?: string;
  confirmationHeading?: string;
}

export default function StepIndicator({ currentStep = 1, choosePlanHeading, billingHeading, confirmationHeading }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center w-338 gap-[5px]">
        <div className={`px-6 py-2 flex-1 text-center ${
          currentStep === 1 
            ? "bg-black" 
            : ""
        }`} style={{ 
          backgroundColor: currentStep === 1 ? '#000000' : '#E9E9E9',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '20px',
          color: currentStep === 1 ? '#FFFFFF' : '#242424'
        }}>
          {choosePlanHeading}
        </div>
        <div className={`px-6 py-2 flex-1 text-center ${
          currentStep === 2 
            ? "bg-black" 
            : ""
        }`} style={{ 
          backgroundColor: currentStep === 2 ? '#000000' : '#E9E9E9',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '20px',
          color: currentStep === 2 ? '#FFFFFF' : '#242424'
        }}>
          {billingHeading}
        </div>
        <div className={`px-6 py-2 flex-1 text-center ${
          currentStep === 3 
            ? "bg-black" 
            : ""
        }`} style={{ 
          backgroundColor: currentStep === 3 ? '#000000' : '#E9E9E9',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '20px',
          color: currentStep === 3 ? '#FFFFFF' : '#242424'
        }}>
          {confirmationHeading}
        </div>
      </div>
    </div>
  );
}
