"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useAboutPageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Link from "next/link";
import GlobalAboveFooter from "@/components/layout/GlobalAboveFooter";
import ArrowIcon from "@/components/common/ArrowIcon";
import CustomReportForm from "@/components/common/CustomReportForm";

// Utility function to split title and apply gradient to the last part
const formatTitle = (title: string) => {
  if (!title) return null;
  
  // Find the word "in" and split after it
  const words = title.split(' ');
  const inIndex = words.findIndex(word => word.toLowerCase() === 'in');
  
  if (inIndex !== -1 && inIndex < words.length - 1) {
    const beforeIn = words.slice(0, inIndex + 1).join(' ');
    const afterIn = words.slice(inIndex + 1).join(' ');
    
    return {
      beforeBreak: beforeIn,
      afterBreak: afterIn
    };
  }
  
  return {
    beforeBreak: title,
    afterBreak: ''
  };
};

// Utility function to split description and apply gradient to the last part
const formatDescription = (description: string) => {
  if (!description) return null;
  
  // Find the phrase "dedicated to" and split after it
  const dedicatedToIndex = description.toLowerCase().indexOf('dedicated to');
  
  if (dedicatedToIndex !== -1) {
    const beforeDedicated = description.substring(0, dedicatedToIndex + 'dedicated to'.length);
    const afterDedicated = description.substring(dedicatedToIndex + 'dedicated to'.length).trim();
    
    return {
      beforeBreak: beforeDedicated,
      afterBreak: afterDedicated
    };
  }
  
  return {
    beforeBreak: description,
    afterBreak: ''
  };
};

export default function About() {
  const { language } = useLanguageStore();
  const { AboutPage, setAboutPage } = useAboutPageStore();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language];
  const [isCustomReportFormOpen, setIsCustomReportFormOpen] = useState(false);

  useEffect(() => {
    setAboutPage(null);
  }, [language]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["aboutData", language],
    queryFn: () => fetch(`${baseUrl}aboutus/${id}`).then((res) => res.json()),
  });

  useEffect(() => {
    if (data) {
      setAboutPage(data.about_us);
    }
  }, [data]);

  if (isLoading === true || !AboutPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <section className="relative bg-black text-white">
        <Image
          src="/about.png"
          alt={AboutPage.title}
          fill
          className="bg-no-repeat object-cover"
        />
        <div className="relative m-auto flex h-[80vh] min-h-[500px] w-full max-w-[1440px] flex-col justify-end p-4 pb-10">
          <h1 className="mb-6 text-[32px] md:text-[64px]">
            {(() => {
              const titleParts = formatTitle(AboutPage.title);
              if (!titleParts) return AboutPage.title;
              
              return (
                <>
                  {titleParts.beforeBreak}
                  {titleParts.afterBreak && (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] bg-clip-text text-transparent">
                        {titleParts.afterBreak}
                      </span>
                    </>
                  )}
                </>
              );
            })()}
          </h1>
          <p className="font-sans" style={{ fontFamily: 'Noto Sans, sans-serif', fontSize: '20px', marginTop: '16px', marginBottom: '55px' }}>
            {(() => {
              const descriptionParts = formatDescription(AboutPage.description);
              if (!descriptionParts) return AboutPage.description;
              
              return (
                <>
                  {descriptionParts.beforeBreak}
                  {descriptionParts.afterBreak && (
                    <>
                      <br />
                      <span className="bg-white bg-clip-text text-transparent">
                        {descriptionParts.afterBreak}
                      </span>
                    </>
                  )}
                </>
              );
            })()}
          </p>
          <div className="flex w-full flex-wrap justify-between gap-10" style={{ marginBottom: '55px' }}>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${language}/reports`} className="inline-flex h-[105px] min-w-[300px] w-fit cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <ArrowIcon variant="gradient" />
                </span>
                <span>{AboutPage.first_button}</span>
              </Link>
              <button 
                onClick={() => setIsCustomReportFormOpen(true)}
                className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full"
              >
                <span className="flex w-full justify-end">
                  <ArrowIcon variant="white" />
                </span>
                <span>{AboutPage.second_button}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center bg-white p-3 py-10 text-black md:py-20">
        <h2 className="text-[32px] md:text-[64px]" style={{ marginBottom: '31px' }}>
          {AboutPage.section_ttile}
        </h2>
        <p className="w-full max-w-[900px] text-center text-[20px] text-[#0B0B0B]">
          {AboutPage.section_description}
        </p>
        <div className="custom_grid m-auto mt-10 flex w-full max-w-[1440px] flex-col gap-6 md:grid md:gap-4">
          {AboutPage.our_experties.map((card: any, idx: number) => (
            <div
              className={`div${idx + 1} min-h-[300px] bg-[#C8C8C8] p-4`}
              style={{
                backgroundImage: `url(${card.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              key={card.id}
            >
              <h3 className="text-[20px] font-bold mb-3" style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: '700' }}>{card.title}</h3>
              <p className="text-[16px]">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <GlobalAboveFooter />

      {/* Custom Report Form */}
      <CustomReportForm 
        isOpen={isCustomReportFormOpen} 
        onClose={() => setIsCustomReportFormOpen(false)} 
      />
    </>
  );
}
