import React from 'react';

interface RecentDevelopmentsProps {
    heading: string;
    showEmpty?: boolean;
    content: string;
}

const RecentDevelopments: React.FC<RecentDevelopmentsProps> = ({ heading, content, showEmpty = false }) => {
    if (!content && !showEmpty) return null;

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
                {heading || 'Key Recent Developments'}
            </h2>

            <div
                className="border border-[#E5E5E5] p-6 sm:p-8"
                style={{
                    backgroundColor: '#FFFFFF',
                }}
            >
                <div
                    className="text-gray-700 space-y-4"
                    style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '20px', // Matches "main data have size 20"
                        lineHeight: '1.6'
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
};

export default RecentDevelopments;
