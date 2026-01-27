import { ReportDetailResponse, ReportSection } from "@/types/reports";
import { getTranslations } from "@/lib/translations";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react"; // Server Icon? Iconify React works on server? Yes usually SVG.
import ArrowIcon from "@/components/common/ArrowIcon";
import MarketScopeAnalysis from "@/components/reports/MarketScopeAnalysis";
import RecentDevelopments from "@/components/reports/RecentDevelopments";
import ReportFAQ from "@/components/reports/ReportFAQ";
import CommonLayoutSection from "@/components/reports/CommonLayoutSection";
import ReportClientWrapper from "./components/ReportClientWrapper";
import BuyButton from "./components/BuyButton";
import ActionButtons, { CustomReportButton } from "./components/ActionButtons";
import LanguageSync from "./components/LanguageSync";
import CopyLinkButton from "./components/CopyLinkButton";

interface ReportViewProps {
    data: ReportDetailResponse;
    lang: string;
    id: string; // The full slug/id from URL
    refId?: string; // The resolved reference ID
}

const decodeHtml = (html: string) => {
    if (!html) return "";
    return html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");
};

const injectImages = (html: string, report: any) => {
    if (!html) return "";

    // Regex to match <p><i>image_X_goes_here</i></p>
    // Adjusting regex to be more flexible with whitespace
    const regex = /<p>\s*<i>\s*(image_\d+_goes_here)\s*<\/i>\s*<\/p>/g;

    return html.replace(regex, (match, placeholder) => {
        // Extract number from placeholder (e.g., image_1_goes_here -> 1)
        const matchResult = placeholder.match(/image_(\d+)_goes_here/);
        if (matchResult && matchResult[1]) {
            const index = matchResult[1];
            const imageLink = report[`image_${index}_link`];
            const imageAlt = report[`image_${index}_alt`] || `Report Image ${index}`;

            if (imageLink) {
                return `
                    <div class="my-6">
                        <img src="${imageLink}" alt="${imageAlt}" class="w-full h-auto rounded-lg shadow-sm" />
                    </div>
                 `;
            }
        }
        return ""; // Remove placeholder if no image found
    });
};

