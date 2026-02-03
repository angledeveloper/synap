
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useHomePageStore, useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { Icon } from "@iconify/react";
import GlobalAboveFooter from "@/components/layout/GlobalAboveFooter";
import Link from "next/link";
import ArrowIcon from "@/components/common/ArrowIcon";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import CustomReportForm from "@/components/common/CustomReportForm";
import CaseStudiesSection from "@/components/common/CaseStudies";



export default function HomeClient() {
    const { HomePage, setHomePage } = useHomePageStore();
    const { language } = useLanguageStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlight = searchParams?.get('highlight');
    const [testimonialsIndex, setTestimonialsIndex] = useState<number>(0);
    const [isCustomReportFormOpen, setIsCustomReportFormOpen] = useState(false);

    // Helper function to highlight text
    const highlightText = (text: string | undefined | null) => {
        if (!text) return '';
        if (!highlight) return text;

        try {
            // Escape special regex characters
            const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedHighlight})`, 'gi');
            return text.replace(regex, '<mark class="bg-yellow-300 text-black rounded-sm px-0.5">$1</mark>');
        } catch (e) {
            return text;
        }
    };

    // Auto-scroll to highlight
    useEffect(() => {
        if (!highlight) return;

        const timer = setTimeout(() => {
            const marks = document.getElementsByTagName('mark');
            if (marks.length > 0) {
                marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 1000); // Slightly longer delay for homepage hydration

        return () => clearTimeout(timer);
    }, [highlight, HomePage]);

    const getReportsHref = (label: string | undefined) => {
        if (!label) return `/${language}`;
        const l = label.trim().toLowerCase();
        return l.includes("explore") && l.includes("report") ? `/${language}/reports` : `/${language}`;
    };

    const handleReportClick = (categoryId: string | number) => {
        // Ensure categoryId is a non-empty string
        const safeCategoryId = String(categoryId || '1').trim();
        if (!safeCategoryId) {
            console.error('Invalid category ID:', categoryId);
            return;
        }
        // Directly navigate to reports page with the category filter
        router.push(`/${language}/reports?category=${safeCategoryId}`);
    };

    useEffect(() => {
        if (!HomePage?.testimonials?.length) return;
        const interval = setInterval(() => {
            setTestimonialsIndex((prev) => (prev + 1) % HomePage.testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [HomePage]);

    // Do not clear HomePage on mount; Navbar provider populates it.
    // Keeping this empty avoids a race where the page clears store and never repopulates.

    if (!HomePage)
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <h1>Loading...</h1>
            </div>
        );

    return (
        <>
            <Head>
                <link rel="preload" href="/blackgrid.png" as="image" />
            </Head>
            <section className="relative bg-black text-white">
                <Image
                    src="/hero.jpg"
                    alt={HomePage.home_section1?.title ?? ''}
                    fill
                    className="bg-no-repeat object-cover"
                />
                <div className="relative flex h-screen min-h-[500px] w-full flex-col items-center justify-end p-4">
                    {/* Mobile layout - shown only on mobile (below 768px) */}
                    <div className="block w-full flex-col items-center justify-center px-4 md:hidden">
                        <h1 className="mb-8 w-full text-center text-[32px] uppercase">
                            <span dangerouslySetInnerHTML={{ __html: highlightText(HomePage.home_section1?.title) }} />
                        </h1>
                        <div className="mb-8 w-full text-center text-[16px]">
                            {HomePage.home_section1?.description?.split('\n').map((line: string, index: number) => (
                                <div key={`mobile-${index}`} className="mb-2" dangerouslySetInnerHTML={{ __html: highlightText(line) }} />
                            ))}
                        </div>
                        <div className="flex w-full flex-col items-center gap-4">
                            <button
                                onClick={() => handleReportClick(HomePage.home_section4_reports?.[0]?.category_id || HomePage.home_section4_reports?.[0]?.id || '1')}
                                className="flex h-[80px] w-full cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[16px] font-bold hover:opacity-85"
                            >
                                <span className="flex w-full justify-end">
                                    <ArrowIcon variant="gradient" />
                                </span>
                                <span>{HomePage.home_section1?.first_button ?? ''}</span>
                            </button>
                            <button
                                onClick={() => setIsCustomReportFormOpen(true)}
                                className="w-full"
                            >
                                <div className="flex h-[80px] w-full cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[16px] font-bold hover:opacity-85">
                                    <span className="flex w-full justify-end">
                                        <ArrowIcon variant="white" />
                                    </span>
                                    <span>{HomePage.home_section1?.second_button ?? ''}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Tablet layout - only at 834px */}
                    <div className="hidden w-full max-w-[834px] flex-col items-center justify-center px-4 [@media(width:834px)]:flex">
                        <h1 className="mb-8 w-full text-center text-[48px] uppercase">
                            <span dangerouslySetInnerHTML={{ __html: highlightText(HomePage.home_section1?.title) }} />
                        </h1>
                        <div className="mb-8 w-full text-center text-[20px]">
                            {HomePage.home_section1?.description?.split('\n').map((line: string, index: number) => (
                                <div key={`tablet-${index}`} className="mb-2" dangerouslySetInnerHTML={{ __html: highlightText(line) }} />
                            ))}
                        </div>
                        <div className="flex w-full flex-wrap justify-center gap-4">
                            <button
                                onClick={() => handleReportClick(HomePage.home_section4_reports?.[0]?.category_id || HomePage.home_section4_reports?.[0]?.id || '1')}
                                className="flex h-[105px] w-full max-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] font-bold hover:opacity-85"
                            >
                                <span className="flex w-full justify-end">
                                    <ArrowIcon variant="gradient" />
                                </span>
                                <span>{HomePage.home_section1?.first_button ?? ''}</span>
                            </button>
                            <button
                                onClick={() => setIsCustomReportFormOpen(true)}
                                className="w-full max-w-[300px]"
                            >
                                <div className="flex h-[105px] w-full cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] font-bold hover:opacity-85">
                                    <span className="flex w-full justify-end">
                                        <ArrowIcon variant="white" />
                                    </span>
                                    <span>{HomePage.home_section1?.second_button ?? ''}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Desktop layout - for screens larger than 834px */}
                    <div className="hidden w-full max-w-[1440px] flex-col items-center justify-center [@media(width:834px)]:hidden md:flex">
                        <h1 className="mx-auto mb-20 max-w-[900px] text-center text-[32px] uppercase md:text-[64px] w-full">
                            <span dangerouslySetInnerHTML={{ __html: highlightText(HomePage.home_section1?.title) }} />
                        </h1>
                        <div className="flex w-full flex-col justify-between gap-10 p-3 md:flex-row">
                            <div className="flex w-full flex-col flex-wrap gap-4 md:flex-row">
                                <button
                                    onClick={() => handleReportClick(HomePage.home_section4_reports?.[0]?.category_id || HomePage.home_section4_reports?.[0]?.id || '1')}
                                    className="flex h-[105px] min-w-0 cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full sm:min-w-[300px]"
                                >
                                    <span className="flex w-full justify-end">
                                        <ArrowIcon variant="gradient" />
                                    </span>
                                    <span>{HomePage.home_section1?.first_button ?? ''}</span>
                                </button>
                                <button
                                    onClick={() => setIsCustomReportFormOpen(true)}
                                    className="flex h-[105px] min-w-0 cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full sm:min-w-[300px]"
                                >
                                    <span className="flex w-full justify-end">
                                        <ArrowIcon variant="white" />
                                    </span>
                                    <span>{HomePage.home_section1?.second_button ?? ''}</span>
                                </button>
                            </div>
                            <div className="w-full text-[20px] text-left">
                                {HomePage.home_section1?.description?.split('\n').map((line: string, index: number) => (
                                    <div key={`desktop-${index}`} className="mb-2" dangerouslySetInnerHTML={{ __html: highlightText(line) }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Desktop layout for home_section2 - hidden on 834px */}
            <section className="hidden w-full justify-center bg-[#000] p-3 py-10 md:flex [@media(width:834px)]:hidden">
                <div className="flex w-full max-w-[1440px] flex-col items-center justify-center gap-10 md:flex-row">
                    {HomePage.home_section2?.map((section: any, index: number) => (
                        <div
                            key={`desktop-${index}`}
                            style={{
                                backgroundColor: `${index === 1 ? "#0B7751" : index === 2 ? "#1895A3" : "#FFFFFF"}`,
                                color: `${index === 1 ? "#FFFFFF" : index === 2 ? "#FFFFFF" : "#000000"}`,
                            }}
                            className={`flex w-full max-w-md flex-col items-center justify-center ${index === 1 ? "md:mt-0" : index === 3 ? "md:mt-0" : "md:mt-[200px]"}`}
                        >
                            <div className="mb-2 w-full p-4">
                                <span className="text-[20px] font-bold" dangerouslySetInnerHTML={{ __html: highlightText(section.title) }} />
                                <p className="mt-2 text-[16px]" dangerouslySetInnerHTML={{ __html: highlightText(section.description) }} />
                            </div>

                            <div className="aspect-square w-full">
                                <Image
                                    className="h-full w-full object-cover"
                                    src={section.image}
                                    alt={section.title}
                                    width={1000}
                                    height={1000}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tablet layout for home_section2 - only visible at 834px */}
            <section className="hidden w-full justify-center bg-[#000] p-5 py-25 [@media(width:834px)]:flex">
                <div className="grid w-full max-w-[834px] grid-cols-2 gap-6">
                    {HomePage.home_section2?.map((section: any, index: number) => (
                        <div
                            key={`tablet-${index}`}
                            className="flex h-full w-full flex-col items-center justify-between"
                            style={{
                                backgroundColor: `${index === 1 ? "#0B7751" : index === 2 ? "#1895A3" : "#FFFFFF"}`,
                                color: `${index === 1 ? "#FFFFFF" : index === 2 ? "#FFFFFF" : "#000000"}`,
                            }}
                        >
                            <div className="w-full p-4">
                                <span className="text-[18px] font-bold" dangerouslySetInnerHTML={{ __html: highlightText(section.title) }} />
                                <p className="mt-2 text-[14px]" dangerouslySetInnerHTML={{ __html: highlightText(section.description) }} />
                            </div>
                            <div className="relative h-0 w-full pt-[100%]">
                                <Image
                                    className="absolute inset-0 h-full w-full object-cover"
                                    src={section.image}
                                    alt={section.title}
                                    width={400}
                                    height={400}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section
                className="w-full bg-gradient-to-b from-[#000910] to-[#000] bg-cover bg-center py-20 md:min-h-[450px] md:py-24 relative"
                style={{
                    backgroundImage: `url('/blackgrid.png')`,
                    backgroundPosition: "bottom",
                    backgroundSize: "fit",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "local",
                }}
            >
                <div className="m-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 p-3 md:flex-row">
                    <div className="text-[32px] font-medium max-md:text-center md:text-[40px]">
                        <span dangerouslySetInnerHTML={{ __html: highlightText(HomePage.home_section3?.tagline) }} />
                    </div>
                    <button
                        onClick={() => handleReportClick(HomePage.home_section4_reports?.[0]?.category_id || HomePage.home_section4_reports?.[0]?.id || '1')}
                        className="flex h-[105px] min-w-0 cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-black/5 p-4 text-[20px] font-bold backdrop-blur-[5px] transition-all duration-300 hover:border-white/40 hover:text-neutral-400 max-md:w-full sm:min-w-[300px]"
                    >
                        <span className="flex w-full justify-end">
                            <ArrowIcon variant="white" />
                        </span>
                        <span>{HomePage.home_section3?.button ?? ''}</span>
                    </button>
                </div>
            </section>
            <GlobalAboveFooter />
            <section id="home_section4_reports" className="w-full bg-white text-black">
                <div className="m-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 p-3 pb-15 pt-10 sm:grid-cols-1 md:grid-cols-2 md:gap-10 md:pt-20 lg:grid-cols-3">
                    {HomePage.home_section4_reports?.map((item: any, index: number) => (
                        <div
                            key={index}
                            onClick={() => handleReportClick(item.category_id || item.id || '1')}
                            className="group relative h-full w-full bg-[#F2F1EF] hover:bg-[#2F2F2F] cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={1000}
                                height={1000}
                                className="aspect-video w-full bg-neutral-200 object-cover"
                            />
                            <div className="flex flex-col gap-2 p-4 group-hover:bg-[#2F2F2F]">
                                <div className="flex items-center justify-between gap-2 from-[#1160C9] to-[#08D2B8] font-mono text-[20px] leading-snug font-bold transition-all duration-200 group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent">
                                    {item.title}
                                    <div className="relative h-[14px] w-[33px]">
                                        <ArrowIcon
                                            variant="gradient"
                                            className="absolute inset-0 h-full w-full opacity-100 transition-opacity duration-200 group-hover:opacity-0"
                                        />
                                        <ArrowIcon
                                            variant="white"
                                            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                        />
                                    </div>
                                </div>
                                <p className="text-[16px] group-hover:text-[#F2F1EF] line-clamp-3 multilingual-text">
                                    {item.introduction_description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="w-full bg-[#F5F5F5]">
                <div className="w-full bg-white">

                    <div className="w-full flex justify-center bg-[#F5F5F5] py-16">
                        <div className="w-full max-w-[900px] px-4 text-center">

                            <h4 className="text-[32px] md:text-[64px] font-bold mb-8 text-[#242424]">
                                <span dangerouslySetInnerHTML={{ __html: highlightText(HomePage.home_section5?.title) }} />
                            </h4>

                            {/* TESTIMONIAL CAROUSEL */}
                            <div className="relative w-full h-[280px] md:h-[320px]">
                                {HomePage.testimonials.map((testimonial: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-500 ${testimonialsIndex === index
                                            ? "opacity-100 z-10"
                                            : "opacity-0 z-0"
                                            }`}
                                        style={{
                                            pointerEvents: testimonialsIndex === index ? "auto" : "none",
                                        }}
                                    >
                                        <div className="mb-10 text-[22px] md:text-[32px] font-mono bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent">
                                            "<span dangerouslySetInnerHTML={{ __html: highlightText(testimonial.feedback) }} />"
                                        </div>

                                        <div className="text-[26px] font-semibold text-black">
                                            <span dangerouslySetInnerHTML={{ __html: highlightText(testimonial.name) }} />
                                        </div>

                                        <div className="text-[18px] text-[#888]">
                                            <span dangerouslySetInnerHTML={{ __html: highlightText(testimonial.title) }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* NAV + INDICATORS */}
                            <div className="flex w-full items-center justify-center gap-4">
                                <div
                                    onClick={() => {
                                        setTestimonialsIndex(prev =>
                                            prev === 0
                                                ? HomePage.testimonials.length - 1
                                                : prev - 1
                                        );
                                    }}
                                    className="cursor-pointer text-2xl text-[#000] mt-6"
                                >
                                    <Icon icon="iconoir:arrow-left" />
                                </div>

                                <div
                                    className="grid h-[5px] w-full max-w-[800px] mt-6"
                                    style={{
                                        gridTemplateColumns: `repeat(${HomePage.testimonials.length}, 1fr)`,
                                    }}
                                >
                                    {HomePage.testimonials.map((_: any, index: number) => (
                                        <div
                                            key={index}
                                            className="h-[5px] transition-all duration-300"
                                            style={{
                                                backgroundColor:
                                                    testimonialsIndex === index ? "#000" : "#d1d5db",
                                                transform: testimonialsIndex === index ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        />
                                    ))}
                                </div>

                                <div
                                    onClick={() => {
                                        setTestimonialsIndex(prev =>
                                            prev === HomePage.testimonials.length - 1 ? 0 : prev + 1
                                        );
                                    }}
                                    className="cursor-pointer text-2xl text-[#000] mt-6"
                                >
                                    <Icon icon="iconoir:arrow-right" />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* === CASE STUDIES SECTION BELOW === */}
                    <div id="casestudiessection" className="w-full">
                        <CaseStudiesSection
                            caseStudies={HomePage.case_studies}
                            title={HomePage.navbar?.casestudy}
                        />
                    </div>

                </div>
            </section>

            {/* Custom Report Form */}
            <CustomReportForm
                isOpen={isCustomReportFormOpen}
                onClose={() => setIsCustomReportFormOpen(false)}
            />
        </>
    );
}
