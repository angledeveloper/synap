import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import type { ReportData } from "@/app/[lang]/reports/[id]/checkout/page";

interface CheckoutHeaderProps {
  report: ReportData | null;
}

export default function CheckoutHeader({ report }: CheckoutHeaderProps) {
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
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-1 sm:ml-2">{report.last_updated}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span>{new Date(report.last_updated).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="font-medium">Base Year data:</span>
                  <span className="ml-1 sm:ml-2">2024</span>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col space-y-1 sm:space-y-2">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="font-medium">Format:</span>
                  <span className="ml-1 sm:ml-2">{String(report.format).toUpperCase()}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span>Industry - {report.industry}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="font-medium">Forecast Period:</span>
                  <span className="ml-1 sm:ml-2">2025-2032</span>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col space-y-1 sm:space-y-2">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className="font-medium">Report ID:</span>
                  <span className="ml-1 sm:ml-2">{report.report_id}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <span>Number of Pages - {report.pages}</span>
                </div>
                <div className="flex items-center">
                  <span>TOC included</span>
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


