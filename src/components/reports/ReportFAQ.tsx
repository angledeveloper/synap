"use client";

import React from "react";

interface ReportFAQProps {
  heading: string;
  report: any; // Using any for flexible API data access
}

const ReportFAQ: React.FC<ReportFAQProps> = ({ heading, report }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Extract Q&A pairs 1 to 6
  const faqs = [];
  for (let i = 1; i <= 6; i++) {
    const question = report[`question_${i}`];
    const answer = report[`answer_${i}`];

    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  if (faqs.length === 0) return null;

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
        {heading || "Frequently Asked Questions"}
      </h2>

      <div className="">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-2 text-left"
              onClick={() =>
                setOpenIndex((prev) => (prev === index ? null : index))
              }
              aria-expanded={openIndex === index}
              aria-controls={`faq-panel-${index}`}
            >
              <span
                className="text-sm font-bold text-gray-700 sm:text-base"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#464646",
                }}
              >
                Q{index + 1}: {faq.question}
              </span>
              <span
                className={`0 grid h-6 w-6 place-items-center text-gray-600 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                <svg
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              id={`faq-panel-${index}`}
              className={`grid transition-all duration-300 ease-out ${
                openIndex === index
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden pb-4">
                <p
                  className="text-sm leading-relaxed text-gray-700 sm:text-base"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: "#464646",
                    fontWeight: "normal",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: faq.answer.startsWith("A:")
                      ? faq.answer
                      : `A${index + 1}: ${faq.answer}`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportFAQ;
