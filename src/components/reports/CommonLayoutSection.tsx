"use client";

import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import ArrowIcon from "@/components/common/ArrowIcon";
import { useRouter } from 'next/navigation';

interface CommonLayoutProps {
    data: any;
}

const CommonLayoutSection: React.FC<CommonLayoutProps> = ({ data }) => {
    const router = useRouter();

    const parsedCards = useMemo(() => {
        try {
            return {
                card1: data.card_one_title ? JSON.parse(data.card_one_title) : null,
                card2: data.card_two_title ? JSON.parse(data.card_two_title) : null,
                card3: data.card_three_title ? JSON.parse(data.card_three_title) : null,
            };
        } catch (e) {
            console.error("Error parsing common layout card data", e);
            return { card1: null, card2: null, card3: null };
        }
    }, [data]);

    if (!data) return null;

    return (
        <div className="bg-[#F5F5F5] py-12 sm:py-16 lg:py-20 font-space-grotesk">
            <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
                        style={{
                            fontFamily: 'Orbitron, sans-serif', // Use variable if available, else fallback
                            background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {data.title || "Seize Tomorrow's Opportunities Today: Access the Full Report"}
                    </h2>
                    <div
                        className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: data.report_conclusion || '' }}
                    />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
                    {/* Card 1: Top Selling Reports */}
                    <div className="flex flex-col rounded-lg overflow-hidden bg-[#1C1C1C] text-white h-full relative group w-full">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] p-6 h-[72px] flex items-center">
                            <h3 className="text-xl font-bold font-space-grotesk w-full">
                                {parsedCards.card1?.title || 'Our Top Selling Reports'}
                            </h3>
                        </div>
                        {/* Content */}
                        <div className="p-6 flex-grow">
                            <ul className="space-y-4">
                                {parsedCards.card1?.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="mr-2 flex-shrink-0">•</span>
                                        <a href={item.report_link || '#'} className="hover:underline text-sm sm:text-base text-gray-200 hover:text-white transition-colors">
                                            {item.report_title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Button */}
                        <div className="p-6 mt-auto">
                            <Button
                                className="w-full min-h-[50px] h-auto py-2 bg-white text-black hover:bg-gray-100 font-bold justify-between group whitespace-normal text-left"
                                onClick={() => router.push(data.btn_1_link || '#')}
                            >
                                <span className="mr-2">{data.btn_1 || 'Request Bulk Purchase'}</span>
                                <img src="/barrow.svg" alt="Arrow" className="w-[32px] h-[12.67px] flex-shrink-0" />
                            </Button>
                        </div>
                    </div>

                    {/* Card 2: Personalize This Report */}
                    <div className="flex flex-col rounded-lg overflow-hidden bg-[#1C1C1C] text-white h-full relative group w-full">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] p-6 h-[72px] flex items-center">
                            <h3 className="text-xl font-bold font-space-grotesk w-full">
                                {parsedCards.card2?.title || 'Personalize This Report'}
                            </h3>
                        </div>
                        {/* Content */}
                        <div className="p-6 flex-grow">
                            <ul className="space-y-4">
                                {parsedCards.card2?.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-start text-sm sm:text-base text-gray-200">
                                        <span className="mr-2 flex-shrink-0">•</span>
                                        <span>{item.report_title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Button */}
                        <div className="p-6 mt-auto">
                            <Button
                                className="w-full min-h-[50px] h-auto py-2 bg-white text-black hover:bg-gray-100 font-bold justify-between group whitespace-normal text-left"
                                onClick={() => router.push(data.btn_2_link || '#')}
                            >
                                <span className="mr-2">{data.btn_2 || 'Request A Free Customisation'}</span>
                                <img src="/barrow.svg" alt="Arrow" className="w-[32px] h-[12.67px] flex-shrink-0" />
                            </Button>
                        </div>
                    </div>

                    {/* Card 3: Let Us Help You */}
                    <div className="flex flex-col rounded-lg overflow-hidden bg-[#1C1C1C] text-white h-full relative group w-full">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] p-6 h-[72px] flex items-center">
                            <h3 className="text-xl font-bold font-space-grotesk w-full">
                                {parsedCards.card3?.title || 'Let Us Help You'}
                            </h3>
                        </div>
                        {/* Content */}
                        <div className="p-6 flex-grow">
                            <ul className="space-y-4">
                                {parsedCards.card3?.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex items-start text-sm sm:text-base text-gray-200">
                                        <span className="mr-2 flex-shrink-0">•</span>
                                        <span>{item.report_title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Button */}
                        <div className="p-6 mt-auto">
                            <Button
                                className="w-full min-h-[50px] h-auto py-2 bg-white text-black hover:bg-gray-100 font-bold justify-between group whitespace-normal text-left"
                                onClick={() => router.push(data.btn_3_link || '#')}
                            >
                                <span className="mr-2">{data.btn_3 || 'Customized Workshop Request'}</span>
                                <img src="/barrow.svg" alt="Arrow" className="w-[32px] h-[12.67px] flex-shrink-0" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommonLayoutSection;
