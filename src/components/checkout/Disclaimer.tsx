import React from "react";

interface DisclaimerProps {
  disclaimer?: string;
  className?: string;
}

export default function Disclaimer({ 
  disclaimer, 
  className = "" 
}: DisclaimerProps) {
  if (!disclaimer) return null;
  
  return (
    <div 
      className={`
        text-[10px] xs:text-[12px] sm:text-[14px] text-[#242424] 
        leading-relaxed tracking-wide
        py-2 px-2 sm:px-4 
        rounded-lg text-regular
        ${className}
      `}
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      <div className="text-justify">
        {disclaimer}
      </div>
    </div>
  );
}


