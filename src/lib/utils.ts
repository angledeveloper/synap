import { clsx, type ClassValue } from "clsx";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const codeToId: Record<string, string> = {
  en: "1",  // English
  fr: "2",  // French
  es: "3",  // Spanish
  de: "4",  // German
  ja: "5",  // Japanese
  zh: "6",  // Chinese
  ko: "7",  // Korean
  ar: "8",  // Arabic
};

export const supportedLanguages = [
  { code: "en", label: "English", id: "1" },
  { code: "fr", label: "Français", id: "2" },
  { code: "es", label: "Español", id: "3" },
  { code: "de", label: "Deutsch", id: "4" },
  { code: "ja", label: "日本語", id: "5" },
  { code: "zh", label: "中文", id: "6" },
  { code: "ko", label: "한국어", id: "7" },
  { code: "ar", label: "العربية", id: "8" },
];

export const locale = supportedLanguages.map((l) => l.code);

export function slugify(title: string, id: number | string): string {
  if (!title) return `${id}`;

  // Convert to lowercase and remove special characters
  let slug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .trim();

  // Stop at "market" keyword if present
  const marketIndex = slug.indexOf('market');
  if (marketIndex !== -1) {
    // Include "market" in the slug
    slug = slug.substring(0, marketIndex + 6);
  }

  // Remove trailing hyphens
  slug = slug.replace(/-+$/, '');

  return `${slug}-${id}`;
}

export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
