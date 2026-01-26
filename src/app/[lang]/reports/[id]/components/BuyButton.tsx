"use client";

import { Button } from "@/components/ui/button";
import ArrowIcon from "@/components/common/ArrowIcon";
import { useRouter } from "next/navigation";

interface BuyButtonProps {
    lang: string;
    id: string; // Report ID or Slug
    label?: string;
    variant?: "mobile" | "desktop";
}

export default function BuyButton({ lang, id, label = "Buy License Now", variant = "mobile" }: BuyButtonProps) {
    const router = useRouter();

    if (variant === "desktop") {
        return (
            <Button
                className="h-[50px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
                style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    width: '297px'
                }}
                onClick={() => router.push(`/${lang}/reports/${id}/checkout`)}
                aria-label={label}
            >
                <span className="truncate">{label}</span>
                <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
            </Button>
        );
    }

    return (
        <Button
            className="h-[40px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
            style={{
                fontFamily: 'Space Grotesk, sans-serif',
                width: '274px'
            }}
            onClick={() => router.push(`/${lang}/reports/${id}/checkout`)}
            aria-label={label}
        >
            <span className="truncate">{label}</span>
            <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
        </Button>
    );
}
