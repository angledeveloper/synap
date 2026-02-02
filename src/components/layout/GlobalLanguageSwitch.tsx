"use client";

import { useEffect, useState, useRef } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
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
        ref={buttonRef}
        className="flex h-[36px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-gray-300 hover:text-white transition-colors"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Icon icon="mdi:earth" className="text-lg" />
        <span className="text-sm font-normal">{currentLang.code.toUpperCase()}</span>
        <Icon icon="mdi:chevron-down" className={`text-sm transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-2 z-[60]"
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
                const isReportDetail = pathname.match(/\/reports\/[^/]+$/);
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
                        const stableId =
                          report.report_identity?.report_reference_id ||
                          report.report_reference_id ||
                          report.id;
                        const trimmedBackendSlug =
                          typeof report.slug === "string"
                            ? report.slug.trim()
                            : "";
                        const slug = trimmedBackendSlug
                          ? `${trimmedBackendSlug}-${stableId}`
                          : `${stableId}`;

                        newPath = getLocalizedPath(`/reports/${slug}`, targetLang);
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
