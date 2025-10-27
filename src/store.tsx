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

interface AboutPageState {
  AboutPage: any;
  setAboutPage: (AboutPage: any) => void;
}


export const useLanguageStore = create<LanguageState>()((set) => ({
  language: "en",
  setLanguage: (lang) => set({ language: lang }),
}));

export const useHomePageStore = create<HomePageState>()((set) => ({
  HomePage: null,
  setHomePage: (HomePage) => set({ HomePage }),
}));

export const useAboutPageStore = create<AboutPageState>()(
  devtools((set) => ({
    AboutPage: null,
    setAboutPage: (AboutPage) => set({ AboutPage }),
  })),
);

// Cart store removed