const formatDate = (dateString: string | undefined, locale: string) => {
    if (!dateString) return '';
    const safeDate = dateString.replace(' ', 'T');
    try {
        const date = new Date(safeDate);
        if (isNaN(date.getTime())) {
            return dateString.split(' ')[0];
        }
        return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

export default function ReportView({ data, lang, id, refId }: ReportViewProps) {
    const t: any = getTranslations('reportDetail', lang);
    const commonT: any = getTranslations('reports', lang);

    const report = data.data.report;
    const sections = data.data.sections;
    const metaFields = data.report_meta_fields;
    const commonLayout = data.common_layout;

    // Resolve category name (fallback logic similar to client)
    const identity: any = data.report_identity;
    const categoryName = identity?.category_name || commonT?.breadcrumbCategory || 'Technology & Software';

    return (
        <main className="min-h-screen bg-white pt-24">
            {/* Sync Language to Store (Client Component) */}
            <LanguageSync lang={lang} refId={refId} catRefId={data.report_identity?.category_reference_id?.toString()} />

            {/* Breadcrumb */}
            <div className="pt-11 pb-4">
                <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol
                            className="flex items-center space-x-2 justify-start sm:justify-center min-w-0"
                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                            <li className="flex-shrink-0">
                                <Link href={`/${lang}`} className="text-gray-500 hover:text-gray-700 font-normal text-sm">
                                    {commonT.breadcrumbHome}
                                </Link>
                            </li>
                            <li className="flex-shrink-0">
                                <Icon icon="mdi:chevron-right" className="text-gray-500 text-sm" />
                            </li>
                            <li className="flex-shrink-0">
                                <Link href={`/${lang}/reports`} className="text-gray-500 hover:text-gray-700 whitespace-nowrap font-normal text-sm">
                                    {categoryName}
                                </Link>
                            </li>
                            <li className="flex-shrink-0">
                                <Icon icon="mdi:chevron-right" className="text-gray-500 text-sm" />
                            </li>
                            <li className="min-w-0 flex-1">
                                <span className="text-gray-500 font-normal text-sm block truncate">
                                    {report.breadcrumb || report.title}
                                </span>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 sm:py-6 lg:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative">
                    {/* Main Content */}
                    <div className="col-span-1 lg:col-span-2">
                        {/* Title and Metadata */}
                        <div className="flex flex-col mb-4 sm:mb-6">
                            <div className="w-full h-px bg-[#E5E5E5] mb-6"></div>

                            {/* Title and Image Container */}
                            <div className="flex flex-row gap-4 sm:gap-6 mb-6">
                                {/* Report Image */}
                                <div className="w-[93px] h-[93px] flex-shrink-0 bg-gray-200 overflow-hidden">
                                    {report.image ? (
                                        <img
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

                            {/* Metadata Grid */}
                            <div
                                className="flex flex-col sm:flex-row justify-between w-full mb-6 gap-y-4"
                                style={{
                                    fontFamily: 'Space Grotesk, sans-serif',
                                    fontSize: '12px',
                                    lineHeight: '18px',
                                    letterSpacing: '0px',
                                    fontWeight: '400',
                                    color: '#7C7C7C'
                                }}
                            >
                                {/* Column 1 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{metaFields?.last_updated_at || t.lastUpdated}</span>
                                        <span className="ml-1">{formatDate(report.updated_at || report.modify_at, lang)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.publish_date || 'Publish Date:'}</span>
                                        <span className="ml-1">{formatDate(report.created_at, lang)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.base_year || t.baseYear}</span>
                                        <span className="ml-1">{report.base_year}</span>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{metaFields?.format || t.format}</span>
                                        <span className="ml-1">{report.format}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.report_industry || t.industry} - {categoryName}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.forecast_period || t.forecastPeriod}</span>
                                        <span className="ml-1">{report.forecast_period}</span>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <span>{metaFields?.report_id || t.reportId}</span>
                                        <span className="ml-1">{report.report_id}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.number_of_pages || t.numberOfPages}</span>
                                        <span className="ml-1">{report.number_of_pages}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{metaFields?.toc || 'TOC'}:</span>
                                        <span className="ml-1">{report.toc || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-px bg-[#E5E5E5] mt-6"></div>
                        </div>

                        {/* Mobile Sidebar - Show only on mobile */}
                        <div className="lg:hidden flex flex-col items-center gap-4 mb-6" style={{ width: '320px', margin: '0 auto' }}>
                            {/* One Time Cost */}
                            <div className="w-[300px] h-[68px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                    <BuyButton
                                        lang={lang}
                                        id={id}
                                        label={data.buy_license_button || metaFields?.buy_now_btn || 'Buy License Now'}
                                        variant="mobile"
                                    />
                                </div>
                            </div>

                            {/* Free Sample */}
                            <div className="w-[300px] h-auto min-h-[99px] rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-4">
                                    <div className="mb-2">
                                        <h3 className="text-black text-[14px] font-normal mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>
                                            {report.free_sample || 'Get A Free Sample'}
                                        </h3>
                                        <p className="hidden sm:block text-[#595959] text-base font-normal mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.free_sample_section}
                                        </p>
                                    </div>
                                    <ActionButtons
                                        reportTitle={report.title}
                                        reportId={report.report_id}
                                        reportImage={report.image}
                                        downloadLabel={metaFields?.request_pdf_btn || report.download_button}
                                        customLabel={metaFields?.request_custom_btn || report.custom_report_button}
                                        variant="mobile"
                                    />
                                </div>
                            </div>

                            {/* Custom Report */}
                            <div className="w-full">
                                <div className="flex flex-col gap-3 pl-2">
                                    <div>
                                        <h3 className="text-black text-[14px] font-normal mb-0 mt-2" style={{ fontFamily: 'Space Mono, monospace' }}>
                                            {report.need_custom_report}
                                        </h3>
                                        <p className="hidden sm:block text-[#595959] text-base font-normal" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.custom_report_description}
                                        </p>
                                    </div>
                                    <CustomReportButton
                                        reportTitle={report.title}
                                        label={metaFields?.request_custom_btn || report.custom_report_button}
                                        variant="mobile"
                                    />
                                </div>
                            </div>

                            {/* Social Share Mobile */}
                            <div className="w-full p-2">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-1">
                                    <h3 className="text-black text-[14px] font-normal whitespace-nowrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                        {data.share_at || 'Share this report:'}
                                    </h3>
                                    {/* Ideally create a SocialShare Client Component, for now omitting logic or simple links */}
                                    {/* Keeping simple links that don't need JS if possible, but window.open needs JS. 
                                         Social buttons are usually interactive. 
                                         Skipping specific implementation here to save space, but similar to BuyButton they should be Client Components if they use window.open.
                                         For now, just static placeholders or Client Component? 
                                         Let's assume a SocialShare component exists or just render them as links with target=_blank.
                                     */}
                                    <div className="flex items-center gap-3">
                                        {/* Simple links for SEO compatibility */}
                                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(report.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center bg-black hover:bg-gray-800">
                                            <img src="/x.svg" alt="X" className="w-9 h-9" />
                                        </a>
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=https://synapseaglobal.com`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center bg-blue-600 hover:bg-blue-700">
                                            <img src="/facebook.svg" alt="Facebook" className="w-9 h-9" />
                                        </a>
                                        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                            <img src="/instagram.svg" alt="Instagram" className="w-9 h-9" />
                                        </a>
                                        <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} https://synapseaglobal.com`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors">
                                            <img src="/whatsapp.svg" alt="WhatsApp" className="w-9 h-9" />
                                        </a>
                                        <CopyLinkButton />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Introduction Section */}
                        <div className="mb-5 sm:mb-12 mt-10">
                            <h2 className="sm:text-xl font-extrabold text-[#000000] mb-2 sm:mb-3" style={{ fontSize: "24px", fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif' }}>
                                {report.introduction_section}
                            </h2>
                            <div
                                className="text-sm sm:text-base text-gray-700 leading-relaxed"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: report.introduction_description }} // Removing highlightText for server render basic
                            />
                        </div>

                        {/* Key Report Highlights */}
                        <div className="mb-5 sm:mb-12">
                            <h2 className="text-lg sm:text-xl font-bold text-[#000000] mb-2 sm:mb-3" style={{ fontSize: "24px", fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif' }}>
                                {report.key_report_highlights}
                            </h2>
                            <div
                                className="text-sm sm:text-base text-gray-700 leading-relaxed mb-5 sm:mb-8"
                                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: report.key_report_description }}
                            />

                            <div className="relative">
                                <div className="grid grid-cols-1 sm:grid-cols-2 w-screen sm:w-full gap-0 sm:gap-0 -mx-4 sm:mx-0">
                                    {/* Highlight Boxes - Server Rendered Static */}
                                    <div className="bg-black text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.dominant_section}
                                        </h3>
                                        <div className="text-white text-xs sm:text-sm text-left leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }} dangerouslySetInnerHTML={{ __html: report.dominant_description }} />
                                    </div>
                                    <div className="bg-[#06A591] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.competititve_section}
                                        </h3>
                                        <div className="text-white text-xs sm:text-sm text-left leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }} dangerouslySetInnerHTML={{ __html: report.competititve_description }} />
                                    </div>
                                    <div className="bg-[#1553A5] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.strategic_section}
                                        </h3>
                                        <div className="text-white text-xs sm:text-sm text-left leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }} dangerouslySetInnerHTML={{ __html: report.strategic_description }} />
                                    </div>
                                    <div className="bg-[#1D1F54] text-white p-4 sm:p-6 flex flex-col justify-start min-h-[120px] sm:min-h-0">
                                        <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 text-left" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {report.regional_section}
                                        </h3>
                                        <div className="text-white text-xs sm:text-sm text-left leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }} dangerouslySetInnerHTML={{ __html: report.regional_description }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Tabs Section */}
                        <ReportClientWrapper
                            sections={sections}
                            reportData={data}
                            lang={lang}
                            slug={id}
                        >
                            {sections.map((section: ReportSection, index: number) => {
                                const tocSection = sections.find((s: ReportSection) => s.section_name === 'TOC');
                                const faqContent = tocSection?.section_description.includes('FAQs Section')
                                    ? tocSection.section_description.split('<strong>FAQs Section</strong>')[1]
                                    : '';

                                const combinedContent = section.section_name === 'Why This Report?' && faqContent
                                    ? decodeHtml(section.section_description + faqContent)
                                    : decodeHtml(section.section_description);

                                const contentWithImages = injectImages(combinedContent, report); // Use report object for images

                                return (
                                    <div className="bg-gray-100 border border-gray-200 border-t-0 p-4 sm:p-6 lg:p-8 -mt-px relative" key={section.id}>
                                        <div className="absolute top-0 left-0 right-0 h-px bg-black hidden sm:block"></div>

                                        <div
                                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                                            dangerouslySetInnerHTML={{ __html: contentWithImages }}
                                        />
                                    </div>
                                );
                            })}
                        </ReportClientWrapper>

                        <MarketScopeAnalysis report={report} headings={metaFields} />

                        <RecentDevelopments
                            heading={metaFields?.recent_developments_heading || ''}
                            content={report.recent_developments || ''}
                        />

                        <ReportFAQ heading={metaFields?.faq_heading} report={report} />

                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="flex flex-col items-center gap-4" style={{ width: '322px', margin: '0 auto' }}>
                                {/* One Time Cost */}
                                <div className="w-[322px] min-h-[85px] h-auto rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center p-4">
                                        <BuyButton
                                            lang={lang}
                                            id={id}
                                            label={data.buy_license_button || metaFields?.buy_now_btn || 'Buy License Now'}
                                            variant="desktop"
                                        />
                                    </div>
                                </div>

                                {/* Free Sample */}
                                <div className="w-[322px] min-h-[239px] h-auto rounded-lg" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box', border: '1px solid transparent' }}>
                                    <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-6">
                                        <div>
                                            <h3 className="text-black text-xl font-normal mb-2" style={{ fontFamily: 'Space Mono, monospace' }}>
                                                {report.free_sample}
                                            </h3>
                                            <p className="text-[#595959] text-base font-normal mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {report.free_sample_section}
                                            </p>
                                        </div>
                                        <ActionButtons
                                            reportTitle={report.title}
                                            reportId={report.report_id}
                                            reportImage={report.image}
                                            downloadLabel={metaFields?.request_pdf_btn || report.download_button}
                                            customLabel={metaFields?.request_custom_btn || report.custom_report_button}
                                            variant="desktop"
                                        />
                                    </div>
                                </div>

                                {/* Custom Report */}
                                <div className="w-full">
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <h3 className="text-black text-xl font-normal mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>
                                                {report.need_custom_report}
                                            </h3>
                                            <p className="text-[#595959] text-base font-normal" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                                {report.custom_report_description}
                                            </p>
                                        </div>
                                        <CustomReportButton
                                            reportTitle={report.title}
                                            label={metaFields?.request_custom_btn || report.custom_report_button}
                                            variant="desktop"
                                        />
                                    </div>
                                </div>

                                {/* Social Share Desktop */}
                                <div className="w-full p-2">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-1">
                                        <h3 className="text-black text-[18px] font-normal whitespace-nowrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            {data.share_at || 'Share this report:'}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(report.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors">
                                                <img src="/x.svg" alt="X" className="w-9 h-9" />
                                            </a>
                                            <a href={`https://www.facebook.com/sharer/sharer.php?u=https://synapseaglobal.com`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors">
                                                <img src="/facebook.svg" alt="Facebook" className="w-9 h-9" />
                                            </a>
                                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                                <img src="/instagram.svg" alt="Instagram" className="w-9 h-9" />
                                            </a>
                                            <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} https://synapseaglobal.com`)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors">
                                                <img src="/whatsapp.svg" alt="WhatsApp" className="w-9 h-9" />
                                            </a>
                                            <CopyLinkButton />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Common Layout / Bottom Section - Full Width */}
            <CommonLayoutSection data={commonLayout} />
        </main>
    );
}
