import Image from "next/image";

interface ArrowIconProps {
  variant: "gradient" | "white";
  className?: string;
}

export default function ArrowIcon({ variant, className = "" }: ArrowIconProps) {
  const iconSrc = variant === "gradient" ? "/barrow.svg" : "/warrow.svg";
  const altText = variant === "gradient" ? "Gradient arrow" : "White arrow";
  
  return (
    <Image
      src={iconSrc}
      alt={altText}
      width={32.18}
      height={12.67}
      className={`w-8 h-8 ${className}`}
    />
  );
}
