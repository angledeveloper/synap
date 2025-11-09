"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useLanguageStore } from "@/store";
import { supportedLanguages } from "../../lib/utils";
import { Icon } from "@iconify/react";

export default function GlobalLanguageSwitch() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;

  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    if (lang) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  const currentLang = supportedLanguages.find((l) => l.code === lang) || supportedLanguages[0];
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownContainer = document.getElementById('language-dropdown-container');
      const languageButton = document.getElementById('language-button');
      if (dropdownContainer && 
          !dropdownContainer.contains(event.target as Node) &&
          !languageButton?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative">
      <div
        id="language-button"
        className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-gray-300 hover:text-white transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Icon icon="mdi:earth" className="text-lg" />
        <span className="text-sm font-normal">{currentLang.code.toUpperCase()}</span>
        <Icon icon="mdi:chevron-down" className={`text-sm transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </div>
      
      {showDropdown && (
        <div
          id="language-dropdown-container"
          className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-50"
        >
          {supportedLanguages.map((l) => (
            <button
              key={l.code}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                l.code === lang ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
              }`}
              onClick={() => {
          const segments = pathname.split("/");
                segments[1] = l.code;
          const newPath = segments.join("/");
          router.push(newPath);
                setShowDropdown(false);
              }}
          >
            {l.label}
            </button>
        ))}
        </div>
      )}
    </div>
  );
}
