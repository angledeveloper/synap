import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import type { ReportData } from "@/types/checkout";

interface CheckoutHeaderProps {
  report: ReportData | null;
  labels?: any;
  metaFields?: any;
}

export default function CheckoutHeader({ report, labels, metaFields }: CheckoutHeaderProps) {
  // Default labels if not provided
  const t = labels || {
    lastUpdated: "Last Updated",
    baseYear: "Base Year data",
    format: "Format",
    industry: "Industry",
    forecastPeriod: "Forecast Period",
    reportId: "Report ID",
    numberOfPages: "Number of Pages",
    tocIncluded: "TOC included"
  };

  if (!report) {
    return (
      <div className="w-full bg-[#f5f5f5] p-6">
        <div className="max-w-[1352px] mx-auto">
          <div
            className="w-full h-[284px] bg-white p-6"
            style={{
              border: '2px solid',
              borderImage: 'linear-gradient(90deg, #1160C9, #08D2B8) 1',
              borderRadius: '0px'
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4 h-full">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="h-4 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="w-full max-w-[1352px] mx-auto">
        <div
          className="w-full h-auto sm:h-71 bg-[#F8F8F8] p-4 sm:p-6"
          style={{
            border: '2px solid',
            borderImage: 'linear-gradient(90deg, #1160C9, #08D2B8) 1',
            borderRadius: '0px',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto'
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 h-full">
            {/* Report Image */}
            <div className="w-32 h-32 sm:w-45 sm:h-55 flex-shrink-0 overflow-hidden">
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
            <div className="flex-1">
              <h1
                className="text-blue-600 mb-2 sm:mb-4 text-lg sm:text-xl lg:text-2xl"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(18px, 5vw, 24px)',
                  lineHeight: '1.3',
                  letterSpacing: '0px',
                  fontWeight: '500'
                }}
              >
                {report.title}
              </h1>

              {/* Report Metadata Grid */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  lineHeight: '1.4',
                  letterSpacing: '0px',
                  fontWeight: '500',
                  color: '#7C7C7C'
                }}
              >
                {/* Column 1 */}
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.last_updated_at || t.lastUpdated}:</span>
                    <span className="ml-1 sm:ml-2">{report.last_updated}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.publish_date || 'Publish Date'}:</span>
                    <span className="ml-1 sm:ml-2">{report.publish_date || '-'}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.base_year || t.baseYear}:</span>
                    <span className="ml-1 sm:ml-2">{report.base_year || '-'}</span>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.format || t.format}:</span>
                    <span className="ml-1 sm:ml-2">{String(report.format).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.report_industry || t.industry}:</span>
                    <span className="ml-1 sm:ml-2">{report.industry}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.forecast_period || t.forecastPeriod}:</span>
                    <span className="ml-1 sm:ml-2">{report.forecast_period || '-'}</span>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.report_id || t.reportId}:</span>
                    <span className="ml-1 sm:ml-2">{report.report_id}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm">
                    <span className="font-medium">{metaFields?.number_of_pages || t.numberOfPages}:</span>
                    <span className="ml-1 sm:ml-2">{report.pages}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">{metaFields?.toc || 'TOC'}:</span>
                    <span className="ml-1 sm:ml-2">{report.toc || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


