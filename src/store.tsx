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

interface CartItem {
  id: string;
  title: string;
  price?: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
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

export const useCartStore = create<CartState>()(
  devtools((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
      // Check if item already exists
      const existingItem = state.items.find(i => i.id === item.id);
      if (existingItem) {
        return state; // Don't add duplicates
      }
      return { items: [...state.items, item] };
    }),
    removeItem: (id) => set((state) => ({
      items: state.items.filter(item => item.id !== id)
    })),
    clearCart: () => set({ items: [] }),
    getItemCount: () => get().items.length,
  })),
);
