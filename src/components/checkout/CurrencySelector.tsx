import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencySelectorProps {
  currencyOptionsText: string;
  currencyDropdown: string;
  value: string;
  onChange: (val: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ currencyOptionsText, currencyDropdown, value, onChange }) => {
  const options: string[] = currencyDropdown?.split(',').map((opt: string) => opt.trim());
  return (
    <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
      <span className="text-sm sm:text-base md:text-[16px] font-normal text-black" style={{fontFamily: 'var(--font-space-grotesk), sans-serif'}}>{currencyOptionsText}</span>
      <Select value={value || options?.[0]} onValueChange={onChange}>
        <SelectTrigger className="w-[80px] sm:w-[90px] md:w-[94px] h-[24px] sm:h-[26px] md:h-[28px] text-sm sm:text-base md:text-[16px] bg-white font-normal text-black border-black rounded-none [&>svg]:!text-black [&>svg]:!opacity-100" style={{fontFamily: 'var(--font-space-grotesk), sans-serif'}}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-black rounded-none">
          {options?.map((opt: string) => <SelectItem value={opt} className="text-black" key={opt}>{opt}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
