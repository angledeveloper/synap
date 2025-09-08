import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Report } from "@/types/reports";

interface ReportCardProps {
  report: Report;
  viewReportLabel?: string;
}

export default function ReportCard({ report, viewReportLabel }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="w-full bg-white rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          {/* Report Content */}
          <div className="flex-1 pr-6">
            {/* Report Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
              {report.title}
            </h3>
            
            {/* Report Summary */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
              {report.summary}
            </p>

            {/* Date and Price */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {formatDate(report.date)}
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(report.price, report.currency)}
              </span>
            </div>
          </div>

          {/* View Report Button */}
          <div className="flex-shrink-0">
            <Link href={`/reports/${report.id}`}>
              <Button 
                className="bg-gradient-to-r from-[#08D2B8] to-[#1160C9] hover:opacity-90 transition-opacity duration-200"
                size="sm"
              >
                {viewReportLabel || 'View Report'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
