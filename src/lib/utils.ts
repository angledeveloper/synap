import { clsx, type ClassValue } from "clsx";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const codeToId: Record<string, string> = {
  en: "1",
  de: "2",
  ja: "3",
  es: "4",
};

export const supportedLanguages = [
  { code: "en", label: "English", id: "1" },
  { code: "de", label: "German", id: "2" },
  { code: "ja", label: "Japanese", id: "3" },
  { code: "es", label: "Spanish", id: "4" },
  // Add more as needed
];

export const locale = supportedLanguages.map((l) => l.code);
