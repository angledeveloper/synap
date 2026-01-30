import React from "react";

interface RecentDevelopmentsProps {
  heading: string;
  showEmpty?: boolean;
  content: string;
}

const RecentDevelopments: React.FC<RecentDevelopmentsProps> = ({
  heading,
  content,
  showEmpty = false,
}) => {
  if (!content && !showEmpty) return null;

  return (
    <div className="font-space-grotesk mb-12">
      <h2
        className="mb-6 font-bold text-black"
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "32px",
          lineHeight: "40.83px",
        }}
      >
        {heading || "Key Recent Developments"}
      </h2>

      <div
        className="border border-[#E5E5E5] p-6 sm:p-8"
        style={{
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          className="space-y-4 text-sm leading-relaxed text-gray-700 sm:text-base"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default RecentDevelopments;
