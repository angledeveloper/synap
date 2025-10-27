
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useHomePageStore, useLanguageStore } from "@/store";
import { codeToId } from "@/lib/utils";
import { Icon } from "@iconify/react";
import GlobalAboveFooter from "@/components/layout/GlobalAboveFooter";
import Link from "next/link";
import ArrowIcon from "@/components/common/ArrowIcon";
import { useRouter } from "next/navigation";
import Head from "next/head";
import CustomReportForm from "@/components/common/CustomReportForm";

export default function Home() {
  const { HomePage } = useHomePageStore();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [testimonialsIndex, setTestimonialsIndex] = useState<number>(0);
  const [isCustomReportFormOpen, setIsCustomReportFormOpen] = useState(false);
  
  const getReportsHref = (label: string | undefined) => {
    if (!label) return "/";
    const l = label.trim().toLowerCase();
    return l.includes("explore") && l.includes("report") ? "/reports" : "/";
  };

  const handleReportClick = async (categoryId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
      if (!baseUrl) {
        console.error('NEXT_PUBLIC_DB_URL is not defined');
        return;
      }

      const languageId = codeToId[language as keyof typeof codeToId] || "1";
      
      const formData = new FormData();
      formData.append('category_id', categoryId);
      formData.append('language_id', languageId);
      formData.append('page', '1');
      formData.append('per_page', '10');

      const response = await fetch(`${baseUrl}reports_store_page`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Redirect to reports page with the category filter
        router.push(`/${language}/reports?category=${categoryId}`);
      } else {
        console.error('Failed to fetch reports:', response.status);
        // Fallback to general reports page
        router.push(`/${language}/reports`);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Fallback to general reports page
      router.push(`/${language}/reports`);
    }
  };

  useEffect(() => {
    if (!HomePage?.testimonials?.length) return;
    const interval = setInterval(() => {
      setTestimonialsIndex((prev) => (prev + 1) % HomePage.testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [HomePage]);

  if (!HomePage)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );

  return (
    <>
      <Head>
        <link rel="preload" href="/blackgrid.png" as="image" />
      </Head>
      <section className="relative bg-black text-white">
        <Image
          src="/hero.jpg"
          alt={HomePage.home_section1.title}
          fill
          className="bg-no-repeat object-cover"
        />
        <div className="relative flex h-screen min-h-[500px] w-full flex-col items-center justify-end p-4">
          <h1 className="mb-20 max-w-[900px] text-center text-[32px] uppercase md:text-[64px]">
            {HomePage.home_section1.title}
          </h1>
          <div className="flex w-full max-w-[1440px] flex-col justify-between gap-10 p-3 md:flex-row">
            <div className="flex w-full flex-col flex-wrap gap-4 md:flex-row">
              <Link href={getReportsHref(HomePage.home_section1.first_button) || "/reports"}>
                <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full">
                  <span className="flex w-full justify-end">
                    <ArrowIcon variant="gradient" />
                  </span>
                  <span>{HomePage.home_section1.first_button}</span>
                </button>
              </Link>
              <button 
                onClick={() => setIsCustomReportFormOpen(true)}
                className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full"
              >
                <span className="flex w-full justify-end">
                  <ArrowIcon variant="white" />
                </span>
                <span>{HomePage.home_section1.second_button}</span>
              </button>
            </div>
            <div className="w-full text-[20px] text-left">
              {HomePage.home_section1.description?.split('\n').map((line: string, index: number) => (
                <div key={index} className="mb-2">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="flex w-full justify-center bg-[#000] p-3 py-20">
        <div className="flex w-full max-w-[1440px] flex-col items-center justify-center gap-10 md:flex-row">
          {HomePage.home_section2.map((section: any, index: number) => (
            <div
              key={index}
              style={{
                backgroundColor: `${index === 1 ? "#0B7751" : index === 2 ? "#1895A3" : "#FFFFFF"}`,
                color: `${index === 1 ? "#FFFFFF" : index === 2 ? "#FFFFFF" : "#000000"}`,
              }}
              className={`flex w-full max-w-md flex-col items-center justify-center ${index === 1 ? "md:mt-0" : index === 3 ? "md:mt-0" : "md:mt-[200px]"}`}
            >
              <div className="mb-2 w-full p-4">
                <span className="text-[20px] font-bold">{section.title}</span>
                <p className="mt-2 text-[16px]">{section.description}</p>
              </div>

              <div className="aspect-square w-full">
                <Image
                  className="h-full w-full object-cover"
                  src={section.image}
                  alt={section.title}
                  width={1000}
                  height={1000}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        className="w-full bg-gradient-to-b from-[#000910] to-[#000] bg-cover bg-center py-20 md:min-h-[650px] md:pt-40 md:pb-40 relative"
        style={{
          backgroundImage: `url('/blackgrid.png')`,
          backgroundPosition: "bottom",
          backgroundSize: "fit",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "local",
        }}
      >
        <div className="m-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 p-3 md:flex-row">
          <div className="text-[32px] font-medium max-md:text-center md:text-[40px]">
            {HomePage.home_section3.tagline}
          </div>
          <Link href={getReportsHref(HomePage.home_section3.button) || "/reports"}>
            <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-black/5 p-4 text-[20px] font-bold backdrop-blur-[5px] transition-all duration-300 hover:border-white/40 hover:text-neutral-400 max-md:w-full">
              <span className="flex w-full justify-end">
                <ArrowIcon variant="white" />
              </span>
              <span>{HomePage.home_section3.button}</span>
            </button>
          </Link>
        </div>
      </section>
      <GlobalAboveFooter />
      <section className="w-full bg-white text-black">
        <div className="m-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 p-3 py-10 md:grid-cols-3 md:gap-10 md:py-20">
          {HomePage.home_section4_reports?.map((item: any, index: number) => (
            <div
              key={index}
              onClick={() => handleReportClick(item.category_id || item.id || '1')}
              className="group relative h-full w-full bg-[#F2F1EF] hover:bg-[#2F2F2F] cursor-pointer"
            >
              <img
                src="/barrow.svg"
                alt="Arrow"
                className="absolute top-4 right-4"
                style={{ width: '33px', height: '14px' }}
              />
              <Image
                src={item.image}
                alt={item.title}
                width={1000}
                height={1000}
                className="aspect-video w-full bg-neutral-200 object-cover"
              />
              <div className="flex flex-col gap-2 p-4 group-hover:bg-[#2F2F2F]">
                <div className="block from-[#1160C9] to-[#08D2B8] font-mono text-[20px] leading-snug font-bold transition-all duration-200 group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent">
                  {item.title}
                </div>
                <p className="text-[16px] group-hover:text-[#F2F1EF] line-clamp-3 multilingual-text">
                  {item.introduction_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="w-full overflow-hidden bg-[#F5F5F5]">
        <div className="relative m-auto grid w-full max-w-[1440px] grid-cols-1 justify-center justify-items-end bg-white text-black md:grid-cols-2">
          <div className="flex w-full flex-col bg-[#F5F5F5] p-3 pt-10 md:p-16 md:pt-16" style={{ marginLeft: '284px' }}>
            <h4 className="text-[32px] font-bold md:text-[64px]" style={{ marginBottom: '136px' }}>
              {HomePage.home_section5.title}
            </h4>
            <div className="relative min-h-[500px] w-full max-w-2xl testimonials-container">
  {HomePage.testimonials.map((testimonial: any, index: number) => (
    <div
      key={index}
      className={`absolute inset-0 transition-opacity duration-500 ${testimonialsIndex === index ? "z-10 opacity-100" : "z-0 opacity-0"}`}
      style={{
        pointerEvents:
          testimonialsIndex === index ? "auto" : "none",
      }}
    >
      <div className="mb-12 text-[22px] md:text-[36px] font-mono bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] bg-clip-text text-transparent multilingual-testimonial">
        "{testimonial.feedback}"
      </div>
      <div className="mb-4 text-[28px] font-semibold text-black multilingual-name">
        {testimonial.name}
      </div>
      <div className="text-[20px] text-[#888] multilingual-title">
        {testimonial.title}
      </div>
    </div>
  ))}
</div>
            <div className="flex w-full max-w-md items-center justify-center gap-4 mt-8">
              <div
                onClick={() => {
                  setTestimonialsIndex((prev) =>
                    prev === 0 ? HomePage.testimonials.length - 1 : prev - 1,
                  );
                }}
                className="flex cursor-pointer flex-col items-center justify-center text-2xl"
              >
                <Icon icon="iconoir:arrow-left" />
              </div>
              <div
                style={{
                  gridTemplateColumns: `repeat(${HomePage.testimonials.length}, 1fr)`,
                }}
                className="grid h-[5px] w-full"
              >
                {HomePage.testimonials.map(
                  (testimonial: any, index: number) => (
                    <div
                      key={index}
                      className="h-[5px] w-full bg-[#a0a0a0]"
                      style={{
                        backgroundColor: `${testimonialsIndex === index ? "#000" : "#a0a0a0"}`,
                      }}
                    ></div>
                  ),
                )}
              </div>
              <div
                onClick={() => {
                  setTestimonialsIndex((prev) =>
                    prev === HomePage.testimonials.length - 1 ? 0 : prev + 1,
                  );
                }}
                className="flex cursor-pointer flex-col items-center justify-center text-2xl"
              >
                <Icon icon="iconoir:arrow-right" />
              </div>
            </div>
          </div>
          <div className="relative z-10 flex w-full flex-col bg-black text-white">
            <div className="md; flex flex-col gap-4 bg-[#06A591] pt-10 max-md:px-3 max-md:py-12 md:p-16 md:pt-16 md:before:absolute md:before:top-0 md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#06A591] md:before:content-['']">
              <span className="text-[32px]">
                {HomePage.home_section5.first_box_title}
              </span>
              <span className="text-[20px] font-light">
                {HomePage.home_section5.first_box_description}
              </span>
              <Link
                className="mt-12 text-[20px] font-medium underline"
                href="/"
              >
                {HomePage.home_section5.first_box_link}
              </Link>
            </div>
            <div className="relative flex flex-col gap-4 max-md:px-3 max-md:py-12 md:p-16 md:pt-16 md:before:absolute md:before:top-[0%] md:before:left-[90%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-[#000] md:before:content-['']">
              <span className="text-[32px]">
                {HomePage.home_section5.second_box_title}
              </span>
              <span className="text-[20px] font-light">
                {HomePage.home_section5.second_box_description}
              </span>
              <Link className="text-[20px] font-medium underline" href="/">
                {HomePage.home_section5.second_box_link}
              </Link>
              <Link className="mt-12" href="/reports">
                <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] font-bold hover:opacity-85 max-md:w-full">
                  <span className="flex w-full justify-end">
                    <ArrowIcon variant="white" />
                  </span>
                  <span> {HomePage.home_section5.button}</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Report Form */}
      <CustomReportForm 
        isOpen={isCustomReportFormOpen} 
        onClose={() => setIsCustomReportFormOpen(false)} 
      />
    </>
  );
}