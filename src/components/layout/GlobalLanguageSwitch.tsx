"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useLanguageStore, useHomePageStore } from "@/store";
import { supportedLanguages } from "../../lib/utils";
import { Icon } from "@iconify/react";

import { getLocalizedPath } from "../../lib/utils";

// ... inside component ...

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
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${l.code === lang ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                }`}
              onClick={async () => {
                setShowDropdown(false);
                const targetLang = l.code;
                if (targetLang === lang) return;

                // Helper to get base URL
                const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
                if (!baseUrl) {
                  console.error('Base URL not found');
                  return;
                }

                // Identify if we are on a report page or category page
                const isReportDetail = pathname.match(/\/reports\/\d+/);
                const isReportsPage = pathname.includes('/reports');
                const searchParams = new URLSearchParams(window.location.search);
                const hasCategory = searchParams.has('category');

                let newPath = '';

                try {
                  const { currentIdentity } = useHomePageStore.getState();

                  if (isReportDetail && currentIdentity.report_reference_id) {
                    // Fetch new report ID
                    const formData = new FormData();
                    formData.append('report_reference_id', currentIdentity.report_reference_id);
                    formData.append('language_id', l.id); // Assuming l.id is available in supportedLanguages

                    const res = await fetch(`${baseUrl}reports_store`, {
                      method: 'POST',
                      body: formData
                    });

                    if (res.ok) {
                      const data = await res.json();
                      const report = data.data?.report;
                      if (report) {
                        // Construct proper slug
                        // Logic for Japanese(5), Chinese(6), Korean(7), Arabic(8)
                        const targetLangId = l.id;
                        const useReferenceTitle = ['5', '6', '7', '8'].includes(String(targetLangId));
                        // Access slugify (need import? No, simpler logic here or just title)
                        // Note: slugify is not imported in this file. 
                        // We can just use the ID if we want to be safe, or implement simple slugify.
                        // Let's rely on ID since extractIdFromSlug handles it, and we append ref_id.
                        // Ideally we import slugify or copy it. 
                        // To allow page.tsx to extracting ID correctly, format should be title-id or just id.

                        // Simple slugify replacement or just use ID if simple.
                        // But user wants SEO so title is good.
                        // Start with just ID to be safe or try to keep title.
                        const title = useReferenceTitle ? (report.report_reference_title || report.title) : report.title;

                        // Basic slugify: lowercase, replace spaces with dashes, remove special chars
                        const simpleSlug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                        const slug = `${simpleSlug}-${report.id}`;

                        newPath = getLocalizedPath(`/reports/${slug}`, targetLang);

                        // Append ref_id for server-side fetching
                        newPath += `?ref_id=${currentIdentity.report_reference_id}`;
                      }
                    }
                  } else if (isReportsPage && hasCategory && currentIdentity.category_reference_id) {
                    // Fetch new Category ID by checking the homepage data of the target language
                    // or using reports_store_page to resolve it
                    const homeRes = await fetch(`${baseUrl}homepage/${l.id}`);
                    if (homeRes.ok) {
                      const homeData = await homeRes.json();
                      const targetCategory = homeData.report_store_dropdown?.find(
                        (c: any) => String(c.category_reference_id) === String(currentIdentity.category_reference_id)
                      );

                      if (targetCategory) {
                        // Preserve other params like search if needed, but for now just category
                        newPath = getLocalizedPath(`/reports?category=${targetCategory.category_id}`, targetLang);
                      }
                    }
                  }
                } catch (error) {
                  console.error('Error resolving localized path:', error);
                }

                // If specialized logic failed or didn't apply, fall back to simple replacement
                if (!newPath) {
                  let currentPath = pathname;
                  // Remove existing locale prefix if present
                  for (const supported of supportedLanguages) {
                    const prefix = `/${supported.code}`;
                    if (currentPath === prefix || currentPath.startsWith(`${prefix}/`)) {
                      currentPath = currentPath.substring(prefix.length);
                      break;
                    }
                  }
                  if (!currentPath) currentPath = '/';

                  // Preserve query params for non-category/report switches
                  const queryString = window.location.search;
                  newPath = getLocalizedPath(currentPath, targetLang) + queryString;
                }

                router.push(newPath);
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
