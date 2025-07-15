"use client";
import React, { useEffect } from "react";
import { useHomePageStore } from "@/store";
import { Icon } from "@iconify/react";
import Link from "next/link";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";
import FullLogo from "./FullLogo";

export default function GlobalFooter() {
  const { HomePage } = useHomePageStore();

  if (!HomePage)
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
      className="w-full bg-[#010912] p-3 text-white"
    >
      <div className="m-auto flex w-full max-w-[1440px] flex-col gap-4 pt-10 md:flex-row">
        <div className="flex w-full flex-col justify-between gap-4 md:flex-row">
          <div className="w-full max-w-[500px]">
            <h6 className="mb-8 text-[32px] font-bold md:text-[48px]">
              {HomePage.footer.section.title}
            </h6>
            <p className="max-w-[400px] text-sm">
              {HomePage.footer.section.tagline}
            </p>
            <button className="mt-10 flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#08D2B8] from-0% to-[#1160C9] to-100% p-4 text-[20px] outline-white hover:opacity-85 hover:outline-2 max-md:w-full">
              <span className="flex w-full justify-end">
                <Icon icon="iconoir:fast-arrow-right" />
              </span>
              <span>{HomePage.footer.section.button}</span>
            </button>
          </div>
          <div className="flex w-full flex-col gap-6 md:w-fit">
            <div className="flex w-full flex-wrap gap-4 md:justify-end">
              <div className="min-w-[120px]">
                <span className="text-[20px] font-bold underline">
                  Solution
                </span>

                <ul className="mt-6 flex flex-col gap-2 text-[16px]">
                  {HomePage.footer.menu.Solution.map(
                    (link: any, index: number) => (
                      <li key={index}>
                        <Link href="/">{link.menu_name}</Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="min-w-[120px]">
                <span className="text-[20px] font-bold underline">
                  Resources
                </span>

                <ul className="mt-6 flex flex-col gap-2 text-[16px]">
                  {HomePage.footer.menu.Resources.map(
                    (link: any, index: number) => (
                      <li key={index}>
                        <Link href="/">{link.menu_name}</Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="min-w-[120px]">
                <span className="text-[20px] font-bold underline">Company</span>

                <ul className="mt-6 flex flex-col gap-2 text-[16px]">
                  {HomePage.footer.menu.Company.map(
                    (link: any, index: number) => (
                      <li key={index}>
                        <Link href="/">{link.menu_name}</Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="min-w-[120px]">
                <span className="text-[20px] font-bold underline">Legal</span>

                <ul className="mt-6 flex flex-col gap-2 text-[16px]">
                  {HomePage.footer.menu.Legal.map(
                    (link: any, index: number) => (
                      <li key={index}>
                        <Link href="/">{link.menu_name}</Link>
                      </li>
                    ),
                  )}
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
