"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ArrowIcon from "@/components/common/ArrowIcon";
import dynamic from 'next/dynamic';

// Dynamically import forms
const SampleReportForm = dynamic(() => import('@/components/common/SampleReportForm'), { ssr: false });
const CustomReportForm = dynamic(() => import('@/components/common/CustomReportForm'), { ssr: false });

interface ActionButtonsProps {
    reportTitle: string;
    reportId: string;
    reportImage: string;
    downloadLabel?: string;
    customLabel?: string;
    label?: string; // Added to fix DownloadSampleButton prop type
    variant?: "mobile" | "desktop";
}

export default function ActionButtons({
    reportTitle,
    reportId,
    reportImage,
    downloadLabel = "Download Sample",
    customLabel = "Request Custom Report",
    variant = "mobile"
}: ActionButtonsProps) {
    const [isSampleFormOpen, setIsSampleFormOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <div className="w-full flex justify-center">
                {/* Download Sample Button */}
                <Button
                    className={`${variant === 'desktop' ? 'min-h-[50px]' : 'min-h-[40px]'} h-auto bg-gray-900 text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 py-2 text-[18px]`}
                    style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        width: variant === 'desktop' ? '297px' : '274px',
                    }}
                    onClick={() => setIsSampleFormOpen(true)}
                >
                    <span className="text-left mr-2 whitespace-normal leading-tight">{downloadLabel}</span>
                    <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                </Button>
            </div>

            {/* Custom Report Button (usually separated in UI, but logic is same. 
                Wait, in the UI these are in different divs. 
                I should probably export separate components or just return fragments? 
                The UI has them in different "cards". 
                I'll export two separate components in this file.
             */}

            {isSampleFormOpen && (
                <SampleReportForm
                    isOpen={isSampleFormOpen}
                    onClose={() => setIsSampleFormOpen(false)}
                    reportTitle={reportTitle}
                    reportId={reportId}
                    reportImage={reportImage}
                />
            )}
            {isPopupOpen && (
                <CustomReportForm
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    reportTitle={reportTitle}
                />
            )}
        </>
    );
}

export function CustomReportButton({
    reportTitle,
    label = "Request Custom Report",
    variant = "mobile"
}: { reportTitle: string, label?: string, variant?: "mobile" | "desktop" }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                className={`w-${variant === 'desktop' ? 'full' : '[300px]'} min-h-[50px] h-auto border-${variant === 'desktop' ? 'gray-800' : '[#000000]'} text-black font-bold rounded-${variant === 'desktop' ? 'lg' : '[10px]'} flex items-center justify-between bg-white hover:bg-gray-50 ${variant === 'desktop' ? 'text-[18px]' : 'text-[14px]'} mt-0 px-5 py-2`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => setIsPopupOpen(true)}
            >
                <span className={`${variant === 'desktop' ? 'text-[20px]' : 'text-[14px]'} font-medium text-left mr-2 whitespace-normal leading-tight`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {label}
                </span>
                <div className="flex-shrink-0">
                    <img
                        src="/barrow.svg"
                        alt="Arrow"
                        className={variant === 'desktop' ? "w-8 h-4" : "w-[32px] h-[12.67px]"}
                    />
                </div>
            </Button>

            {isPopupOpen && (
                <CustomReportForm
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    reportTitle={reportTitle}
                />
            )}
        </>
    )
}

// Re-export DownloadButton for clarity if needed, or just use the default
export function DownloadSampleButton({
    reportTitle,
    reportId,
    reportImage,
    label = "Download Sample",
    variant = "mobile"
}: ActionButtonsProps) {
    const [isSampleFormOpen, setIsSampleFormOpen] = useState(false);

    return (
        <>
            <Button
                className={`${variant === 'desktop' ? 'min-h-[50px]' : 'min-h-[40px]'} h-auto bg-gray-900 text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 py-2 text-[18px]`}
                style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    width: variant === 'desktop' ? '297px' : '274px',
                }}
                onClick={() => setIsSampleFormOpen(true)}
            >
                <span className="text-left mr-2 whitespace-normal leading-tight">{label}</span>
                <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
            </Button>

            {isSampleFormOpen && (
                <SampleReportForm
                    isOpen={isSampleFormOpen}
                    onClose={() => setIsSampleFormOpen(false)}
                    reportTitle={reportTitle}
                    reportId={reportId}
                    reportImage={reportImage}
                />
            )}
        </>
    )
}
