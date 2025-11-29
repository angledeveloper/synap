import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Report } from "@/types/reports";
import { useLanguageStore } from "@/store";
import ArrowIcon from "@/components/common/ArrowIcon";

interface ReportCardProps {
  report: Report;
  viewReportLabel?: string;
  baseYearLabel?: string;
  forecastPeriodLabel?: string;
}

export default function ReportCard({ report, viewReportLabel, baseYearLabel, forecastPeriodLabel }: ReportCardProps) {
  const { language } = useLanguageStore();
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
      className="w-full h-[294px] md:h-[250px] bg-[#f8f8f8] shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderImage: 'linear-gradient(90deg, #1160C9 0%, #08D2B8 100%) 1',
        borderRadius: '0px',
      }}
    >
      <CardContent className="!p-4 !pt-2">
        <div className="flex flex-col h-full">
          {/* Title Text - Limited to 3 lines */}
          <div className="mb-4">
            <p className="text-[#202020] text-base line-clamp-3 md:text-base" style={{
              fontFamily: 'Space Mono, monospace',
              fontWeight: '400',
              lineHeight: '24px',
              letterSpacing: '0%',
              color: '#374151',
              fontSize: '16px'
            }}>
              {truncateText(report.title, 3)}
            </p>
          </div>

          {/* Description Text - Limited to 3 lines */}
          <div className="mb-6">
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

          {/* Metadata Grid */}
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#555353]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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

          {/* Bottom Section with View Report Button */}
          <div className="flex justify-end items-center mt-4 mb-0">
            {/* View Report Button - Text with underline */}

            {/* View Report Button - Text with underline */}
            <Link href={`/${language}/reports/${report.id}`}>
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
      </CardContent>
    </Card>
  );
}
