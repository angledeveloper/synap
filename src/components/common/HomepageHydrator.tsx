"use client";
import { useEffect } from "react";
import { useHomePageStore } from "@/store";

export default function HomepageHydrator({ homepageData }: { homepageData: any }) {
  useEffect(() => {
    if (homepageData) {
      useHomePageStore.getState().setHomePage(homepageData);
    }
  }, [homepageData]);
  return null;
}
