"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { ReportDetail, ReportSection } from "@/types/reports";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useCategory } from "@/hooks/useCategory";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import ArrowIcon from "@/components/common/ArrowIcon";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ReportDetailPage() {
  const params = useParams();
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
  
  // Fetch report data from API
  const { data, isLoading, error } = useReportDetail({
    reportId: params.id as string,
    categoryId: "1", // Default category, will be updated once we get the report data
    languageId: languageId.toString(),
  });

  const report = data?.data?.report;
  const sections = data?.data?.sections || [];
  const commonLayout = data?.common_layout;
  
  // Get category information using the report's category_id
  const { data: categoryData } = useCategory({
    categoryId: report?.category_id?.toString() || "1",
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

  if (isLoading) {
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
              className="flex items-center space-x-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700 font-normal">
                  {t.breadcrumbHome}
                </a>
              </li>
              <li>
                <Icon icon="mdi:chevron-right" className="text-gray-500" />
              </li>
              <li>
                <a href="/reports" className="text-gray-500 hover:text-gray-700 whitespace-nowrap font-normal">
                  {t.breadcrumbCategory}
                </a>
              </li>
              <li>
                <Icon icon="mdi:chevron-right" className="text-gray-500" />
              </li>
              <li>
                <span className="text-gray-500 font-normal line-clamp-1">
                  {report.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Report Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex-shrink-0 overflow-hidden mx-auto sm:mx-0">
                {report.image ? (
                  <Image
                    src={report.image}
                    alt={report.title}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Icon icon="mdi:file-document-outline" className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Report Title and Metadata */}
              <div className="flex-1 text-center sm:text-left">
                <h1 
                  className="text-blue-600 mb-3 sm:mb-4"
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
                
                {/* Report Metadata Grid */}
                <div 
                  className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0"
                  style={{ 
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '14px',
                    lineHeight: '18px',
                    letterSpacing: '0px',
                    fontWeight: '500',
                    color: '#7C7C7C'
                  }}
                >
                  {/* Column 1 */}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span>{t.lastUpdated}:</span>
                      <span className="ml-2">{new Date(report.modify_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{t.baseYear}:</span>
                      <span className="ml-2">2024</span>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span>{t.format}:</span>
                      <span className="ml-2">{report.format.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{t.industry} - {categoryData?.name || 'Technology & Software'}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{t.forecastPeriod}:</span>
                      <span className="ml-2">2025-2032</span>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span>{t.reportId}:</span>
                      <span className="ml-2">{report.report_id}</span>
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
              </div>
            </div>

            {/* Introduction Section */}
            <div className="mb-4 sm:mb-6">
              <h2 
                className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {report.introduction_section}
              </h2>
              <p 
                className="text-sm sm:text-base text-gray-700 leading-relaxed"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {report.introduction_description}
              </p>
            </div>

            {/* Key Report Highlights */}
            <div className="mb-4 sm:mb-6">
              <h2 
                className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {report.key_report_highlights}
              </h2>
              <p 
                className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {report.key_report_description}
              </p>
              
              {/* 4-Quadrant Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 h-auto sm:h-80 gap-4 sm:gap-0">
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
                  >
                    {report.dominant_description}
                  </p>
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
                  >
                    {report.competititve_description}
                  </p>
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
                  >
                    {report.strategic_description}
                  </p>
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
                  >
                    {report.regional_description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation and Content - Connected */}
            <div className="mb-6 sm:mb-8">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-0 w-full sm:w-fit">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(index)}
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                      activeTab === index 
                        ? 'bg-black text-white rounded-tl-lg rounded-br-lg' 
                        : 'bg-gray-100 text-gray-600 border border-white rounded-tl-lg rounded-br-lg hover:text-gray-900'
                    }`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <span className="truncate">{section.section_name.toUpperCase()}</span>
                  </button>
                ))}
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
                  <div className="bg-gray-100 rounded-br-2xl rounded-bl-2xl border border-gray-200 border-t-0 p-4 sm:p-6 lg:p-8 -mt-px">
                    <h2 
                      className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {section.section_name}
                    </h2>
                      <div 
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:font-[Space_Grotesk] prose-p:font-[Space_Grotesk] prose-li:font-[Space_Grotesk] prose-strong:font-[Space_Grotesk] prose-em:font-[Space_Grotesk] prose-ul:font-[Space_Grotesk] prose-ol:font-[Space_Grotesk] prose-blockquote:font-[Space_Grotesk] prose-img:font-[Space_Grotesk] prose-table:font-[Space_Grotesk] prose-headings:my-2 prose-p:my-2 prose-img:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 [&_h1]:font-[Space_Grotesk] [&_h1]:my-2 [&_h2]:font-[Space_Grotesk] [&_h2]:my-2 [&_h3]:font-[Space_Grotesk] [&_h3]:my-2 [&_h4]:font-[Space_Grotesk] [&_h4]:my-2 [&_h5]:font-[Space_Grotesk] [&_h5]:my-2 [&_h6]:font-[Space_Grotesk] [&_h6]:my-2 [&_p]:font-[Space_Grotesk] [&_p]:my-2 [&_li]:font-[Space_Grotesk] [&_li]:my-1 [&_span]:font-[Space_Grotesk] [&_div]:font-[Space_Grotesk] [&_strong]:font-[Space_Grotesk] [&_b]:font-[Space_Grotesk] [&_em]:font-[Space_Grotesk] [&_i]:font-[Space_Grotesk] [&_ul]:font-[Space_Grotesk] [&_ol]:font-[Space_Grotesk] [&_blockquote]:font-[Space_Grotesk] [&_img]:font-[Space_Grotesk] [&_img]:my-2 [&_table]:font-[Space_Grotesk] [&_th]:font-[Space_Grotesk] [&_td]:font-[Space_Grotesk]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: combinedContent }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-32" style={{ display: 'flex', flexDirection: 'column', gap: '38px' }}>
              {/* One Time Cost */}
              <div className="relative w-[322px] h-[255px] mx-auto lg:mx-0 rounded-lg" style={{ background: 'linear-gradient(to right, #1160C9, #08D2B8)', padding: '2px' }}>
                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-4 sm:p-6">
                  <div>
                    <h3 
                      className="mb-2"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '16px',
                        lineHeight: '30px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#595959'
                      }}
                    >
                      {report.one_time_section}
                    </h3>
                    <div 
                      className="mb-4"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '32px',
                        lineHeight: '41px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#000000'
                      }}
                    >
                      {report.cost}
                    </div>
                  </div>
                  {/* Add to Cart removed */}
                </div>
              </div>

              {/* Get Free Sample */}
              <div className="relative w-[322px] h-[255px] mx-auto lg:mx-0 rounded-lg" style={{ background: 'linear-gradient(to right, #1160C9, #08D2B8)', padding: '2px' }}>
                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-between p-4 sm:p-6">
                  <div>
                    <h3 
                      className="mb-2"
                      style={{ 
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '20px',
                        lineHeight: '30px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#000000'
                      }}
                    >
                      {report.free_sample}
                    </h3>
                    <p 
                      className="mb-4"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '16px',
                        lineHeight: '20px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#595959'
                      }}
                    >
                      {report.free_sample_section}
                    </p>
                  </div>
                  <Button
                    className="w-full max-w-[286px] h-[45px] sm:h-[52px] bg-gray-900 text-white hover:bg-gray-700 font-bold rounded-lg flex items-center justify-between px-4 text-sm sm:text-base"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    <span className="truncate">{report.download_button}</span>
                    <ArrowIcon variant="white" className="w-6 h-6 flex-shrink-0" />
                  </Button>
                </div>
              </div>

              {/* Custom Report - Fixed Alignment */}
              <div className="w-[322px] mx-auto lg:mx-0">
                <div className="flex flex-col" style={{ minHeight: '255px' }}>
                  <div className="flex-1">
                    <h3 
                      className="mb-3"
                      style={{ 
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '20px',
                        lineHeight: '30px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#000000'
                      }}
                    >
                      {report.need_custom_report}
                    </h3>
                    <p 
                      className="mb-6"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '16px',
                        lineHeight: '20px',
                        letterSpacing: '0px',
                        fontWeight: '400',
                        color: '#595959'
                      }}
                    >
                      {report.custom_report_description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-50 font-bold rounded-lg relative bg-white"
                    style={{ 
                      fontFamily: 'Space Grotesk, sans-serif',
                      width: '320px',
                      height: '88px'
                    }}
                    onClick={openPopup}
                  >
                    <span 
                      className="absolute left-5 bottom-4 font-bold text-base"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: '700'
                      }}
                    >
                      {report.custom_report_button}
                    </span>
                    <div className="absolute top-4 right-4">
                      <img 
                        src="/barrow.svg" 
                        alt="Arrow" 
                        className="w-8 h-4"
                      />
                    </div>
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Common Layout Section */}
        {commonLayout && (
          <div className="bg-white py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Main Heading */}
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8"
                style={{ 
                  fontFamily: 'var(--font-orbitron)',
                  background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                <div>Seize Tomorrow's Opportunities</div>
                <div>Today: Access the Full Report</div>
              </h2>

              {/* Dynamic Paragraph */}
              <p 
                className="text-base sm:text-lg text-gray-700 text-center max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {commonLayout.report_conclusion}
              </p>

              {/* Three Cards */}
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
                {/* Card 1 - Top Selling Reports */}
                <div 
                  className="bg-white overflow-hidden shadow-lg border border-gray-200"
                  style={{ width: '471px', height: '468px' }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                      width: '471px',
                      height: '83px'
                    }}
                  >
                    <h3 
                      className="text-sm sm:text-base font-medium text-white text-center"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {commonLayout.card_one_title}
                    </h3>
                  </div>
                  <div className="bg-gray-900" style={{ height: '375px' }}></div>
                </div>

                {/* Card 2 - Personalise This Report */}
                <div 
                  className="bg-white overflow-hidden shadow-lg border border-gray-200"
                  style={{ width: '471px', height: '468px' }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                      width: '471px',
                      height: '83px'
                    }}
                  >
                    <h3 
                      className="text-sm sm:text-base font-medium text-white text-center"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {commonLayout.card_two_title}
                    </h3>
                  </div>
                  <div className="bg-gray-900" style={{ height: '375px' }}></div>
                </div>

                {/* Card 3 - Let Us Help You */}
                <div 
                  className="bg-white overflow-hidden shadow-lg border border-gray-200"
                  style={{ width: '471px', height: '468px' }}
                >
                  <div 
                    className="flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                      width: '471px',
                      height: '83px'
                    }}
                  >
                    <h3 
                      className="text-sm sm:text-base font-medium text-white text-center"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {commonLayout.card_three_title}
                    </h3>
                  </div>
                  <div className="bg-gray-900" style={{ height: '375px' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Report Request Popup */}
        {isPopupOpen && (
          <div 
            className="fixed inset-0 backdrop-blur-md bg-white bg-opacity-10 flex items-center justify-center z-50 p-4"
            onClick={closePopup}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <div 
              className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Request Custom Report
                  </h2>
                  <button
                    onClick={closePopup}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Icon icon="mdi:close" className="text-2xl" />
                  </button>
                </div>

                <p 
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Please provide your requirements for a customized report. Our team will get back to you with a tailored solution.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label 
                      htmlFor="fullName" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Full Name*
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Full Name*"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1 text-gray-900 placeholder-gray-500"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required
                    />
                  </div>

                  {/* Business Email */}
                  <div>
                    <Label 
                      htmlFor="businessEmail" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Business Email*
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="Business Email*"
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      className="mt-1 text-gray-900 placeholder-gray-500"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <Label 
                      htmlFor="phoneNumber" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Phone Number
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Select 
                        value={formData.countryCode} 
                        onValueChange={(value) => handleInputChange('countryCode', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+33">+33</SelectItem>
                          <SelectItem value="+49">+49</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="flex-1 text-gray-900 placeholder-gray-500"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <Label 
                      htmlFor="country" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Country
                    </Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleInputChange('country', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="CN">China</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Report Requirements */}
                  <div>
                    <Label 
                      htmlFor="reportRequirements" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Report Requirements*
                    </Label>
                    <textarea
                      id="reportRequirements"
                      placeholder="Please describe your specific requirements for the custom report..."
                      value={formData.reportRequirements || ''}
                      onChange={(e) => handleInputChange('reportRequirements', e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 resize-none"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Industry Focus */}
                  <div>
                    <Label 
                      htmlFor="industryFocus" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Industry Focus
                    </Label>
                    <Select 
                      value={formData.industryFocus || ''} 
                      onValueChange={(value) => handleInputChange('industryFocus', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select industry focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology & Software</SelectItem>
                        <SelectItem value="healthcare">Healthcare & Life Sciences</SelectItem>
                        <SelectItem value="energy">Energy & Power</SelectItem>
                        <SelectItem value="automotive">Automotive & Transportation</SelectItem>
                        <SelectItem value="consumer">Consumer Goods & Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing & Industrial</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="telecommunications">Telecommunications</SelectItem>
                        <SelectItem value="aerospace">Aerospace & Defense</SelectItem>
                        <SelectItem value="chemicals">Chemicals & Materials</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timeline */}
                  <div>
                    <Label 
                      htmlFor="timeline" 
                      className="text-sm font-medium text-gray-700"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Preferred Timeline
                    </Label>
                    <Select 
                      value={formData.timeline || ''} 
                      onValueChange={(value) => handleInputChange('timeline', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent (1-2 weeks)</SelectItem>
                        <SelectItem value="standard">Standard (3-4 weeks)</SelectItem>
                        <SelectItem value="flexible">Flexible (1-2 months)</SelectItem>
                        <SelectItem value="long-term">Long-term (2+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* reCAPTCHA */}
                  <div className="py-4">
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="recaptcha"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                      />
                      <div className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <div className="mb-2">
                          I agree to the{" "}
                          <a href="/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </a>{" "}
                          and{" "}
                          <a href="/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </a>
                          .
                        </div>
                        <div className="text-xs text-gray-500">
                          This site is protected by reCAPTCHA and the Google{" "}
                          <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">
                            Privacy Policy
                          </a>{" "}
                          and{" "}
                          <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline">
                            Terms of Service
                          </a>{" "}
                          apply.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full py-3 text-white font-semibold rounded-lg"
                    style={{ 
                      fontFamily: 'Space Grotesk, sans-serif',
                      background: 'linear-gradient(to right, #1160C9, #08D2B8)',
                      border: 'none'
                    }}
                  >
                    Request Custom Report
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}