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
  currentIdentity: {
    report_reference_id?: string;
    category_reference_id?: string;
  };
  setIdentity: (identity: { report_reference_id?: string; category_reference_id?: string }) => void;
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
  currentIdentity: {},
  setIdentity: (identity) => set((state) => ({ currentIdentity: { ...state.currentIdentity, ...identity } })),
}));

import { ReportDetailResponse } from "@/types/reports";

interface IdentityState {
  reportCache: Record<string, string>;
  reportDataCache: Record<string, ReportDetailResponse>;
  cacheIdentity: (id: string, refId: string) => void;
  cacheReportData: (id: string, data: ReportDetailResponse) => void;
}

import { persist, createJSONStorage } from "zustand/middleware";

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set) => ({
      reportCache: {},
      reportDataCache: {},
      cacheIdentity: (id, refId) => set((state) => ({
        reportCache: { ...state.reportCache, [id]: refId }
      })),
      cacheReportData: (id, data) => set((state) => ({
        reportDataCache: { ...state.reportDataCache, [id]: data }
      })),
    }),
    {
      name: 'synapse-identity-storage-v2',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          };
        }
        return localStorage;
      }),
      skipHydration: false,
    }
  )
);

export const useAboutPageStore = create<AboutPageState>()(
  devtools((set) => ({
    AboutPage: null,
    setAboutPage: (AboutPage) => set({ AboutPage }),
  })),
);

// Cart store removed
