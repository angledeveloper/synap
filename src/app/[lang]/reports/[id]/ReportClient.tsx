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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import MarketScopeAnalysis from "@/components/reports/MarketScopeAnalysis";
import RecentDevelopments from "@/components/reports/RecentDevelopments";
import ReportFAQ from "@/components/reports/ReportFAQ";
import CommonLayoutSection from "@/components/reports/CommonLayoutSection";

// Dynamically import form components with no SSR
const SampleReportForm = dynamic(
  () => import("@/components/common/SampleReportForm"),
  {
    ssr: false,
  },
);

const CustomReportForm = dynamic(
  () => import("@/components/common/CustomReportForm"),
  {
    ssr: false,
  },
);
import useSWR from "swr";

const decodeHtml = (html: string) => {
  if (!html) return "";
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
};

const injectImages = (html: string, data: any) => {
  if (!html) return "";

  // Regex to match <p><i>image_X_goes_here</i></p>
  // Handles potential whitespace or slight variations
  const regex = /<p>\s*<i>\s*image_(\d+)_goes_here\s*<\/i>\s*<\/p>/gi;

  return html.replace(regex, (match, index) => {
    const linkKey = `image_${index}_link`;
    const altKey = `image_${index}_alt`;

    const src = data[linkKey];
    const alt = data[altKey] || `Image ${index}`;

    if (src) {
      return `
                <div class="my-6">
                    <img src="${src}" alt="${alt}" class="w-full h-auto rounded-lg shadow-sm" />
                </div>
            `;
    }

    // Return empty string if no image found, effectively removing the placeholder
    return "";
  });
};

interface ReportDetailPageProps {
  initialData?: any;
  initialReferenceId?: string;
}

