"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLanguageStore, useHomePageStore } from "@/store";
import { codeToId, extractIdFromSlug } from "@/lib/utils";
import { ReportDetail, ReportSection } from "@/types/reports";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useCategory } from "@/hooks/useCategory";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import ArrowIcon from "@/components/common/ArrowIcon";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';

// Dynamically import form components with no SSR
const SampleReportForm = dynamic(() => import('@/components/common/SampleReportForm'), {
    ssr: false
});

const CustomReportForm = dynamic(() => import('@/components/common/CustomReportForm'), {
    ssr: false
});
import useSWR from 'swr';


export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { language } = useLanguageStore();
    const { HomePage } = useHomePageStore();
    const searchParams = useSearchParams();
    const highlight = searchParams?.get('highlight');
    const [activeTab, setActiveTab] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isSampleFormOpen, setIsSampleFormOpen] = useState(false);
    const [email, setEmail] = useState('');
    const formRef = useRef<HTMLDivElement>(null);

    // Close form when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                setIsSampleFormOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSampleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Submitted email:', email);
        // Close the form after submission
        setIsSampleFormOpen(false);
    };
    const [formData, setFormData] = useState({
        fullName: '',
        businessEmail: '',
        phoneNumber: '',
        country: '',
        countryCode: '+91',
        reportRequirements: '',
        industryFocus: '',
        timeline: ''
    });

    // Get language ID from the language store
    const languageId = codeToId[language as keyof typeof codeToId] || 1;

    // Extract report ID from slug
    const reportId = extractIdFromSlug(params.id as string);

    // Calculate default category ID based on language
    // If we have HomePage data, use the first category for the current language
    // Otherwise default to "1"
    const defaultCategoryId = useMemo(() => {
        if (!HomePage?.report_store_dropdown) return "1";

        // Find categories for current language
        const langCats = HomePage.report_store_dropdown.filter(
            (c: any) => String(c.language_id) === String(languageId)
        );

        // Use the first category ID if found, otherwise keep "1"
        return langCats.length > 0 ? String(langCats[0].category_id) : "1";
    }, [HomePage, languageId]);

    // Fetch report data from API
    const { data, isLoading, error } = useReportDetail({
        reportId: reportId,
        categoryId: defaultCategoryId,
        languageId: languageId.toString(),
    });

    const report = data?.data?.report;
    const sections = data?.data?.sections || [];
    const commonLayout = data?.common_layout;

    // Get category information using the report's category_id
    const { data: categoryData } = useCategory({
        categoryId: report?.category_id?.toString() || "",
        languageId: languageId.toString(),
    });

    // Get dynamic translations
    const { data: translations } = useTranslations({ language, page: 'reportDetail' });
    const t = translations || {
        breadcrumbHome: "Home",
        breadcrumbCategory: "Technology & Software",
        lastUpdated: "Last Updated",
        baseYear: "Base Year data",
        format: "Format",
        industry: "Industry",
        forecastPeriod: "Forecast Period",
        reportId: "Report ID",
        numberOfPages: "Number of Pages",
        tocIncluded: "TOC included",
        introduction: "Introduction",
        keyHighlights: "Key Report Highlights",
        dominantSegments: "Dominant Segments",
        competitiveIntelligence: "Competitive Intelligence",
        strategicInsights: "Strategic Insights",
        regionalDynamics: "Regional Dynamics",
        oneTimeCost: "One Time Cost",
        addToCart: "Add to Cart",
        getFreeSample: "GET A FREE SAMPLE",
        sampleDescription: "The sample includes market data points, trend analyses, and market estimates.",
        downloadSample: "Download Sample",
        needCustomReport: "NEED A CUSTOM REPORT?",
        customReportDescription: "Reports can be customized, including stand-alone sections or country-level reports, with discounts for start-ups and universities.",
        requestCustomReport: "Request Custom Report",
        shareAt: "SHARE AT:",
    };

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

    // Effect to handle auto-scrolling and tab switching for search results
    useEffect(() => {
        if (!highlight || !report || sections.length === 0) return;

        const query = highlight.toLowerCase();

        // Check if the query is in any specific section (tab)
        const foundSectionIndex = sections.findIndex(s =>
            s.section_description.toLowerCase().includes(query) ||
            s.section_name.toLowerCase().includes(query)
        );

        if (foundSectionIndex !== -1) {
            setActiveTab(foundSectionIndex);
        }

        // Scroll to the first highlighted element after a short delay to allow rendering
        const timer = setTimeout(() => {
            const marks = document.getElementsByTagName('mark');
            if (marks.length > 0) {
                marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [highlight, report, sections]);

    // Fetch checkout page to read Single License pricing (for One Time Cost box)
    const fetchCheckoutData = async (lang: string) => {
        // Map language code to ID (1-8)
        const languageMap: Record<string, string> = {
            'en': '1',
            'es': '2',
            // Add more language mappings as needed
        };

        const languageId = languageMap[lang] || '1'; // Default to English (1) if language not found

        const res = await fetch(`https://dashboard.synapseaglobal.com/api/checkout/${languageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!res.ok) throw new Error('Failed to fetch checkout data');
        return res.json();
    };

    const { data: checkoutApi } = useSWR('checkout-api', () => fetchCheckoutData(language));
    const checkout_page = checkoutApi?.checkout_page;
    // Pick a currency (first from dropdown) → derive suffix and symbol. Fallback USD
    let singleActualPriceStr: string = '';
    let singleOfferPriceStr: string = '';
    if (checkout_page) {
        const dropdown: string = checkout_page?.currency_dropdown || 'USD,INR,EUR';
        const first = (dropdown.split(',')[0] || 'USD').trim();
        const map: Record<string, { suffix: string; symbol: string }> = {
            USD: { suffix: 'USD', symbol: '$' },
            INR: { suffix: 'INR', symbol: '₹' },
            EUR: { suffix: 'EUR', symbol: '€' },
            '5': { suffix: 'USD', symbol: '$' },
            '6': { suffix: 'INR', symbol: '₹' },
            '7': { suffix: 'EUR', symbol: '€' },
        };
        const label = map[first] || map.USD;
        singleOfferPriceStr = checkout_page[`single_license_offer_price_in_${label.suffix}`] || checkout_page[`single_license_offer_price_in_USD`] || '';
        singleActualPriceStr = checkout_page[`single_license_actual_price_in_${label.suffix}`] || checkout_page[`single_license_actual_price_in_USD`] || '';
    }

    // Form handlers
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
        // Close popup after submission
        setIsPopupOpen(false);
        // Reset form
        setFormData({
            fullName: '',
            businessEmail: '',
            phoneNumber: '',
            country: '',
            countryCode: '+91',
            reportRequirements: '',
            industryFocus: '',
            timeline: ''
        });
    };

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    if (isLoading || !HomePage) {
        return (
            <div className="min-h-screen bg-white pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <Skeleton className="h-8 w-3/4 mb-4" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3 mb-8" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h1
                        className="text-2xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                        Error Loading Report
                    </h1>
                    <p
                        className="text-gray-600"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                        There was an error loading the report. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    if (!data || !report) {
        return (
            <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
                <div className="text-center">
                    <h1
                        className="text-2xl font-bold text-gray-900 mb-4"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                        Report Not Found
                    </h1>
                    <p
                        className="text-gray-600"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                        The report you're looking for doesn't exist or is not available in the selected language.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20">
            {/* Breadcrumbs */}
            <div className="pt-11 pb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol
                            className="flex items-center space-x-2 justify-start sm:justify-center min-w-0"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                            <li className="flex-shrink-0">
                                <a href={`/${language}`} className="text-gray-500 hover:text-gray-700 font-normal text-sm">
                                    {t.breadcrumbHome}
                                </a>
                            </li>
                            <li className="flex-shrink-0">
                                <Icon icon="mdi:chevron-right" className="text-gray-500 text-sm" />
                            </li>
                            <li className="flex-shrink-0">
                                <a href={`/${language}/reports`} className="text-gray-500 hover:text-gray-700 whitespace-nowrap font-normal text-sm">
                                    {t.breadcrumbCategory}
                                </a>
                            </li>
                            <li className="flex-shrink-0">
                                <Icon icon="mdi:chevron-right" className="text-gray-500 text-sm" />
                            </li>
                            <li className="min-w-0 flex-1">
                                <span className="text-gray-500 font-normal text-sm truncate block">
                                    {report.title.split(' ').slice(0, 5).join(' ') + (report.title.split(' ').length > 5 ? '...' : '')}
                                </span>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 sm:py-6 lg:py-8">
                {/* Content and Sidebar: mobile full width, desktop grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative">
                    {/* Main Content Area: full width on mobile, 2/3 on desktop */}
                    <div className="col-span-1 lg:col-span-2">
                        {/* Report Header */}
                        <div className="flex flex-col mb-4 sm:mb-6">
                            {/* Divider 1 */}
                            <div className="w-full h-px bg-[#E5E5E5] mb-6"></div>

                            {/* Title and Image Container */}
                            <div className="flex flex-row gap-4 sm:gap-6 mb-6">
                                {/* Report Image - 93x93, no border radius */}
                                <div className="w-[93px] h-[93px] flex-shrink-0 bg-gray-200 overflow-hidden">
                                    {report.image ? (
                                        <Image
                                            src={report.image}
                                            alt={report.title}
                                            width={93}
                                            height={93}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <Icon icon="mdi:file-document-outline" className="text-3xl text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Report Title */}
                                <div className="flex-1">
                                    <h1
                                        className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent"
                                        style={{
                                            fontFamily: 'Space Grotesk, sans-serif',
                                            fontSize: '24px',
                                            lineHeight: '31px',
                                            letterSpacing: '0px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {report.title}
                                    </h1>
                                </div>
                            </div>

                            {/* Report Metadata Grid - Full width below title/image */}
                            <div
                                className="flex flex-col sm:flex-row justify-between w-full mb-6 gap-y-4"
                                style={{
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    fontSize: '12px',
                                    lineHeight: '18px',
                                    letterSpacing: '0px',
                                    fontWeight: '400', // Regular font weight
                                    color: '#7C7C7C'
                                }}
                            >
                                {/* Column 1 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{t.lastUpdated}:</span>
                                        <span className="ml-1">{new Date(report.modify_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{t.baseYear}:</span>
                                        <span className="ml-1">{report.base_year}</span>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{t.format}:</span>
                                        <span className="ml-1">{report.format}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{t.industry} - {categoryData?.name || 'Technology & Software'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{t.forecastPeriod}:</span>
                                        <span className="ml-1">{report.forecast_period}</span>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{t.reportId}:</span>
                                        <span className="ml-1">{report.report_id}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{t.numberOfPages} -</span>
                                        <span className="ml-1">{report.number_of_pages}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{t.tocIncluded}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider 2 */}
                            <div className="w-full h-px bg-[#E5E5E5] mt-6"></div>
                        </div>

                        {/* Mobile Sidebar - Show only on mobile, after metadata */}
                        <div className="lg:hidden flex flex-col items-center gap-4 mb-6" style={{ width: '320px', margin: '0 auto' }}>
                            {/* One Time Cost */}
                            <div className="w-[300px] h-[68px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Button
                                        className="h-[40px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
                                        style={{
                                            fontFamily: 'Space Mono, monospace',
                                            width: '274px'
                                        }}
                                        onClick={() => router.push(`/${params?.lang}/reports/${params?.id}/checkout`)}
                                        aria-label="Buy License Now"
                                    >
                                        <span className="truncate">Buy License Now</span>
                                        <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                                    </Button>
                                </div>
                            </div>

                            {/* Free Sample */}
                            <div className="w-[300px] h-[99px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-4">
                                    <div>
                                        <h3
                                            className="text-black text-[14px] font-normal mb-3"
                                            style={{ fontFamily: 'Space Mono, monospace' }}
                                        >
                                            {report.free_sample}
                                        </h3>
                                        <p
                                            className="hidden sm:block text-[#595959] text-base font-normal mb-4"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.free_sample_section}
                                        </p>
                                    </div>
                                    <div className="w-full flex justify-center">
                                        <Button
                                            className="h-[40px] bg-gray-900 text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
                                            style={{
                                                fontFamily: 'Space Grotesk, sans-serif',
                                                width: '274px',
                                            }}
                                            onClick={() => setIsSampleFormOpen(true)}
                                        >
                                            <span className="truncate">{report.download_button}</span>
                                            <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Report */}
                            <div className="w-full">
                                <div className="flex flex-col gap-3 pl-2  ">
                                    <div>
                                        <h3
                                            className="text-black text-[14px] font-normal mb-0 mt-2"
                                            style={{ fontFamily: 'Space Mono, monospace' }}
                                        >
                                            {report.need_custom_report}
                                        </h3>
                                        <p
                                            className="hidden sm:block text-[#595959] text-base font-normal"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.custom_report_description}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-[300px] h-[50px] border-[#000000] text-black font-bold rounded-[10px] relative bg-white hover:bg-gray-50 text-[14px] mt-0"
                                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        onClick={openPopup}
                                    >
                                        <span className="absolute left-5 text-[14px] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.custom_report_button}
                                        </span>
                                        <div className="absolute right-4">
                                            <img
                                                src="/barrow.svg"
                                                alt="Arrow"
                                                className="w-[32px] h-[12.67px]"
                                            />
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Social Media Sharing */}
                            <div className="w-full p-2">
                                <div className="flex items-center justify-between">
                                    <h3
                                        className="text-black text-[14px] font-normal whitespace-nowrap"
                                        style={{ fontFamily: 'Space Mono, monospace' }}
                                    >
                                        {data?.share_at || 'Share this report:'}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {/* X (Twitter) */}
                                        <button
                                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                                            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this report: ${report.title}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                            aria-label="Share on X"
                                        >
                                            <img src="/x.svg" alt="X" className="w-9 h-9" />
                                        </button>
                                        {/* Facebook */}
                                        <button
                                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                                            aria-label="Share on Facebook"
                                        >
                                            <img src="/facebook.svg" alt="Facebook" className="w-9 h-9" />
                                        </button>
                                        {/* Instagram */}
                                        <button
                                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                                            aria-label="Share on Instagram"
                                        >
                                            <img src="/instagram.svg" alt="Instagram" className="w-9 h-9" />
                                        </button>
                                        {/* WhatsApp */}
                                        <button
                                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} ${window.location.href}`)}`, '_blank')}
                                            aria-label="Share on WhatsApp"
                                        >
                                            <img src="/whatsapp.svg" alt="WhatsApp" className="w-9 h-9" />
                                        </button>
                                        {/* Copy Link */}
                                        <button
                                            className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link copied to clipboard!');
                                            }}
                                            aria-label="Copy link"
                                        >
                                            <img src="/share.svg" alt="Copy Link" className="w-9 h-9" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Introduction Section */}
                        <div className="mb-5 sm:mb-12 mt-10">
                            <h2
                                className=" sm:text-xl font-extrabold text-[#000000] mb-2 sm:mb-3"
                                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: "24px", fontWeight: 500 }}
                            >
                                {report.introduction_section}
                            </h2>
                            <p
                                className="text-sm sm:text-base text-gray-700 leading-relaxed"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: highlightText(report.introduction_description) }}
                            />
                        </div>

                        {/* Key Report Highlights */}
                        <div className="mb-5 sm:mb-12">
                            <h2
                                className="text-lg sm:text-xl font-bold text-[#000000] mb-2 sm:mb-3"
                                style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: "24px", fontWeight: 500 }}
                            >
                                {report.key_report_highlights}
                            </h2>
                            <p
                                className="text-sm sm:text-base text-gray-700 leading-relaxed mb-5 sm:mb-8"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: highlightText(report.key_report_description) }}
                            />

                            {/* 4-Quadrant Highlights Grid */}
                            <div className="relative">
                                <div className="grid grid-cols-1 sm:grid-cols-2 h-auto sm:h-80 w-screen sm:w-full gap-0 sm:gap-0 -mx-4 sm:mx-0">
                                    {/* Top Left - #1D1F54 Background */}
                                    <div className="bg-black text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3
                                            className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.dominant_section}
                                        </h3>
                                        <p
                                            className="text-white text-xs sm:text-sm text-left leading-relaxed"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: highlightText(report.dominant_description) }}
                                        />
                                    </div>

                                    {/* Top Right - #06A591 Background */}
                                    <div className="bg-[#06A591] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3
                                            className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.competititve_section}
                                        </h3>
                                        <p
                                            className="text-white text-xs sm:text-sm text-left leading-relaxed"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: highlightText(report.competititve_description) }}
                                        />
                                    </div>

                                    {/* Bottom Left - #1553A5 Background */}
                                    <div className="bg-[#1553A5] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3
                                            className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.strategic_section}
                                        </h3>
                                        <p
                                            className="text-white text-xs sm:text-sm text-left leading-relaxed"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: highlightText(report.strategic_description) }}
                                        />
                                    </div>

                                    {/* Bottom Right - #1D1F54 Background */}
                                    <div className="bg-[#1D1F54] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3
                                            className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                        >
                                            {report.regional_section}
                                        </h3>
                                        <p
                                            className="text-white text-xs sm:text-sm text-left leading-relaxed"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: highlightText(report.regional_description) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation and Content - Connected */}
                        <div className="mb-6 sm:mb-8">
                            {/* Mobile Dropdown */}
                            <div className="sm:hidden mb-4">
                                <select
                                    value={activeTab}
                                    onChange={(e) => setActiveTab(parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-[#000000] text-[14px] font-medium focus:outline-none focus:ring-1.5 focus:ring-[#1160C9]"
                                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                >
                                    {sections.map((section, index) => (
                                        <option key={section.id} value={index} className="text-[#000000] text-[14px] font-medium">
                                            {section.section_name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Desktop Tab Navigation */}
                            <div className="hidden sm:flex w-full overflow-x-auto no-scrollbar">
                                <div className="flex">
                                    {sections.map((section, index) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveTab(index)}
                                            className={`flex items-center justify-center transition-colors ${activeTab === index
                                                ? 'bg-black text-white'
                                                : 'bg-white text-gray-600 border border-[#7C7C7C] hover:bg-gray-50'
                                                }`}
                                            style={{
                                                fontFamily: 'Space Grotesk, sans-serif',
                                                width: '195px',
                                                height: '51px',
                                                borderTopLeftRadius: '8px',
                                                borderTopRightRadius: '8px',
                                                marginRight: index < sections.length - 1 ? '1px' : '0',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                lineHeight: '20px',
                                                letterSpacing: '0.1px'
                                            }}
                                        >
                                            <span className="truncate px-2">{section.section_name.toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content - Connected to tabs */}
                            {sections.map((section, index) => {
                                // Find the TOC section to extract FAQs
                                const tocSection = sections.find(s => s.section_name === 'TOC');
                                const faqContent = tocSection?.section_description.includes('FAQs Section')
                                    ? tocSection.section_description.split('<strong>FAQs Section</strong>')[1]
                                    : '';

                                // Combine Why This Report content with FAQs
                                const combinedContent = section.section_name === 'Why This Report?' && faqContent
                                    ? section.section_description + faqContent
                                    : section.section_description;

                                return (
                                    <div
                                        key={section.id}
                                        className={`${activeTab === index ? 'block' : 'hidden'}`}
                                    >
                                        <div className="bg-gray-100 rounded-br-2xl rounded-bl-2xl border border-gray-200 border-t-0 p-4 sm:p-6 lg:p-8 -mt-px relative">
                                            <div className="absolute top-0 left-0 right-0 h-px bg-black hidden sm:block"></div>
                                            <h2
                                                className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3"
                                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            >
                                                {section.section_name}
                                            </h2>
                                            <div
                                                className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:font-[Space_Grotesk] prose-p:font-[Space_Grotesk] prose-li:font-[Space_Grotesk] prose-strong:font-[Space_Grotesk] prose-em:font-[Space_Grotesk] prose-ul:font-[Space_Grotesk] prose-ol:font-[Space_Grotesk] prose-blockquote:font-[Space_Grotesk] prose-img:font-[Space_Grotesk] prose-table:font-[Space_Grotesk] prose-headings:my-2 prose-p:my-2 prose-img:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 [&_h1]:font-[Space_Grotesk] [&_h1]:my-2 [&_h2]:font-[Space_Grotesk] [&_h2]:my-2 [&_h3]:font-[Space_Grotesk] [&_h3]:my-2 [&_h4]:font-[Space_Grotesk] [&_h4]:my-2 [&_h5]:font-[Space_Grotesk] [&_h5]:my-2 [&_h6]:font-[Space_Grotesk] [&_h6]:my-2 [&_p]:font-[Space_Grotesk] [&_p]:my-2 [&_li]:font-[Space_Grotesk] [&_li]:my-1 [&_span]:font-[Space_Grotesk] [&_div]:font-[Space_Grotesk] [&_strong]:font-[Space_Grotesk] [&_b]:font-[Space_Grotesk] [&_em]:font-[Space_Grotesk] [&_i]:font-[Space_Grotesk] [&_ul]:font-[Space_Grotesk] [&_ol]:font-[Space_Grotesk] [&_blockquote]:font-[Space_Grotesk] [&_img]:font-[Space_Grotesk] [&_img]:my-2 [&_table]:font-[Space_Grotesk] [&_th]:font-[Space_Grotesk] [&_td]:font-[Space_Grotesk]"
                                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                                dangerouslySetInnerHTML={{ __html: highlightText(combinedContent) }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar: desktop only */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="flex flex-col items-center gap-4" style={{ width: '322px', margin: '0 auto' }}>
                                {/* One Time Cost */}
                                <div className="w-[322px] h-[85px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Button
                                            className="h-[50px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
                                            style={{
                                                fontFamily: 'Space Mono, monospace',
                                                width: '297px'
                                            }}
                                            onClick={() => router.push(`/${params?.lang}/reports/${params?.id}/checkout`)}
                                            aria-label="Buy License Now"
                                        >
                                            <span className="truncate">Buy License Now</span>
                                            <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Free Sample */}
                                <div className="w-[322px] h-[239px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                    <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-6">
                                        <div>
                                            <h3
                                                className="text-black text-xl font-normal mb-2"
                                                style={{ fontFamily: 'Space Mono, monospace' }}
                                            >
                                                {report.free_sample}
                                            </h3>
                                            <p
                                                className="text-[#595959] text-base font-normal mb-4"
                                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            >
                                                {report.free_sample_section}
                                            </p>
                                        </div>
                                        <div className="w-full flex justify-center">
                                            <Button
                                                className="h-[50px] bg-gray-900 text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-[18px]"
                                                style={{
                                                    fontFamily: 'Space Grotesk, sans-serif',
                                                    width: '297px',

                                                }}
                                            >
                                                <span className="truncate" onClick={() => setIsSampleFormOpen(true)}>{report.download_button}</span>
                                                <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Report */}
                                <div className="w-full">
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <h3
                                                className="text-black text-xl font-normal mb-1"
                                                style={{ fontFamily: 'Space Mono, monospace' }}
                                            >
                                                {report.need_custom_report}
                                            </h3>
                                            <p
                                                className="text-[#595959] text-base font-normal"
                                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            >
                                                {report.custom_report_description}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full h-[50px] border-gray-800 text-black font-bold rounded-lg relative bg-white hover:bg-gray-50 text-[18px]"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            onClick={openPopup}
                                        >
                                            <span className="absolute left-5 text-[20px] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {report.custom_report_button}
                                            </span>
                                            <div className="absolute right-4">
                                                <img
                                                    src="/barrow.svg"
                                                    alt="Arrow"
                                                    className="w-8 h-4"
                                                />
                                            </div>
                                        </Button>
                                    </div>
                                </div>

                                {/* Social Media Sharing */}
                                <div className="w-full p-2">
                                    <div className="flex items-center justify-between gap-1 ">
                                        <h3
                                            className="text-black text-[18px] font-normal whitespace-nowrap"
                                            style={{ fontFamily: 'Space Mono, monospace' }}
                                        >
                                            {data?.share_at || 'Share this report:'}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            {/* X (Twitter) */}
                                            <button
                                                className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors"
                                                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this report: ${report.title}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                                aria-label="Share on X"
                                            >
                                                <img src="/x.svg" alt="X" className="w-9 h-9" />
                                            </button>
                                            {/* Facebook */}
                                            <button
                                                className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors"
                                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                                                aria-label="Share on Facebook"
                                            >
                                                <img src="/facebook.svg" alt="Facebook" className="w-9 h-9" />
                                            </button>
                                            {/* Instagram */}
                                            <button
                                                className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                                                aria-label="Share on Instagram"
                                            >
                                                <img src="/instagram.svg" alt="Instagram" className="w-9 h-9" />
                                            </button>
                                            {/* WhatsApp */}
                                            <button
                                                className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors"
                                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} ${window.location.href}`)}`, '_blank')}
                                                aria-label="Share on WhatsApp"
                                            >
                                                <img src="/whatsapp.svg" alt="WhatsApp" className="w-9 h-9" />
                                            </button>
                                            {/* Copy Link */}
                                            <button
                                                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold  transition-colors"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    alert('Link copied to clipboard!');
                                                }}
                                                aria-label="Copy link"
                                            >
                                                <img src="/share.svg" alt="Copy Link" className="w-9 h-9" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                {/* Common Layout Section */}
                {commonLayout && (
                    <div className="bg-white py-12 sm:py-16 lg:py-20">
                        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* API-provided Heading, split to two lines at colon */}
                            <h2
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8"
                                style={{
                                    fontFamily: 'var(--font-orbitron)',
                                    background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    lineHeight: '1.2',
                                    padding: '0.2em 0'  // Add vertical padding
                                }}
                            >
                                {(() => {
                                    if (!commonLayout.title) return null;
                                    const words = commonLayout.title.split(/\s+/);
                                    if (words.length <= 3) return commonLayout.title;
                                    return (
                                        <>
                                            <div style={{ lineHeight: '1.4' }}>{words.slice(0, 3).join(' ')}</div>
                                            <div style={{ lineHeight: '1.4' }}>{words.slice(3).join(' ')}</div>
                                        </>
                                    );
                                })()}
                            </h2>

                            {/* API-provided Conclusion Description, as HTML */}
                            <div
                                className="text-base sm:text-lg text-gray-700 text-center max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: commonLayout.report_conclusion || '' }}
                            />

                            {/* Cards using API titles */}
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start gap-6 sm:gap-8">
                                    {/* Card 1 */}
                                    <div className="bg-[#010912] overflow-hidden shadow-lg border border-gray-200 flex-shrink-0 w-[350px] h-[290px] sm:w-[471px] sm:h-[468px]">
                                        <div
                                            className="flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                                                width: '100%', height: '39px'
                                            }}
                                        >
                                            <h3 className="text-sm sm:text-base font-medium text-white text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {commonLayout.card_one_title || null}
                                            </h3>
                                        </div>
                                        <div className="bg-gray-900 flex-1" />
                                    </div>

                                    {/* Card 2 */}
                                    <div className="bg-[#010912] overflow-hidden shadow-lg border border-gray-200 flex-shrink-0 w-[350px] h-[290px] sm:w-[471px] sm:h-[468px]">
                                        <div
                                            className="flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                                                width: '100%', height: '39px'
                                            }}
                                        >
                                            <h3 className="text-sm sm:text-base font-medium text-white text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {commonLayout.card_two_title || null}
                                            </h3>
                                        </div>
                                        <div className="bg-gray-900 flex-1" />
                                    </div>

                                    {/* Card 3 */}
                                    <div className="bg-[#010912] overflow-hidden shadow-lg border border-gray-200 flex-shrink-0 w-[350px] h-[290px] sm:w-[471px] sm:h-[468px]">
                                        <div
                                            className="flex items-center justify-center"
                                            style={{
                                                background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                                                width: '100%', height: '39px'
                                            }}
                                        >
                                            <h3 className="text-sm sm:text-base font-medium text-white text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {commonLayout.card_three_title || null}
                                            </h3>
                                        </div>
                                        <div className="bg-gray-900 flex-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Popups */}
                {isPopupOpen && (
                    <CustomReportForm
                        isOpen={isPopupOpen}
                        onClose={closePopup}
                        reportTitle={report.title}
                    />
                )}
                {/* Sample Report Form Popup */}
                {isSampleFormOpen && (
                    <SampleReportForm
                        isOpen={isSampleFormOpen}
                        onClose={() => setIsSampleFormOpen(false)}
                        reportTitle={report.title}
                        reportId={report.report_id}
                        reportImage={report.image}
                    />
                )}
            </div>
        </div>
    );
}
