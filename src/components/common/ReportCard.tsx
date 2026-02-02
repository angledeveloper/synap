import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Report } from "@/types/reports";
import { useLanguageStore, useHomePageStore } from "@/store";
import ArrowIcon from "@/components/common/ArrowIcon";
import { buildCanonicalReportSlug } from "@/lib/reportUtils";

interface ReportCardProps {
  report: Report;
  viewReportLabel?: string;
  baseYearLabel?: string;
  forecastPeriodLabel?: string;
}

export default function ReportCard({ report, viewReportLabel, baseYearLabel, forecastPeriodLabel }: ReportCardProps) {
  const { language } = useLanguageStore();
  const canonicalSlug = buildCanonicalReportSlug(report);

  const reportUrl = canonicalSlug
    ? `/${language}/reports/${canonicalSlug}`
    : `/${language}/reports`;

  const formatDate = (dateString: string) => {
    // Handle different date formats from API
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, return as is
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Truncate text to 3 lines
  const truncateText = (text: string, maxLines: number = 3) => {
    const words = text.split(' ');
    const wordsPerLine = 12; // Approximate words per line
    const maxWords = maxLines * wordsPerLine;

    if (words.length <= maxWords) {
      return text;
    }

    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <Card
      className="w-full h-auto bg-[#f8f8f8] shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderImage: 'linear-gradient(90deg, #1160C9 0%, #08D2B8 100%) 1',
        borderRadius: '0px',
      }}
    >
      <CardContent className="!px-4 !pt-3 !pb-3">
        <div className="flex flex-col h-full">
          {/* Title Text - Limited to 3 lines */}
          <div className="mb-3">
            <Link href={reportUrl} className="block" onClick={() => {
              const { setIdentity } = useHomePageStore.getState();
              if (report.report_identity && report.report_identity.report_reference_id) {
                setIdentity({
                  report_reference_id: report.report_identity.report_reference_id,
                  category_reference_id: String(report.report_identity.category_reference_id)
                });
              }
            }}>
              <p className="text-[#202020] text-base line-clamp-3 md:text-base hover:text-blue-700 transition-colors" style={{
                fontFamily: 'Space Mono, monospace',
                fontWeight: '400',
                lineHeight: '24px',
                letterSpacing: '0%',
                fontSize: '16px'
              }}>
                {truncateText(report.title, 3)}
              </p>
            </Link>
          </div>

          {/* Description Text - Limited to 3 lines */}
          <div className="mb-3">
            <p className="text-[#555353] text-sm line-clamp-3" style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: '300',
              lineHeight: '18px',
              letterSpacing: '0%',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              {truncateText(report.introduction_description, 3)}...
            </p>
          </div>

          {/* Metadata and Button Row */}
          <div className="mt-auto mb-0 pt-0 flex items-end justify-between gap-4">
            {/* Metadata Grid (Left) */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#555353]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {report.base_year && (
                <div>
                  <span className="font-semibold">{baseYearLabel || 'Base Year:'}</span> {report.base_year}
                </div>
              )}
              {report.forecast_period && (
                <div>
                  <span className="font-semibold">{forecastPeriodLabel || 'Forecast Period:'}</span> {report.forecast_period}
                </div>
              )}
              {report.report_date && (
                <div>
                  <span className="font-semibold">Published:</span> {formatDate(report.report_date)}
                </div>
              )}
              {report.last_updated && (
                <div>
                  <span className="font-semibold">Updated:</span> {report.last_updated}
                </div>
              )}
              {report.number_of_pages && (
                <div>
                  <span className="font-semibold">Pages:</span> {report.number_of_pages}
                </div>
              )}
            </div>

            {/* View Report Button (Right) */}
            <div className="flex-shrink-0">
              <Link href={reportUrl} onClick={() => {
                const { setIdentity } = useHomePageStore.getState();
                // Check if report_identity exists, otherwise fallback or log
                if (report.report_identity && report.report_identity.report_reference_id) {
                  setIdentity({
                    report_reference_id: report.report_identity.report_reference_id,
                    category_reference_id: String(report.report_identity.category_reference_id)
                  });
                }
              }}>
                <span
                  className="hover:text-gray-700 transition-colors duration-200 border-b-2 border-gray-900 hover:border-gray-700 font-medium"
                  style={{
                    fontFamily: 'Noto Sans, sans-serif',
                    color: '#010912',
                    fontSize: '16px',
                    lineHeight: '22px',
                  }}
                >
                  {viewReportLabel || 'View Report'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