export default function ReportDetailPage({
  initialData,
  initialReferenceId,
}: ReportDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguageStore();
  const { HomePage } = useHomePageStore();
  const searchParams = useSearchParams();
  const highlight = searchParams?.get("highlight");
  const [activeTab, setActiveTab] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSampleFormOpen, setIsSampleFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // ... (rest of useEffects/handlers omitted for brevity)

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsSampleFormOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Submitted email:", email);
    // Close the form after submission
    setIsSampleFormOpen(false);
  };
  const [formData, setFormData] = useState({
    fullName: "",
    businessEmail: "",
    phoneNumber: "",
    country: "",
    countryCode: "+91",
    reportRequirements: "",
    industryFocus: "",
    timeline: "",
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
      (c: any) => String(c.language_id) === String(languageId),
    );

    // Use the first category ID if found, otherwise keep "1"
    return langCats.length > 0 ? String(langCats[0].category_id) : "1";
  }, [HomePage, languageId]);

  // Prefer initialReferenceId passed from server if ref_id is missing from URL
  const activeInitialRefId = initialReferenceId;
  const refId = searchParams?.get("ref_id") || activeInitialRefId || undefined;

  // Fetch report data from API
  const { data, isLoading, error } = useReportDetail({
    reportId: reportId,
    categoryId: defaultCategoryId,
    languageId: languageId.toString(),
    reportReferenceId:
      searchParams?.get("ref_id") || initialReferenceId || reportId, // specific priority
    slug: params.id as string,
    initialData: initialData, // Pass server-side data
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
  const { data: translations } = useTranslations({
    language,
    page: "reportDetail",
  });
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
    sampleDescription:
      "The sample includes market data points, trend analyses, and market estimates.",
    downloadSample: "Download Sample",
    needCustomReport: "NEED A CUSTOM REPORT?",
    customReportDescription:
      "Reports can be customized, including stand-alone sections or country-level reports, with discounts for start-ups and universities.",
    requestCustomReport: "Request Custom Report",
    shareAt: "SHARE AT:",
  };

  // Helper function to highlight text
  const highlightText = (text: string | undefined | null) => {
    if (!text) return "";
    if (!highlight) return text;

    try {
      // Escape special regex characters
      const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedHighlight})`, "gi");
      return text.replace(
        regex,
        '<mark class="bg-yellow-300 text-black rounded-sm px-0.5">$1</mark>',
      );
    } catch (e) {
      return text;
    }
  };

  // Helper to format date consistent across languages
  const formatDate = (dateString: string | undefined, locale: string) => {
    if (!dateString) return "";
    // Handle SQL timestamp "YYYY-MM-DD HH:MM:SS" -> "YYYY-MM-DDTHH:MM:SS" for safe parsing
    // (Chrome parses space fine, but Safari/others might prefer T)
    const safeDate = dateString.replace(" ", "T");
    try {
      const date = new Date(safeDate);
      if (isNaN(date.getTime())) {
        // If parsing fails, return just the date part string "YYYY-MM-DD"
        return dateString.split(" ")[0];
      }
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Effect to handle auto-scrolling and tab switching for search results
  useEffect(() => {
    if (!highlight || !report || sections.length === 0) return;

    const query = highlight.toLowerCase();

    // Check if the query is in any specific section (tab)
    const foundSectionIndex = sections.findIndex(
      (s: ReportSection) =>
        s.section_description.toLowerCase().includes(query) ||
        s.section_name.toLowerCase().includes(query),
    );

    if (foundSectionIndex !== -1) {
      setActiveTab(foundSectionIndex);
    }

    // Scroll to the first highlighted element after a short delay to allow rendering
    const timer = setTimeout(() => {
      const marks = document.getElementsByTagName("mark");
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [highlight, report, sections]);

  // Fetch checkout page to read Single License pricing (for One Time Cost box)
  const fetchCheckoutData = async (lang: string) => {
    // Map language code to ID (1-8)
    const languageMap: Record<string, string> = {
      en: "1",
      es: "2",
      // Add more language mappings as needed
    };

    const languageId = languageMap[lang] || "1"; // Default to English (1) if language not found

    const res = await fetch(
      `https://dashboard.synapseaglobal.com/api/checkout/${languageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch checkout data");
    return res.json();
  };

  const { data: checkoutApi } = useSWR("checkout-api", () =>
    fetchCheckoutData(language),
  );
  const checkout_page = checkoutApi?.checkout_page;
  // Pick a currency (first from dropdown) → derive suffix and symbol. Fallback USD
  let singleActualPriceStr: string = "";
  let singleOfferPriceStr: string = "";
  if (checkout_page) {
    const dropdown: string = checkout_page?.currency_dropdown || "USD,INR,EUR";
    const first = (dropdown.split(",")[0] || "USD").trim();
    const map: Record<string, { suffix: string; symbol: string }> = {
      USD: { suffix: "USD", symbol: "$" },
      INR: { suffix: "INR", symbol: "₹" },
      EUR: { suffix: "EUR", symbol: "€" },
      GBP: { suffix: "GBP", symbol: "£" },
      "5": { suffix: "USD", symbol: "$" },
      "6": { suffix: "INR", symbol: "₹" },
      "7": { suffix: "EUR", symbol: "€" },
    };
    const label = map[first] || map.USD;
    singleOfferPriceStr =
      checkout_page[`single_license_offer_price_in_${label.suffix}`] ||
      checkout_page[`single_license_offer_price_in_USD`] ||
      "";
    singleActualPriceStr =
      checkout_page[`single_license_actual_price_in_${label.suffix}`] ||
      checkout_page[`single_license_actual_price_in_USD`] ||
      "";
  }

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Close popup after submission
    setIsPopupOpen(false);
    // Reset form
    setFormData({
      fullName: "",
      businessEmail: "",
      phoneNumber: "",
      country: "",
      countryCode: "+91",
      reportRequirements: "",
      industryFocus: "",
      timeline: "",
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-4 h-8 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-8 h-4 w-2/3" />
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
      <div className="flex min-h-screen items-center justify-center bg-white pt-20">
        <div className="text-center">
          <h1
            className="mb-4 text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Error Loading Report
          </h1>
          <p
            className="text-gray-600"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            There was an error loading the report. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!data || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white pt-20">
        <div className="text-center">
          <h1
            className="mb-4 text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Report Not Found
          </h1>
          <p
            className="text-gray-600"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            The report you're looking for doesn't exist or is not available in
            the selected language.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumbs */}
      <div className="pt-11 pb-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-7xl">
          <nav className="flex" aria-label="Breadcrumb">
            <ol
              className="flex min-w-0 items-center justify-start space-x-2 sm:justify-center"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <li className="flex-shrink-0">
                <a
                  href={`/${language}`}
                  className="text-sm font-normal text-gray-500 hover:text-gray-700"
                >
                  {t.breadcrumbHome}
                </a>
              </li>
              <li className="flex-shrink-0">
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm text-gray-500"
                />
              </li>
              <li className="flex-shrink-0">
                <a
                  href={`/${language}/reports`}
                  className="text-sm font-normal whitespace-nowrap text-gray-500 hover:text-gray-700"
                >
                  {data?.report_identity?.category_name ||
                    categoryData?.name ||
                    t.breadcrumbCategory}
                </a>
              </li>
              <li className="flex-shrink-0">
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm text-gray-500"
                />
              </li>
              <li className="min-w-0 flex-1">
                <span className="block text-sm font-normal text-gray-500">
                  {report.breadcrumb}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:max-w-7xl">
        {/* Content and Sidebar: mobile full width, desktop grid */}
        <div className="relative grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content Area: full width on mobile, 2/3 on desktop */}
          <div className="col-span-1 lg:col-span-2">
            {/* Report Header */}
            <div className="mb-4 flex flex-col sm:mb-6">
              {/* Divider 1 */}
              <div className="mb-6 h-px w-full bg-[#E5E5E5]"></div>

              {/* Title and Image Container */}
              <div className="mb-6 flex flex-row gap-4 sm:gap-6">
                {/* Report Image - 93x93, no border radius */}
                <div className="h-[93px] w-[93px] flex-shrink-0 overflow-hidden bg-gray-200">
                  {report.image ? (
                    <Image
                      src={report.image}
                      alt={report.title}
                      width={93}
                      height={93}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <Icon
                        icon="mdi:file-document-outline"
                        className="text-3xl text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {/* Report Title */}
                <div className="flex-1">
                  <h1
                    className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] bg-clip-text text-transparent"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "24px",
                      lineHeight: "31px",
                      letterSpacing: "0px",
                      fontWeight: "500",
                    }}
                  >
                    {report.title}
                  </h1>
                </div>
              </div>

              {/* Report Metadata Grid - Full width below title/image */}
              <div
                className="mb-6 flex w-full flex-col justify-between gap-y-4 sm:flex-row"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  letterSpacing: "0px",
                  fontWeight: "400", // Regular font weight
                  color: "#7C7C7C",
                }}
              >
                {/* Column 1 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.last_updated_at ||
                        t.lastUpdated}
                    </span>
                    <span className="ml-1">
                      {formatDate(
                        report.updated_at || report.modify_at,
                        language,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.publish_date ||
                        "Publish Date:"}
                    </span>
                    <span className="ml-1">
                      {formatDate(report.created_at, language)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.base_year || t.baseYear}
                    </span>
                    <span className="ml-1">{report.base_year}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <span>{data?.report_meta_fields?.format || t.format}</span>
                    <span className="ml-1">{report.format}</span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.report_industry || t.industry}{" "}
                      -{" "}
                      {data?.report_identity?.category_name ||
                        categoryData?.name ||
                        "Technology & Software"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.forecast_period ||
                        t.forecastPeriod}
                    </span>
                    <span className="ml-1">{report.forecast_period}</span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.report_id || t.reportId}
                    </span>
                    <span className="ml-1">{report.report_id}</span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {data?.report_meta_fields?.number_of_pages ||
                        t.numberOfPages}
                    </span>
                    <span className="ml-1">{report.number_of_pages}</span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {report.toc_included
                        ? data?.report_meta_fields?.toc_included ||
                          t.tocIncluded
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider 2 */}
              <div className="mt-6 h-px w-full bg-[#E5E5E5]"></div>
            </div>

            {/* Mobile Sidebar - Show only on mobile, after metadata */}
            <div
              className="mb-6 flex flex-col items-center gap-4 lg:hidden"
              style={{ width: "320px", margin: "0 auto" }}
            >
              {/* One Time Cost */}
              <div
                className="h-[68px] w-[300px] rounded-lg"
                style={{
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box",
                  border: "1px solid transparent",
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
                  <Button
                    className="flex h-[40px] items-center justify-between rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 text-[18px] font-bold text-white hover:bg-gray-700"
                    style={{
                      fontFamily: "Space Mono, monospace",
                      width: "274px",
                    }}
                    onClick={() =>
                      router.push(
                        `/${params?.lang}/reports/${params?.id}/checkout`,
                      )
                    }
                    aria-label="Buy License Now"
                  >
                    <span className="truncate">
                      {data?.report_meta_fields?.buy_now_btn ||
                        "Buy License Now"}
                    </span>
                    <ArrowIcon
                      variant="white"
                      className="h-6 w-6 flex-shrink-0"
                    />
                  </Button>
                </div>
              </div>

              {/* Free Sample */}
              <div
                className="h-[99px] w-[300px] rounded-lg"
                style={{
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box",
                  border: "1px solid transparent",
                }}
              >
                <div className="flex h-full w-full flex-col justify-between rounded-lg bg-gray-100 p-4">
                  <div>
                    <h3
                      className="mb-3 text-[14px] font-normal text-black"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      {report.free_sample || "Get A Free Sample"}
                    </h3>
                    <p
                      className="mb-4 hidden text-base font-normal text-[#595959] sm:block"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.free_sample_section}
                    </p>
                  </div>
                  <div className="flex w-full justify-center">
                    <Button
                      className="flex h-auto min-h-[40px] items-center justify-between rounded-lg bg-gray-900 px-4 py-2 text-[18px] font-bold text-white hover:bg-gray-700"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        width: "274px",
                      }}
                      onClick={() => setIsSampleFormOpen(true)}
                    >
                      <span
                        className="mr-2 text-left leading-tight whitespace-normal"
                        onClick={() => setIsSampleFormOpen(true)}
                      >
                        {data?.report_meta_fields?.request_pdf_btn ||
                          report.download_button}
                      </span>
                      <ArrowIcon
                        variant="white"
                        className="h-6 w-6 flex-shrink-0"
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Custom Report */}
              <div className="w-full">
                <div className="flex flex-col gap-3 pl-2">
                  <div>
                    <h3
                      className="mt-2 mb-0 text-[14px] font-normal text-black"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      {report.need_custom_report}
                    </h3>
                    <p
                      className="hidden text-base font-normal text-[#595959] sm:block"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.custom_report_description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-0 flex h-auto min-h-[50px] w-[300px] items-center justify-between rounded-[10px] border-[#000000] bg-white px-5 py-2 text-[14px] font-bold text-black hover:bg-gray-50"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    onClick={openPopup}
                  >
                    <span
                      className="mr-2 text-left text-[14px] leading-tight font-medium whitespace-normal"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {data?.report_meta_fields?.request_custom_btn ||
                        report.custom_report_button}
                    </span>
                    <div className="flex-shrink-0">
                      <img
                        src="/barrow.svg"
                        alt="Arrow"
                        className="h-[12.67px] w-[32px]"
                      />
                    </div>
                  </Button>
                </div>
              </div>

              {/* Social Media Sharing */}
              <div className="w-full p-2">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
                  <h3
                    className="text-[14px] font-normal whitespace-nowrap text-black"
                    style={{ fontFamily: "Space Mono, monospace" }}
                  >
                    {data?.share_at || "Share this report:"}
                  </h3>
                  <div className="flex items-center gap-3">
                    {/* X (Twitter) */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-gray-800"
                      onClick={() =>
                        window.open(
                          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this report: ${report.title}`)}&url=${encodeURIComponent(window.location.href)}`,
                          "_blank",
                        )
                      }
                      aria-label="Share on X"
                    >
                      <img src="/x.svg" alt="X" className="h-9 w-9" />
                    </button>
                    {/* Facebook */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-blue-700"
                      onClick={() =>
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                          "_blank",
                        )
                      }
                      aria-label="Share on Facebook"
                    >
                      <img
                        src="/facebook.svg"
                        alt="Facebook"
                        className="h-9 w-9"
                      />
                    </button>
                    {/* Instagram */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                      onClick={() =>
                        window.open(`https://www.instagram.com/`, "_blank")
                      }
                      aria-label="Share on Instagram"
                    >
                      <img
                        src="/instagram.svg"
                        alt="Instagram"
                        className="h-9 w-9"
                      />
                    </button>
                    {/* WhatsApp */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-green-600"
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} ${window.location.href}`)}`,
                          "_blank",
                        )
                      }
                      aria-label="Share on WhatsApp"
                    >
                      <img
                        src="/whatsapp.svg"
                        alt="WhatsApp"
                        className="h-9 w-9"
                      />
                    </button>
                    {/* Copy Link */}
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-gray-600"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }}
                      aria-label="Copy link"
                    >
                      <img
                        src="/share.svg"
                        alt="Copy Link"
                        className="h-9 w-9"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Section */}
            <div className="mt-10 mb-5 sm:mb-12">
              <h2
                className="mb-2 font-extrabold text-[#000000] sm:mb-3 sm:text-xl"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "24px",
                  fontWeight: 500,
                }}
              >
                {report.introduction_section}
              </h2>
              <p
                className="text-sm leading-relaxed text-gray-700 sm:text-base"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                dangerouslySetInnerHTML={{
                  __html: highlightText(report.introduction_description),
                }}
              />
            </div>

            {/* Key Report Highlights */}
            <div className="mb-5 sm:mb-12">
              <h2
                className="mb-2 text-lg font-bold text-[#000000] sm:mb-3 sm:text-xl"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "24px",
                  fontWeight: 500,
                }}
              >
                {report.key_report_highlights}
              </h2>
              <p
                className="mb-5 text-sm leading-relaxed text-gray-700 sm:mb-8 sm:text-base"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                dangerouslySetInnerHTML={{
                  __html: highlightText(report.key_report_description),
                }}
              />

              <div className="relative">
                <div className="-mx-4 grid w-screen grid-cols-1 gap-0 sm:mx-0 sm:w-full sm:grid-cols-2 sm:gap-0">
                  {/* Top Left - #1D1F54 Background */}
                  <div className="flex min-h-[120px] flex-col justify-start bg-black p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.dominant_section}
                    </h3>
                    <p
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(report.dominant_description),
                      }}
                    />
                  </div>

                  {/* Top Right - #06A591 Background */}
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#06A591] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.competititve_section}
                    </h3>
                    <p
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(report.competititve_description),
                      }}
                    />
                  </div>

                  {/* Bottom Left - #1553A5 Background */}
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#1553A5] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.strategic_section}
                    </h3>
                    <p
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(report.strategic_description),
                      }}
                    />
                  </div>

                  {/* Bottom Right - #1D1F54 Background */}
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#1D1F54] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.regional_section}
                    </h3>
                    <p
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(report.regional_description),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation and Content - Connected */}
            <div className="mb-6 sm:mb-8">
              {/* Mobile Dropdown */}
              <div className="mb-4 sm:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(parseInt(e.target.value))}
                  className="focus:ring-1.5 w-full rounded-lg border border-gray-300 bg-white p-3 text-[14px] font-medium text-[#000000] focus:ring-[#1160C9] focus:outline-none"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {sections.map((section: ReportSection, index: number) => (
                    <option
                      key={section.id}
                      value={index}
                      className="text-[14px] font-medium text-[#000000]"
                    >
                      {section.section_name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Tab Navigation */}
              <div className="no-scrollbar hidden w-full overflow-x-auto sm:flex">
                <div className="flex">
                  {sections.map((section: ReportSection, index: number) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(index)}
                      className={`flex items-center justify-center transition-colors ${
                        activeTab === index
                          ? "bg-black text-white"
                          : "border border-[#7C7C7C] bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        width: "195px",
                        height: "51px",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                        marginRight: index < sections.length - 1 ? "1px" : "0",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                        letterSpacing: "0.1px",
                      }}
                    >
                      <span className="truncate px-2">
                        {section.section_name.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content - Connected to tabs */}
              {sections.map((section: ReportSection, index: number) => {
                // Find the TOC section to extract FAQs
                const tocSection = sections.find(
                  (s: ReportSection) => s.section_name === "TOC",
                );
                const faqContent = tocSection?.section_description.includes(
                  "FAQs Section",
                )
                  ? tocSection.section_description.split(
                      "<strong>FAQs Section</strong>",
                    )[1]
                  : "";

                // Combine Why This Report content with FAQs
                const combinedContent =
                  section.section_name === "Why This Report?" && faqContent
                    ? decodeHtml(section.section_description + faqContent)
                    : decodeHtml(section.section_description);

                const contentWithImages = injectImages(combinedContent, report);

                return (
                  <div
                    key={section.id}
                    className={`${activeTab === index ? "block" : "hidden"}`}
                  >
                    <div className="relative -mt-px border border-t-0 border-gray-200 bg-gray-100 p-4 sm:p-6 lg:p-8">
                      <div className="absolute top-0 right-0 left-0 hidden h-px bg-black sm:block"></div>
                      <h2
                        className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl lg:text-2xl"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {section.section_name}
                      </h2>
                      <div
                        className="prose prose-sm prose-headings:font-[Space_Grotesk] prose-p:font-[Space_Grotesk] prose-li:font-[Space_Grotesk] prose-strong:font-[Space_Grotesk] prose-em:font-[Space_Grotesk] prose-ul:font-[Space_Grotesk] prose-ol:font-[Space_Grotesk] prose-blockquote:font-[Space_Grotesk] prose-img:font-[Space_Grotesk] prose-table:font-[Space_Grotesk] prose-headings:my-2 prose-p:my-2 prose-img:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 max-w-none leading-relaxed text-gray-700 [&_b]:font-[Space_Grotesk] [&_blockquote]:font-[Space_Grotesk] [&_div]:font-[Space_Grotesk] [&_em]:font-[Space_Grotesk] [&_h1]:my-2 [&_h1]:font-[Space_Grotesk] [&_h2]:my-2 [&_h2]:font-[Space_Grotesk] [&_h3]:my-2 [&_h3]:font-[Space_Grotesk] [&_h4]:my-2 [&_h4]:font-[Space_Grotesk] [&_h5]:my-2 [&_h5]:font-[Space_Grotesk] [&_h6]:my-2 [&_h6]:font-[Space_Grotesk] [&_i]:font-[Space_Grotesk] [&_img]:my-2 [&_img]:font-[Space_Grotesk] [&_li]:my-1 [&_li]:font-[Space_Grotesk] [&_ol]:font-[Space_Grotesk] [&_p]:my-2 [&_p]:font-[Space_Grotesk] [&_span]:font-[Space_Grotesk] [&_strong]:font-[Space_Grotesk] [&_table]:font-[Space_Grotesk] [&_td]:font-[Space_Grotesk] [&_th]:font-[Space_Grotesk] [&_ul]:font-[Space_Grotesk]"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                        dangerouslySetInnerHTML={{
                          __html: highlightText(contentWithImages),
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Market Scope and Analysis */}
            <MarketScopeAnalysis
              report={report}
              headings={data?.report_meta_fields}
            />

            {/* Key Recent Developments */}
            <RecentDevelopments
              heading={data?.report_meta_fields?.recent_developments_heading}
              content={report.recent_developments}
            />

            {/* FAQ */}
            <ReportFAQ
              heading={data?.report_meta_fields?.faq_heading}
              report={report}
            />
          </div>

          {/* Sidebar: desktop only */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-32">
              <div
                className="flex flex-col items-center gap-4"
                style={{ width: "322px", margin: "0 auto" }}
              >
                {/* One Time Cost */}
                <div
                  className="h-auto min-h-[85px] w-[322px] rounded-lg"
                  style={{
                    background:
                      "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box",
                    border: "1px solid transparent",
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 p-4">
                    <Button
                      className="flex h-[50px] items-center justify-between rounded-lg bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] px-4 text-[18px] font-bold text-white hover:bg-gray-700"
                      style={{
                        fontFamily: "Space Mono, monospace",
                        width: "297px",
                      }}
                      onClick={() =>
                        router.push(
                          `/${params?.lang}/reports/${params?.id}/checkout`,
                        )
                      }
                      aria-label="Buy License Now"
                    >
                      <span className="truncate">
                        {data?.report_meta_fields?.buy_now_btn ||
                          "Buy License Now"}
                      </span>
                      <ArrowIcon
                        variant="white"
                        className="h-6 w-6 flex-shrink-0"
                      />
                    </Button>
                  </div>
                </div>

                {/* Free Sample */}
                <div
                  className="h-auto min-h-[239px] w-[322px] rounded-lg"
                  style={{
                    background:
                      "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box",
                    border: "1px solid transparent",
                  }}
                >
                  <div className="flex h-full w-full flex-col justify-between rounded-lg bg-gray-100 p-6">
                    <div>
                      <h3
                        className="mb-2 text-xl font-normal text-black"
                        style={{ fontFamily: "Space Mono, monospace" }}
                      >
                        {report.free_sample}
                      </h3>
                      <p
                        className="mb-4 text-base font-normal text-[#595959]"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {report.free_sample_section}
                      </p>
                    </div>
                    <div className="flex w-full justify-center">
                      <Button
                        className="flex h-auto min-h-[50px] items-center justify-between rounded-lg bg-gray-900 px-4 py-2 text-[18px] font-bold text-white hover:bg-gray-700"
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          width: "297px",
                        }}
                      >
                        <span
                          className="mr-2 text-left leading-tight whitespace-normal"
                          onClick={() => setIsSampleFormOpen(true)}
                        >
                          {data?.report_meta_fields?.request_pdf_btn ||
                            report.download_button}
                        </span>
                        <ArrowIcon
                          variant="white"
                          className="h-6 w-6 flex-shrink-0"
                        />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Custom Report */}
                <div className="w-full">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3
                        className="mb-1 text-xl font-normal text-black"
                        style={{ fontFamily: "Space Mono, monospace" }}
                      >
                        {report.need_custom_report}
                      </h3>
                      <p
                        className="text-base font-normal text-[#595959]"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {report.custom_report_description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="flex h-auto min-h-[50px] w-full items-center justify-between rounded-lg border-gray-800 bg-white px-5 py-2 text-[18px] font-bold text-black hover:bg-gray-50"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      onClick={openPopup}
                    >
                      <span
                        className="mr-2 text-left text-[20px] leading-tight font-medium whitespace-normal"
                        style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        {data?.report_meta_fields?.request_custom_btn ||
                          report.custom_report_button}
                      </span>
                      <div className="flex-shrink-0">
                        <img
                          src="/barrow.svg"
                          alt="Arrow"
                          className="h-4 w-8"
                        />
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Social Media Sharing */}
                <div className="w-full p-2">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
                    <h3
                      className="text-[18px] font-normal whitespace-nowrap text-black"
                      style={{ fontFamily: "Space Mono, monospace" }}
                    >
                      {data?.share_at || "Share this report:"}
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* X (Twitter) */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                        onClick={() =>
                          window.open(
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this report: ${report.title}`)}&url=${encodeURIComponent(window.location.href)}`,
                            "_blank",
                          )
                        }
                        aria-label="Share on X"
                      >
                        <img src="/x.svg" alt="X" className="h-9 w-9" />
                      </button>
                      {/* Facebook */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                        onClick={() =>
                          window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                            "_blank",
                          )
                        }
                        aria-label="Share on Facebook"
                      >
                        <img
                          src="/facebook.svg"
                          alt="Facebook"
                          className="h-9 w-9"
                        />
                      </button>
                      {/* Instagram */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                        onClick={() =>
                          window.open(`https://www.instagram.com/`, "_blank")
                        }
                        aria-label="Share on Instagram"
                      >
                        <img
                          src="/instagram.svg"
                          alt="Instagram"
                          className="h-9 w-9"
                        />
                      </button>
                      {/* WhatsApp */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} ${window.location.href}`)}`,
                            "_blank",
                          )
                        }
                        aria-label="Share on WhatsApp"
                      >
                        <img
                          src="/whatsapp.svg"
                          alt="WhatsApp"
                          className="h-9 w-9"
                        />
                      </button>
                      {/* Copy Link */}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Link copied to clipboard!");
                        }}
                        aria-label="Copy link"
                      >
                        <img
                          src="/share.svg"
                          alt="Copy Link"
                          className="h-9 w-9"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Layout Section */}
      {commonLayout && <CommonLayoutSection data={commonLayout} />}

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
  );
}
