"use client";

import React from "react";
import { useHomePageStore } from "@/store";
import { Icon } from "@iconify/react";

export default function GlobalAboveFooter() {
  const { HomePage } = useHomePageStore();

  return (
    <div className="w-full overflow-hidden bg-[#F5F5F5]">
      <div className="m-auto grid w-full max-w-[1700px] grid-cols-1 flex-col justify-center md:grid-cols-2">
        <div className="relative z-10 h-full w-full bg-gradient-to-r from-[#08D2B8] to-[#1160C9] p-3 md:from-transparent md:to-transparent md:p-16 md:before:absolute md:before:top-0 md:before:right-[0%] md:before:-z-10 md:before:h-full md:before:w-screen md:before:bg-gradient-to-l md:before:from-[#08D2B8] md:before:to-[#1160C9] md:before:to-60% md:before:content-['']">
          <h4 className="text-[32px] font-bold md:text-[64px]">
            {HomePage.common_layout_above_footer.title}
          </h4>
          <p className="text-[20px]">
            {HomePage.common_layout_above_footer.description}
          </p>
        </div>
        <div className="w-full bg-[#F5F5F5] p-3 text-black md:h-full md:p-16">
          <h5 className="text-[64px] font-bold">
            {HomePage.common_layout_above_footer.industries_count}+
          </h5>
          <button className="flex h-[105px] min-w-[300px] cursor-pointer flex-col items-start justify-between rounded-[10px] bg-gradient-to-r from-[#08D2B8] from-0% to-[#1160C9] to-100% p-4 text-[20px] hover:opacity-85 max-md:w-full">
            <span className="flex w-full justify-end">
              <Icon icon="iconoir:fast-arrow-right" />
            </span>
            <span>{HomePage.home_section1.first_button}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
