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
import ActionButtons, {
  CustomReportButton,
  DownloadSampleButton,
} from "./components/ActionButtons";
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
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
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
  if (!dateString) return "";
  const safeDate = dateString.replace(" ", "T");
  try {
    const date = new Date(safeDate);
    if (isNaN(date.getTime())) {
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

export default function ReportView({ data, lang, id, refId }: ReportViewProps) {
  const t: any = getTranslations("reportDetail", lang);
  const commonT: any = getTranslations("reports", lang);

  const report = data.data.report;
  const sections = data.data.sections;
  const metaFields = data.report_meta_fields;
  const commonLayout = data.common_layout;

  // Resolve category name (fallback logic similar to client)
  const identity: any = data.report_identity;
  const categoryName =
    identity?.category_name ||
    commonT?.breadcrumbCategory ||
    "Technology & Software";

  return (
    <main className="min-h-screen bg-white pt-24 pb-24 sm:pb-0">
      {/* Sync Language to Store (Client Component) */}
      <LanguageSync
        lang={lang}
        refId={refId}
        catRefId={data.report_identity?.category_reference_id?.toString()}
      />

      {/* Breadcrumb */}
      <div className="pt-2 pb-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 2xl:max-w-7xl">
          <nav className="flex" aria-label="Breadcrumb">
            <ol
              className="flex min-w-0 items-center justify-start space-x-2 sm:justify-center"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <li className="flex-shrink-0">
                <Link
                  href={`/${lang}`}
                  className="text-sm font-normal text-gray-500 hover:text-gray-700"
                >
                  {commonT.breadcrumbHome}
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm text-gray-500"
                />
              </li>
              <li className="flex-shrink-0">
                <Link
                  href={`/${lang}/reports`}
                  className="text-sm font-normal whitespace-nowrap text-gray-500 hover:text-gray-700"
                >
                  {categoryName}
                </Link>
              </li>
              <li className="flex-shrink-0">
                <Icon
                  icon="mdi:chevron-right"
                  className="text-sm text-gray-500"
                />
              </li>
              <li className="min-w-0 flex-1">
                <span className="block truncate text-sm font-normal text-gray-500">
                  {report.breadcrumb || report.title}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4 pb-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:max-w-7xl">
        <div className="relative grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-2">
            {/* Title and Metadata */}
            <div className="mb-4 flex flex-col sm:mb-6">
              <div className="mb-6 h-px w-full bg-[#E5E5E5]"></div>

              {/* Title and Image Container */}
              <div className="mb-6 flex flex-col gap-4 sm:gap-6 md:flex-row">
                {/* Report Image */}
                <div className="hidden w-full flex-shrink-0 overflow-hidden bg-gray-200 md:visible md:h-[93px] md:w-[93px]">
                  {report.image ? (
                    <img
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

              {/* Metadata Grid */}
              <div
                className="mb-2 grid w-full grid-cols-2 gap-x-6 gap-y-3 md:hidden"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  letterSpacing: "0px",
                  fontWeight: "400",
                  color: "#7C7C7C",
                }}
              >
                <div className="flex items-center">
                  <span>{metaFields?.last_updated_at || t.lastUpdated}</span>
                  <span className="ml-1">
                    {formatDate(report.updated_at || report.modify_at, lang)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.publish_date || "Publish Date:"}</span>
                  <span className="ml-1">
                    {formatDate(report.created_at, lang)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.base_year || t.baseYear}</span>
                  <span className="ml-1">{report.base_year}</span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.format || t.format}</span>
                  <span className="ml-1">{report.format}</span>
                </div>
                <div className="flex items-center">
                  <span>
                    {metaFields?.report_industry || t.industry} - {categoryName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.forecast_period || t.forecastPeriod}</span>
                  <span className="ml-1">{report.forecast_period}</span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.report_id || t.reportId}</span>
                  <span className="ml-1">{report.report_id}</span>
                </div>
                <div className="flex items-center">
                  <span>{metaFields?.number_of_pages || t.numberOfPages}</span>
                  <span className="ml-1">{report.number_of_pages}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span>{metaFields?.toc || "TOC"}:</span>
                  <span className="ml-1">{report.toc || "-"}</span>
                </div>
              </div>

              <div
                className="mb-2 hidden w-full flex-col justify-between gap-y-4 md:flex md:flex-row"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  letterSpacing: "0px",
                  fontWeight: "400",
                  color: "#7C7C7C",
                }}
              >
                {/* Column 1 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <span>{metaFields?.last_updated_at || t.lastUpdated}</span>
                    <span className="ml-1">
                      {formatDate(report.updated_at || report.modify_at, lang)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>{metaFields?.publish_date || "Publish Date:"}</span>
                    <span className="ml-1">
                      {formatDate(report.created_at, lang)}
                    </span>
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
                    <span>
                      {metaFields?.report_industry || t.industry} -{" "}
                      {categoryName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>
                      {metaFields?.forecast_period || t.forecastPeriod}
                    </span>
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
                    <span>
                      {metaFields?.number_of_pages || t.numberOfPages}
                    </span>
                    <span className="ml-1">{report.number_of_pages}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{metaFields?.toc || "TOC"}:</span>
                    <span className="ml-1">{report.toc || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-px w-full bg-[#E5E5E5]"></div>
            </div>

            {/* Mobile Sidebar - Show only on mobile */}
            <div
              className="visible mb-6 flex w-full flex-col items-center gap-4 md:w-[320px] lg:hidden"
              style={{ width: "", margin: "0 auto" }}
            >
              {/* One Time Cost */}
              <div className="h-[68px] w-full rounded-lg border border-transparent md:w-[300px] md:bg-gradient-to-r md:from-[#1160C9] md:to-[#08D2B8]">
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-transparent md:bg-gray-100">
                  <BuyButton
                    lang={lang}
                    id={id}
                    label={
                      data.buy_license_button ||
                      metaFields?.buy_now_btn ||
                      "Buy License Now"
                    }
                    variant="mobile"
                  />
                </div>
              </div>

              {/* Free Sample */}
              <div
                className="hidden h-auto min-h-[99px] w-[300px] rounded-lg md:visible"
                style={{
                  background:
                    "linear-gradient(white, white) padding-box, linear-gradient(90deg, #1160C9, #08D2B8) border-box",
                  border: "1px solid transparent",
                }}
              >
                <div className="flex h-full w-full flex-col justify-between rounded-lg bg-gray-100 p-4">
                  <div className="mb-2">
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
                  <ActionButtons
                    reportTitle={report.title}
                    reportId={report.report_id}
                    reportImage={report.image}
                    downloadLabel={
                      metaFields?.request_pdf_btn || report.download_button
                    }
                    customLabel={
                      metaFields?.request_custom_btn ||
                      report.custom_report_button
                    }
                    variant="mobile"
                  />
                </div>
              </div>

              {/* Custom Report */}
              <div className="hidden w-full md:visible">
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
                  <CustomReportButton
                    reportTitle={report.title}
                    label={
                      metaFields?.request_custom_btn ||
                      report.custom_report_button
                    }
                    variant="mobile"
                  />
                </div>
              </div>

              {/* Social Share Mobile */}
              <div className="hidden w-full p-2 md:visible">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
                  <h3
                    className="text-[14px] font-normal whitespace-nowrap text-black"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    {data.share_at || "Share this report:"}
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
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(report.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800"
                    >
                      <img src="/x.svg" alt="X" className="h-9 w-9" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=https://synapseaglobal.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <img
                        src="/facebook.svg"
                        alt="Facebook"
                        className="h-9 w-9"
                      />
                    </a>
                    <a
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                    >
                      <img
                        src="/instagram.svg"
                        alt="Instagram"
                        className="h-9 w-9"
                      />
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} https://synapseaglobal.com`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                    >
                      <img
                        src="/whatsapp.svg"
                        alt="WhatsApp"
                        className="h-9 w-9"
                      />
                    </a>
                    <CopyLinkButton />
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Section */}
            <div className="mt-4 mb-5 sm:mb-12">
              <h2
                className="mb-2 font-extrabold text-[#000000] sm:mb-3 sm:text-xl"
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {report.introduction_section}
              </h2>
              <div
                className="text-sm leading-relaxed text-gray-700 sm:text-base"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                dangerouslySetInnerHTML={{
                  __html: report.introduction_description,
                }} // Removing highlightText for server render basic
              />
            </div>

            {/* Key Report Highlights */}
            <div className="mb-5 sm:mb-12">
              <h2
                className="mb-2 text-lg font-bold text-[#000000] sm:mb-3 sm:text-xl"
                style={{
                  fontSize: "24px",
                  fontWeight: 500,
                  fontFamily: "Space Grotesk, sans-serif",
                }}
              >
                {report.key_report_highlights}
              </h2>
              <div
                className="mb-5 text-sm leading-relaxed text-gray-700 sm:mb-8 sm:text-base"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                dangerouslySetInnerHTML={{
                  __html: report.key_report_description,
                }}
              />

              <div className="relative">
                <div className="-mx-4 grid w-screen grid-cols-1 gap-0 sm:mx-0 sm:w-full sm:grid-cols-2 sm:gap-0">
                  {/* Highlight Boxes - Server Rendered Static */}
                  <div className="flex min-h-[120px] flex-col justify-start bg-black p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.dominant_section}
                    </h3>
                    <div
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: report.dominant_description,
                      }}
                    />
                  </div>
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#06A591] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.competititve_section}
                    </h3>
                    <div
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: report.competititve_description,
                      }}
                    />
                  </div>
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#1553A5] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.strategic_section}
                    </h3>
                    <div
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: report.strategic_description,
                      }}
                    />
                  </div>
                  <div className="flex min-h-[120px] flex-col justify-start bg-[#1D1F54] p-4 text-white sm:min-h-0 sm:p-6">
                    <h3
                      className="mb-2 text-left text-base font-bold sm:mb-3 sm:text-lg"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {report.regional_section}
                    </h3>
                    <div
                      className="text-left text-xs leading-relaxed text-white sm:text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{
                        __html: report.regional_description,
                      }}
                    />
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

                const combinedContent =
                  section.section_name === "Why This Report?" && faqContent
                    ? decodeHtml(section.section_description + faqContent)
                    : decodeHtml(section.section_description);

                const contentWithImages = injectImages(combinedContent, report); // Use report object for images

                return (
                  <div
                    className="relative -mt-px border border-t-0 border-gray-200 bg-gray-100 p-4 sm:p-6 lg:p-8"
                    key={section.id}
                  >
                    <div className="absolute top-0 right-0 left-0 hidden h-px bg-black sm:block"></div>

                    <div
                      className="prose prose-sm max-w-none leading-relaxed text-gray-700"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      dangerouslySetInnerHTML={{ __html: contentWithImages }}
                    />
                  </div>
                );
              })}
            </ReportClientWrapper>

            <MarketScopeAnalysis report={report} headings={metaFields} />

            <RecentDevelopments
              heading={metaFields?.recent_developments_heading || ""}
              content={report.recent_developments || ""}
            />

            <ReportFAQ heading={metaFields?.faq_heading} report={report} />
          </div>

          {/* Desktop Sidebar */}
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
                    <BuyButton
                      lang={lang}
                      id={id}
                      label={
                        data.buy_license_button ||
                        metaFields?.buy_now_btn ||
                        "Buy License Now"
                      }
                      variant="desktop"
                    />
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
                    <ActionButtons
                      reportTitle={report.title}
                      reportId={report.report_id}
                      reportImage={report.image}
                      downloadLabel={
                        metaFields?.request_pdf_btn || report.download_button
                      }
                      customLabel={
                        metaFields?.request_custom_btn ||
                        report.custom_report_button
                      }
                      variant="desktop"
                    />
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
                    <CustomReportButton
                      reportTitle={report.title}
                      label={
                        metaFields?.request_custom_btn ||
                        report.custom_report_button
                      }
                      variant="desktop"
                    />
                  </div>
                </div>

                {/* Social Share Desktop */}
                <div className="w-full p-2">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-1">
                    <h3
                      className="text-[18px] font-normal whitespace-nowrap text-black"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      {data.share_at || "Share this report:"}
                    </h3>
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(report.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                      >
                        <img src="/x.svg" alt="X" className="h-9 w-9" />
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=https://synapseaglobal.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                      >
                        <img
                          src="/facebook.svg"
                          alt="Facebook"
                          className="h-9 w-9"
                        />
                      </a>
                      <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                      >
                        <img
                          src="/instagram.svg"
                          alt="Instagram"
                          className="h-9 w-9"
                        />
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out this report: ${report.title} https://synapseaglobal.com`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors"
                      >
                        <img
                          src="/whatsapp.svg"
                          alt="WhatsApp"
                          className="h-9 w-9"
                        />
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

      {/* Mobile Fixed Action Bar */}
      <div
        className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white sm:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="rounded-0 grid w-full grid-cols-2 gap-0">
          <DownloadSampleButton
            reportTitle={report.title}
            reportId={report.report_id}
            reportImage={report.image}
            label={
              metaFields?.request_pdf_btn ||
              report.download_button ||
              "Download Sample PDF"
            }
            variant="mobile"
            className="rounded-none"
          />
          <BuyButton
            lang={lang}
            id={id}
            label={
              data.buy_license_button ||
              metaFields?.buy_now_btn ||
              "Buy License Now"
            }
            variant="mobile"
            className="rounded-none"
          />
        </div>
      </div>

      {/* Common Layout / Bottom Section - Full Width */}
      <CommonLayoutSection data={commonLayout} />
    </main>
  );
}
