"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useHomePageStore } from "@/store";
import { Icon } from "@iconify/react";

export default function Home() {
  const { HomePage } = useHomePageStore();

  if (!HomePage)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );

  return (
    <>
      <section className="relative text-white">
        <Image
          src="/hero.jpg"
          alt={HomePage.home_section1.title}
          fill
          className="bg-no-repeat object-cover"
        />
        <div className="relative flex h-screen min-h-[500px] w-full flex-col items-center justify-end p-4">
          <h1 className="mb-10 text-[32px] md:text-[64px]">
            {HomePage.home_section1.title}
          </h1>
          <div className="flex w-full max-w-[1700px] flex-wrap justify-between gap-10 p-3">
            <div className="flex flex-wrap gap-4">
              <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#08D2B8] from-0% to-[#1160C9] to-100% p-4 text-[20px] hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <Icon icon="iconoir:fast-arrow-right" />
                </span>
                <span>{HomePage.home_section1.first_button}</span>
              </button>
              <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <Icon icon="iconoir:fast-arrow-right" />
                </span>
                <span>{HomePage.home_section1.second_button}</span>
              </button>
            </div>
            <p>{HomePage.home_section1.description}</p>
          </div>
        </div>
      </section>
      <section className="flex w-full justify-center bg-[#000910] p-3 py-20">
        <div className="flex w-full max-w-[1700px] items-center justify-center gap-10">
          {HomePage.home_section2.map((section: any, index: number) => (
            <div
              key={index}
              style={{
                backgroundColor: `${index === 1 ? "#0B7751" : index === 2 ? "#1895A3" : "#FFFFFF"}`,
                color: `${index === 1 ? "#FFFFFF" : index === 2 ? "#FFFFFF" : "#000000"}`,
              }}
              className={`flex w-full max-w-md flex-col items-center justify-center ${index === 1 ? "mt-0" : index === 3 ? "mt-0" : "mt-[200px]"}`}
            >
              <div className="mb-2 w-full p-4">
                <h2 className="text-[20px] font-bold">{section.title}</h2>
                <p className="text-[16px]">{section.description}</p>
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
    </>
  );
}
