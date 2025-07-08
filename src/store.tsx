"use client";
import { Crete_Round } from "next/font/google";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LanguageState {
  language: string;
  setLanguage: (lang: string) => void;
}

interface HomePageState {
  HomePage: any;
  setHomePage: (HomePage: any) => void;
}

export const useLanguageStore = create<LanguageState>()(
  devtools((set) => ({
    language: "en",
    setLanguage: (lang) => set({ language: lang }),
  })),
);

export const useHomePageStore = create<HomePageState>()(
  devtools((set) => ({
    HomePage: null,
    setHomePage: (HomePage) => set({ HomePage }),
  })),
);
