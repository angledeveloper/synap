"use client";
import React, { useEffect } from "react";
import { useHomePageStore, useLanguageStore } from "@/store";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ArrowIcon from "@/components/common/ArrowIcon";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";
import FullLogo from "./FullLogo";

export default function GlobalFooter() {
  const { HomePage } = useHomePageStore();
  const { language } = useLanguageStore();

  if (!HomePage || !HomePage.footer || !HomePage.footer.menu || !HomePage.footer.section)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );

  return (
    <footer
      style={{
        backgroundImage: "url(/gridbox.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "150px",
      }}
      className="w-full bg-[#010912] px-3 pb-3 text-white"
    >
      <div className="m-auto flex w-full max-w-[1440px] flex-col gap-4 pt-18 md:flex-row">
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
          <div className="w-full max-w-[500px]">
            <h6 className="mb-8 text-[32px] font-bold md:text-[48px]">
              {HomePage.footer.section?.title || ""}
            </h6>
            <p className="max-w-[425px] text-[20px]"> 
              {HomePage.footer.section?.tagline || ""}
            </p>
            <Link href={`/${language}/reports`}>
              <button className="mt-10 flex h-[105px] w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-4 text-[20px] font-bold border border-white hover:opacity-85 max-md:w-full">
                <span className="flex w-full justify-end">
                  <ArrowIcon variant="white" />
                </span>
                <span>{HomePage.footer.section?.button ?? ''}</span>
              </button>
            </Link>
          </div>
          <div className="flex w-full flex-col gap-8 md:w-fit">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 w-full">

  <div>
    <span className="text-[20px] underline">{HomePage.footer.section?.solutions ?? ''}</span>
    <ul className="mt-6 flex flex-col gap-2 text-[16px]">
      {HomePage.footer.menu.Solution?.map((link: any, index: number) => (
        <li key={index}><Link href={`/${language}`}>{link.menu_name}</Link></li>
      ))}
    </ul>
  </div>

  <div>
    <span className="text-[20px] underline">{HomePage.footer.section?.resources ?? ''}</span>
    <ul className="mt-6 flex flex-col gap-2 text-[16px]">
      {HomePage.footer.menu.Resources?.map((link: any, index: number) => (
        <li key={index}><Link href={`/${language}`}>{link.menu_name}</Link></li>
      ))}
    </ul>
  </div>

  <div>
    <span className="text-[20px] underline">{HomePage.footer.section?.company ?? ''}</span>
    <ul className="mt-6 flex flex-col gap-2 text-[16px]">
      {HomePage.footer.menu.Company?.map((link: any, index: number) => {
        const isPrivacy = (link.menu_name || "").toLowerCase().includes('privacy');
        return (
          <li key={index}>
            <Link href={isPrivacy ? `/${language}/privacy` : `/${language}`}>{link.menu_name}</Link>
          </li>
        );
      })}
    </ul>
  </div>

  <div>
    <span className="text-[20px] underline">{HomePage.footer.section?.legal ?? ''}</span>
    <ul className="mt-6 flex flex-col gap-2 text-[16px]">
      {HomePage.footer.menu.Legal?.map((link: any, index: number) => {
        const isPrivacy = (link.menu_name || "").toLowerCase().includes('privacy');
        return (
          <li key={index}>
            <Link href={isPrivacy ? `/${language}/privacy` : `/${language}`}>{link.menu_name}</Link>
          </li>
        );
      })}
    </ul>
  </div>

</div>


            <GlobalLanguageSwitch />
          </div>
        </div>
      </div>
      <div className="m-auto my-10 w-full max-w-[1440px] text-[20px] text-[#808080]">
        {HomePage.footer.section.description}
      </div>
      <div className="m-auto my-10 w-full max-w-[1440px] text-[20px]">
        <div className="aspect-[990/157.59] max-h-[160px] w-full">
          <FullLogo />
        </div>
      </div>
      <div className="m-auto my-10 flex w-full max-w-[1440px] flex-col gap-4 text-[20px] text-[#808080] md:flex-row md:justify-between">
        <p className="w-full">{HomePage.footer.section.copyright_text}</p>
        <span className="w-[200px] text-sm">
          {HomePage.footer.section.credit_text}
        </span>
      </div>
    </footer>
  );
}
