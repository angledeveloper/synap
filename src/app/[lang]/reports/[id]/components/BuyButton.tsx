"use client";

import { Button } from "@/components/ui/button";
import ArrowIcon from "@/components/common/ArrowIcon";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
  lang: string;
  id: string; // Report ID or Slug
  label?: string;
  variant?: "mobile" | "desktop";
  className?: string;
}

export default function BuyButton({
  lang,
  id,
  label = "Buy License Now",
  variant = "mobile",
  className,
}: BuyButtonProps) {
  const router = useRouter();

  if (variant === "desktop") {
    return (
      <Button
        className="flex h-[50px] items-center justify-between rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 text-[18px] font-bold text-white hover:bg-gray-700"
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          width: "297px",
        }}
        onClick={() => router.push(`/${lang}/reports/${id}/checkout`)}
        aria-label={label}
      >
        <span className="truncate">{label}</span>
        <ArrowIcon variant="white" className="h-6 w-6 flex-shrink-0" />
      </Button>
    );
  }

  return (
    <Button
      className={`flex h-[40px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 text-[18px] font-bold text-white hover:bg-gray-700 md:w-[274px] ${className || ""}`}
      style={{
        fontFamily: "Space Grotesk, sans-serif",
      }}
      onClick={() => router.push(`/${lang}/reports/${id}/checkout`)}
      aria-label={label}
    >
      <span className="truncate">{label}</span>
      {variant === "desktop" && (
        <ArrowIcon variant="white" className="h-6 w-6 flex-shrink-0" />
      )}
    </Button>
  );
}
