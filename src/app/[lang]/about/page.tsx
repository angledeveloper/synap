"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useAboutPageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function About() {
  const { language } = useLanguageStore();
  const { AboutPage, setAboutPage } = useAboutPageStore();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language];

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
        <div className="relative m-auto flex h-[80vh] min-h-[500px] w-full max-w-[1700px] flex-col justify-end p-4 pb-10">
          <h1 className="mb-10 text-[32px] md:text-[64px]">
            {AboutPage.title}
          </h1>
          <p>{AboutPage.description}</p>
          <div className="mt-6 flex w-full flex-wrap justify-between gap-10">
            <div className="flex flex-wrap gap-4">
              <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#08D2B8] from-0% to-[#1160C9] to-100% p-4 text-[20px] hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <Icon icon="iconoir:fast-arrow-right" />
                </span>
                <span>{AboutPage.first_button}</span>
              </button>
              <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] border border-white bg-transparent p-4 text-[20px] hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <Icon icon="iconoir:fast-arrow-right" />
                </span>
                <span>{AboutPage.second_button}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full flex-col items-center bg-white p-3 py-10 text-black md:py-20">
        <h2 className="text-[32px] md:text-[64px]">
          {AboutPage.section_ttile}
        </h2>
        <p className="w-full max-w-[900px] text-center text-[20px] text-[#0B0B0B]">
          {AboutPage.section_description}
        </p>
        <div className="custom_grid m-auto mt-10 flex w-full max-w-[1700px] flex-col gap-6 md:grid md:gap-4">
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
              <h3 className="text-[20px] font-bold">{card.title}</h3>
              <p className="text-[16px]">{card.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
