import React from "react";

interface StepIndicatorProps {
  currentStep?: number;
  choosePlanHeading?: string;
  billingHeading?: string;
  confirmationHeading?: string;
}

const MobileStep = ({ 
  isActive, 
  children,
  stepNumber,
  currentStep
}: { 
  isActive: boolean; 
  children: React.ReactNode;
  stepNumber: number;
  currentStep: number;
}) => (
  <div 
    className={`px-6 py-2 w-full text-center ${
      isActive ? "bg-black" : ""
    }`} 
    style={{ 
      backgroundColor: isActive ? '#000000' : '#E9E9E9',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '20px',
      color: isActive ? '#FFFFFF' : '#242424',
      display: stepNumber === currentStep ? 'block' : 'none'
    }}
  >
    {children}
  </div>
);

export default function StepIndicator({ currentStep = 1, choosePlanHeading, billingHeading, confirmationHeading }: StepIndicatorProps) {
  const steps = [
    { id: 1, label: choosePlanHeading },
    { id: 2, label: billingHeading },
    { id: 3, label: confirmationHeading }
  ];

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Mobile - Only show current step */}
        <div className="block md:hidden w-full">
          {steps.map((step) => (
            <MobileStep 
              key={step.id} 
              isActive={step.id === currentStep}
              stepNumber={step.id}
              currentStep={currentStep}
            >
              {step.label}
            </MobileStep>
          ))}
        </div>
        
        {/* Desktop - Three step indicator */}
        <div className="hidden md:flex items-center w-full gap-[5px] bg-white">
          <div 
            className={`px-4 py-3 text-center relative ${currentStep === 1 ? "bg-black" : "bg-[#E9E9E9]"}`} 
            style={{ 
              flex: '1 0 auto',
              minWidth: '200px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '20px',
              color: currentStep === 1 ? '#FFFFFF' : '#242424',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              position: 'relative',
              zIndex: 1
            }}
          >
            {choosePlanHeading}
            {currentStep === 1 && (
              <div className="absolute bottom-[-5px] left-0 w-full h-[5px] bg-[#F4F4F4] z-10"></div>
            )}
          </div>
          <div 
            className={`px-4 py-3 text-center relative ${currentStep === 2 ? "bg-black" : "bg-[#E9E9E9]"}`} 
            style={{ 
              flex: '1 0 auto',
              minWidth: '200px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '20px',
              color: currentStep === 2 ? '#FFFFFF' : '#242424',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              position: 'relative',
              zIndex: 1
            }}
          >
            {billingHeading}
            {currentStep === 2 && (
              <div className="absolute bottom-[-5px] left-0 w-full h-[5px] bg-[#F4F4F4] z-10"></div>
            )}
          </div>
          <div 
            className={`px-4 py-3 text-center relative ${currentStep === 3 ? "bg-black" : "bg-[#E9E9E9]"}`} 
            style={{ 
              flex: '1 0 auto',
              minWidth: '200px',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '20px',
              color: currentStep === 3 ? '#FFFFFF' : '#242424',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              position: 'relative',
              zIndex: 1
            }}
          >
            {confirmationHeading}
            {currentStep === 3 && (
              <div className="absolute bottom-[-5px] left-0 w-full h-[5px] bg-[#F4F4F4] z-10"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
