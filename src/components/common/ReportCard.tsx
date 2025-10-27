import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Report } from "@/types/reports";
import { useLanguageStore } from "@/store";
import ArrowIcon from "@/components/common/ArrowIcon";

interface ReportCardProps {
  report: Report;
  viewReportLabel?: string;
}

export default function ReportCard({ report, viewReportLabel }: ReportCardProps) {
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
    <Card className="w-full bg-white rounded-lg shadow-sm border-t-2 border-blue-500 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6" style={{ padding: '24px' }}>
        <div className="flex flex-col h-full">
          {/* Title Text - Limited to 3 lines */}
          <div className="mb-4">
            <p className="text-gray-800 text-base line-clamp-3" style={{ 
              fontFamily: 'Space Mono, monospace', 
              fontWeight: '400',
              lineHeight: '30px',
              letterSpacing: '0%',
              color: '#374151'
            }}>
              {truncateText(report.title, 3)}
            </p>
          </div>

          {/* Description Text - Limited to 3 lines */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm line-clamp-3" style={{ 
              fontFamily: 'Noto Sans, sans-serif', 
              fontWeight: '300',
              lineHeight: '20px',
              letterSpacing: '0%',
              color: '#6B7280'
            }}>
              {truncateText(report.introduction_description, 3)}...
            </p>
          </div>

          {/* Bottom Section with Date, Cost, and View Report Button */}
          <div className="flex justify-between items-center mt-auto">
            {/* Date and Cost */}
            <div className="flex items-center gap-4">
              <span style={{ 
                fontFamily: 'Space Grotesk, sans-serif', 
                fontWeight: '400',
                fontSize: '20px',
                color: '#6B7280'
              }}>
                {formatDate(report.report_date)}
              </span>
              <span style={{ 
                fontFamily: 'Space Grotesk, sans-serif', 
                fontWeight: '400',
                fontSize: '20px',
                color: '#000000'
              }}>
                {report.cost}
              </span>
            </div>

            {/* View Report Button - Text with underline */}
            <Link href={`/${language}/reports/${report.id}`}>
              <span 
                className="hover:text-gray-700 transition-colors duration-200 border-b-2 border-gray-900 hover:border-gray-700 font-bold"
                style={{ 
                  fontFamily: 'Noto Sans, sans-serif', 
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '14px'
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
