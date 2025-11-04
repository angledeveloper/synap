"use client";

import Link from "next/link";

interface CaseStudy {
  title: string;
  challenge: string[];
  solutionHeading?: string;
  solution: string[];
  impactHeading?: string;
  impact: string[];
  href?: string;
}

function CaseStudyCard({
  title,
  challenge,
  solutionHeading = "Our Market Research & Data Solution:",
  solution,
  impactHeading = "Impact Delivered:",
  impact,
  href,
}: CaseStudy) {
  return (
    <div className="flex flex-col gap-4 max-md:px-3 max-md:py-16 md:px-4 md:py-12 md:pt-16">
      <h3 className="text-[28px] md:text-[32px] font-semibold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
        {title}
      </h3>

      <div className="text-[20px] font-light space-y-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <div>
          <span className="font-semibold">Challenge:</span>{" "}
          {challenge.map((line, idx) => (
            <span key={`challenge-${idx}`}>{line}{idx < challenge.length - 1 ? " " : ""}</span>
          ))}
        </div>

        <div>
          <span className="font-semibold">{solutionHeading}</span>{" "}
          {solution.map((line, idx) => (
            <span key={`solution-${idx}`}>{line}{idx < solution.length - 1 ? " " : ""}</span>
          ))}
        </div>

        <div>
          <span className="font-semibold">{impactHeading}</span>{" "}
          {impact.map((line, idx) => (
            <span key={`impact-${idx}`}>{line}{idx < impact.length - 1 ? " " : ""}</span>
          ))}
        </div>
      </div>

      {href ? (
        <Link href={href} className="underline text-[20px] font-medium w-fit">
          Read case study
        </Link>
      ) : (
        <span className="underline text-[20px] font-medium w-fit">Read case study</span>
      )}
    </div>
  );
}

export default function CaseStudiesSection() {
  const caseStudies: CaseStudy[] = [
    {
      title: "Technology Company: Optimizing Cloud Spend and Performance",
      challenge: [
        "A rapidly scaling B2B SaaS firm struggled with excessively high cloud costs and noticeable service slowdowns,",
        "indicating a misalignment between infrastructure spending and actual performance demands.",
      ],
      solution: [
        "We delivered a specialized report: \"Global Cloud Cost Efficiency & Infrastructure Benchmarking Report (2021-2032)\".",
        "This report included proprietary models and a \"Serverless Migration Feasibility Study\" that detailed high-impact optimization opportunities.",
      ],
      impact: [
        "Our report successfully diagnosed the underlying architectural inefficiencies causing cost overruns and latency.",
        "It provided internal technical teams with specific, data-backed guidance on resource allocation and database optimization.",
        "The insights enabled a clear investment roadmap for future scaling and global expansion.",
      ],
      href: "#",
    },
    {
      title: "Medical Device Manufacturing Company: Ensuring Global Regulatory Traceability",
      challenge: [
        "A global medical implant manufacturer faced a critical gap in proving complete product traceability (source to patient)",
        "to meet stringent, newly enacted international regulatory mandates (e.g., EU MDR).",
      ],
      solution: [
        "We provided a key report: \"EU MDR & FDA Compliance: Global Medical Device Traceability Data Set and Vendor Analysis Report\".",
        "This included a \"Compliance Technology Competitive Landscape\" study and essential data architecture blueprints.",
      ],
      impact: [
        "The report effectively diagnosed the regulatory vulnerabilities in the client's existing QA/SCM process.",
        "It defined the exact technology and data structure needed for total traceability and guided compliance teams.",
        "This market intelligence helped the board strategize confident expansion into tightly controlled markets.",
      ],
      href: "#",
    },
  ];

  return (
    <div className="relative z-10 flex w-full h-full flex-col text-white">
      {caseStudies.map((cs, idx) => (
        <div
          key={`cs-${idx}`}
          className={
            idx === 0
              ? "relative bg-[#06A591] w-full md:before:absolute md:before:top-0 md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#06A591] md:before:content-['']"
              : "relative bg-black w-full md:before:absolute md:before:top-0 md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#000] md:before:content-['']"
          }
        >
          <CaseStudyCard {...cs} />
        </div>
      ))}
    </div>
  );
}

