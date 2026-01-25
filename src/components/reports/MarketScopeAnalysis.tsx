import React from 'react';
import { Report } from '@/types/reports';

interface MarketScopeAnalysisProps {
    report: any; // Using any for now to be safe with the large Report type, or interface provided
    headings: any;
}

const MarketScopeAnalysis: React.FC<MarketScopeAnalysisProps> = ({ report, headings }) => {
    // Helper to strip HTML tags if needed, though we might render them safely
    // The requirement says "main data have size 20".

    // Config for rows
    // each item: { label: string, value: string, isMarketSize?: boolean }
    const rows = [
        { label: headings?.study_period_heading || 'Study Period', value: report.study_period_description },
        { label: headings?.market_base_year_heading || 'Base Year', value: report.market_base_year },
        { label: headings?.estimated_year_heading || 'Estimated Year', value: report.estimated_year },
        { label: headings?.forcast_period_heading || 'Forecast Period', value: report.forcast_period || report.forecast_period }, // Handling typo in API key if it exists
        { label: headings?.historical_period_heading || 'Historical Period', value: report.historical_period },
        { label: headings?.growth_rate_heading || 'Growth Rate', value: report.growth_rate },
        {
            label: report.market_size_value_title_1,
            value: report.market_size_value_description_1,
            isMarketSize: true
        },
        {
            label: report.market_size_value_title_2,
            value: report.market_size_value_description_2,
            isMarketSize: true
        },
        { label: headings?.segmentation_covered_heading || 'Segmentation Covered', value: report.segmentation_covered },
        { label: headings?.market_leaders_heading || 'Market Leaders', value: report.market_leaders },
        { label: headings?.regions_and_countries_covered_heading || 'Regions and countries covered', value: report.regions_and_countries_covered },
    ];

    // Last 3 rows indices for coloring (8, 9, 10)
    const lastThreeStartIndex = rows.length - 3;

    return (
        <div className="mb-12 font-space-grotesk">
            <h2
                className="font-bold text-black mb-6"
                style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '32px',
                    lineHeight: '40.83px'
                }}
            >
                {headings?.market_scope_and_analysis_heading || 'Market Scope and Analysis'}
            </h2>

            <div className="overflow-x-auto pb-2">
                <div className="w-full border-t border-l border-r border-[#999999] md:min-w-[600px]">
                    {/* Header Row */}
                    <div className="flex">
                        <div
                            className="w-[40%] text-white font-medium p-2 md:p-4 border-b border-r border-[#999999] text-base md:text-[24px]"
                            style={{
                                backgroundColor: '#1553A5',
                                border: '1px solid #034D44',
                                fontFamily: 'Space Grotesk, sans-serif'
                            }}
                        >
                            {headings?.attribute_heading?.toUpperCase() || 'ATTRIBUTE'}
                        </div>
                        <div
                            className="w-[60%] text-white font-medium p-2 md:p-4 border-b border-[#999999] text-base md:text-[24px]"
                            style={{
                                backgroundColor: '#06A591',
                                border: '1px solid #103566',
                                fontFamily: 'Space Grotesk, sans-serif'
                            }}
                        >
                            {headings?.details_heading?.toUpperCase() || 'DETAILS'}
                        </div>
                    </div>

                    {/* Data Rows */}
                    {rows.map((row, index) => {
                        const isLastThree = index >= lastThreeStartIndex;
                        // User requested market size fields in attribute column to be rgb(127, 255, 110) = #7FFF6E
                        const attributeBg = row.isMarketSize ? '#FFFFFF' : '#FFFFFF';
                        const attributeColor = '#000000'; // Always black text now since BG is light
                        const detailsBg = isLastThree ? '#FFFFFF' : '#FFFFFF';

                        // Using flex for the row
                        return (
                            <div key={index} className="flex">
                                {/* Attribute Column */}
                                <div
                                    className="w-[40%] p-2 md:p-4 border-b border-r border-[#999999] flex items-center text-sm md:text-[20px]"
                                    style={{
                                        backgroundColor: attributeBg,
                                        color: attributeColor,
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        fontWeight: 400
                                    }}
                                >
                                    {row.label}
                                </div>

                                {/* Details Column */}
                                <div
                                    className="w-[60%] p-2 md:p-4 border-b border-[#999999] flex items-center text-sm md:text-[20px]"
                                    style={{
                                        backgroundColor: detailsBg,
                                        color: '#000000',
                                        fontFamily: 'Space Grotesk, sans-serif',
                                        fontWeight: 400 // Not bold (Normal)
                                    }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: row.value || '-' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MarketScopeAnalysis;
