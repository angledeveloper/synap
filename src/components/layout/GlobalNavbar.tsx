"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId, getLocalizedPath } from "@/lib/utils";
import { fetchReportBackendSlugByReferenceId } from "@/lib/reportUtils";

interface CategoryItem {
  category_id: string | number;
  category_name: string;
  icon: string;
  category_tagline?: string;
  id?: string | number;
  originalIndex?: number; // Add originalIndex as an optional property
}
import Image from "next/image";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";
import FullLogo from "./FullLogo";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeepSearch } from "@/hooks/useDeepSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavbarData } from "@/hooks/useNavbarData";

export default function GlobalNavbar() {
  const { language } = useLanguageStore();
  const { HomePage, setHomePage } = useHomePageStore();

  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language as keyof typeof codeToId] || codeToId["en"];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCaseStudiesDropdown, setShowCaseStudiesDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  // cart/login removed
  const [searchValue, setSearchValue] = useState("");
  const [isHoveringSearch, setIsHoveringSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounce search value for API calls
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Deep search hook - always enabled when there's a search value
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useDeepSearch(
    debouncedSearchValue,
    debouncedSearchValue.trim().length > 0,
  );

  // Get navbar-specific data
  // const { data: navbarData } = useNavbarData({ language }); // Removed

  const { data, isLoading, error } = useQuery({
    queryKey: ["navbarData", language],
    queryFn: () => fetch(`${baseUrl}homepage/${id}`).then((res) => res.json()),
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const [showLoading, setShowLoading] = useState(true);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLoading || error) {
      // Stop loading if data is loaded OR if there's an error
      timer = setTimeout(() => setShowLoading(false), 200);
    } else {
      setShowLoading(true);
    }
    return () => clearTimeout(timer);
  }, [isLoading, error]);

  useEffect(() => {
    function fetchData() {
      if (data) {
        setHomePage(data);
      }
    }
    fetchData();
  }, [data, setHomePage]);

  // Handle search visibility based on hover and content
  useEffect(() => {
    // Keep search expanded if there's text or user is hovering
    const shouldShowSearch = isHoveringSearch || searchValue.length > 0;

    if (shouldShowSearch) {
      setShowSearch(true);
    } else {
      // Collapse if no text and not hovering (even if focused)
      setShowSearch(false);
      setShowSearchResults(false);
    }

    // Only show search results when there's actual content
    if (searchValue.length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [isHoveringSearch, searchValue]);

  // Show search results when we have data
  useEffect(() => {
    if (
      searchResults &&
      (searchResults as any).results &&
      (searchResults as any).results.length > 0
    ) {
      setShowSearchResults(true);
      setShowSearch(true); // Keep search expanded when results are shown
    }
  }, [searchResults]);

  // Handle clicking outside search to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        // Close search if no content and not hovering
        if (searchValue === "" && !isHoveringSearch) {
          setShowSearch(false);
          setShowSearchResults(false);
        }
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch, searchValue, isHoveringSearch]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      const dropdownContainer = document.getElementById("dropdown-container");
      const mobileDropdownContainer = document.getElementById(
        "mobile-dropdown-container",
      );
      const dropdownButton = document.getElementById("dropdown-button");
      const mobileDropdownButton = document.getElementById(
        "mobile-dropdown-button",
      );

      const caseStudiesDropdownContainer = document.getElementById(
        "case-studies-dropdown-container",
      );
      const mobileCaseStudiesDropdownContainer = document.getElementById(
        "mobile-case-studies-dropdown-container",
      );
      const caseStudiesDropdownButton = document.getElementById(
        "case-studies-dropdown-button",
      );
      const mobileCaseStudiesDropdownButton = document.getElementById(
        "mobile-case-studies-dropdown-button",
      );

      // Check if click is outside BOTH desktop and mobile dropdown containers
      const isOutsideDropdown =
        (!dropdownContainer ||
          !dropdownContainer.contains(event.target as Node)) &&
        (!mobileDropdownContainer ||
          !mobileDropdownContainer.contains(event.target as Node)) &&
        !dropdownButton?.contains(event.target as Node) &&
        !mobileDropdownButton?.contains(event.target as Node);

      if (isOutsideDropdown) {
        setShowDropdown(false);
      }

      // Check if click is outside BOTH desktop and mobile case studies containers
      const isOutsideCaseStudies =
        (!caseStudiesDropdownContainer ||
          !caseStudiesDropdownContainer.contains(event.target as Node)) &&
        (!mobileCaseStudiesDropdownContainer ||
          !mobileCaseStudiesDropdownContainer.contains(event.target as Node)) &&
        !caseStudiesDropdownButton?.contains(event.target as Node) &&
        !mobileCaseStudiesDropdownButton?.contains(event.target as Node);

      if (isOutsideCaseStudies) {
        setShowCaseStudiesDropdown(false);
      }
    };

    if (showDropdown || showCaseStudiesDropdown) {
      document.addEventListener("mousedown", handleDropdownClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleDropdownClickOutside);
      };
    }
  }, [showDropdown, showCaseStudiesDropdown]);

  if (isLoading === true || showLoading) {
    return (
      <div className="fixed top-0 left-0 z-50 flex h-full w-full flex-col items-center justify-center bg-white text-black">
        <Image
          src="/loginbackground.jpg"
          className="z-0 object-cover"
          alt="SynapSea"
          fill
        />
        <div className="relative z-10 flex aspect-[4/5] min-w-md flex-col items-center justify-center bg-white/80 p-10 backdrop-blur-xs">
          <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
          <h1 className="mt-12 text-4xl font-bold">SynapSea</h1>
          <div className="font-regular mt-4 text-xl text-neutral-500">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!HomePage) return null; // or loading state if HomePage isn't ready yet

  const resolveReportSearchPath = async (result: any, queryParam: string) => {
    const stableId = result.report_reference_id || result.id;
    const trimmedBackendSlug =
      typeof result.slug === "string" ? result.slug.trim() : "";

    if (trimmedBackendSlug && stableId) {
      return getLocalizedPath(
        `/reports/${trimmedBackendSlug}-${stableId}${queryParam}`,
        language,
      );
    }

    if (stableId) {
      const backendSlug = await fetchReportBackendSlugByReferenceId(
        stableId,
        id,
      );
      if (backendSlug) {
        return getLocalizedPath(
          `/reports/${backendSlug}-${stableId}${queryParam}`,
          language,
        );
      }
      return getLocalizedPath(`/reports/${stableId}${queryParam}`, language);
    }

    return getLocalizedPath(`/reports${queryParam}`, language);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full">
      <div className="relative flex h-20 w-full items-center justify-between bg-[#060606]/90 lg:justify-center">
        {/* Centered Container with 284px margins */}
        <div className="hidden w-full items-center justify-between px-4 lg:flex xl:px-8 2xl:px-[284px]">
          {/* Logo */}
          <Link
            href={getLocalizedPath("/", language)}
            className="flex-shrink-0"
          >
            <div className="h-[30px] w-auto md:mr-10">
              <FullLogo />
            </div>
          </Link>
          {/* Right Side - Navigation Links, Search, Language, Contact */}
          <div className="flex items-center gap-8 text-sm">
            {/* About Us */}
            <Link
              href={getLocalizedPath("/about", language)}
              className="font-normal whitespace-nowrap text-gray-300 transition-colors hover:text-white"
            >
              {HomePage.navbar?.item_one_name ?? "About Us"}
            </Link>
            {/* Case Studies Dropdown */}
            <div
              id="case-studies-dropdown-button"
              className="flex cursor-pointer items-center gap-1 font-normal whitespace-nowrap text-gray-300 transition-colors hover:text-white"
              onClick={() =>
                setShowCaseStudiesDropdown(!showCaseStudiesDropdown)
              }
            >
              <span
                className={`transition-all ${showCaseStudiesDropdown ? "font-medium text-white" : "font-normal"}`}
              >
                {HomePage.navbar?.casestudy ?? "Case Studies"}
              </span>
              <Icon
                icon="mdi:chevron-down"
                className={`transition-transform duration-200 ${showCaseStudiesDropdown ? "rotate-180" : ""}`}
              />
            </div>
            {showCaseStudiesDropdown && (
              <div
                id="case-studies-dropdown-container"
                className="absolute z-50 h-auto max-h-[80vh] w-full max-w-[1440px] overflow-y-auto bg-white px-4 py-6 shadow-sm sm:px-6 lg:top-[80px] lg:left-1/2 lg:-translate-x-1/2 lg:px-8 lg:py-8"
              >
                <h2
                  className="mb-8 text-left text-xl font-medium text-gray-900"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {HomePage.navbar?.casestudy ?? "Case Studies"}
                </h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-2">
                  {HomePage.case_studies?.map((caseStudy: any) => (
                    <Link
                      href={caseStudy.file_url || "#"}
                      target={caseStudy.file_url ? "_blank" : undefined}
                      key={caseStudy.id}
                      className="group"
                    >
                      <div className="rounded-lg p-3 transition-colors hover:bg-gray-50">
                        <h3
                          className="text-[14px] leading-snug font-normal text-gray-900 transition-colors group-hover:text-blue-600"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {caseStudy.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Reports Store Dropdown */}

            <div
              id="dropdown-button"
              className="flex cursor-pointer items-center gap-1 font-normal whitespace-nowrap text-gray-300 transition-colors hover:text-white"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span
                className={`transition-all ${showDropdown ? "font-medium text-white" : "font-normal"}`}
              >
                {HomePage.navbar?.item_two ?? "Reports Store"}
              </span>
              <Icon
                icon="mdi:chevron-down"
                className={`transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
              />
              {showDropdown && (
                <div
                  id="dropdown-container"
                  className="absolute z-50 w-fit max-w-[1440px] bg-white px-8 py-10 shadow-sm lg:top-[80px] lg:left-1/2 lg:-translate-x-1/2"
                >
                  <h2
                    className="mb-10 text-left text-xl font-medium text-gray-900"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {HomePage?.report_store_dropdown?.[0]?.title ?? ""}
                  </h2>

                  {/* Optimized Layout: Vertical Columns (4 items per column) */}
                  <div className="flex flex-col gap-y-6 lg:w-fit lg:flex-row lg:gap-x-12">
                    {/* Helper to chunk array into columns of 4 */}
                    {Array.from({
                      length: Math.ceil(
                        (HomePage?.report_store_dropdown?.length || 0) / 4,
                      ),
                    }).map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="flex flex-col gap-y-6 whitespace-nowrap"
                      >
                        {HomePage.report_store_dropdown
                          .slice(colIndex * 4, (colIndex + 1) * 4)
                          .map((item: CategoryItem) => (
                            <Link
                              href={getLocalizedPath(
                                `${"reports"}${item.category_name === "All Industries" ? "" : `?category=${item.category_id}`}`,
                                language,
                              )}
                              key={item.category_id}
                              className="group flex-shrink-0"
                            >
                              <div className="flex items-start space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                                <div className="relative mt-0.5 h-6 w-6 flex-shrink-0">
                                  <Image
                                    src={item.icon}
                                    alt={item.category_name}
                                    width={24}
                                    height={24}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <div>
                                  <h3
                                    className="text-[15px] leading-snug font-medium whitespace-nowrap text-gray-900 transition-colors group-hover:text-blue-600"
                                    style={{
                                      fontFamily: "var(--font-space-grotesk)",
                                    }}
                                  >
                                    {item.category_name}
                                  </h3>
                                  {/* Tagline removed or hidden if needed to save space, but kept for now */}
                                  {item.category_tagline && (
                                    <p
                                      className="mt-1 max-w-[200px] text-[13px] font-normal whitespace-normal text-black"
                                      style={{
                                        fontFamily: "var(--font-space-grotesk)",
                                      }}
                                    >
                                      {item.category_tagline
                                        .split(" ")
                                        .slice(0, 3)
                                        .join(" ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div id="search-container" className="relative flex items-center">
              <div className="flex w-48 items-center rounded-lg border border-gray-400 px-3 py-2 md:w-56">
                <Icon
                  icon="mdi:magnify"
                  className="mr-2 flex-shrink-0 text-lg text-gray-300"
                />
                <input
                  id="search-input"
                  type="search"
                  placeholder={HomePage?.navbar?.searchPlaceholder || "Search"}
                  className="w-full bg-transparent text-sm text-gray-300 placeholder:text-gray-400 focus:outline-none"
                  value={searchValue}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSearchValue(newValue);
                    if (newValue === "") {
                      setShowSearchResults(false);
                    }
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                {searchValue && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchValue("");
                      setShowSearchResults(false);
                      // Collapse after clearing if not hovering
                      if (!isHoveringSearch) {
                        setShowSearch(false);
                      }
                    }}
                    className="ml-2 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-300"
                  >
                    <Icon icon="mdi:close" className="text-sm" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div
                  className="absolute top-full right-0 z-50 mt-2 max-h-96 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                  onMouseEnter={() => setIsHoveringSearch(true)}
                  onMouseLeave={() => {
                    // Keep search expanded if there's text
                    if (searchValue === "") {
                      setIsHoveringSearch(false);
                      setShowSearch(false);
                    }
                  }}
                >
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-red-500">
                      <p className="text-sm">
                        Error searching. Please try again.
                      </p>
                    </div>
                  ) : searchResults &&
                    (searchResults as any).results &&
                    (searchResults as any).results.length > 0 ? (
                    <div className="py-2">
                      <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                        {(searchResults as any).total ||
                          (searchResults as any).results.length}{" "}
                        {HomePage?.navbar?.searchResultsCount || "result"}
                        {((searchResults as any).total ||
                          (searchResults as any).results.length) !== 1
                          ? "s"
                          : ""}{" "}
                        found
                      </div>
                      {(searchResults as any).results
                        .slice(0, 5)
                        .map((result: any, index: number) => (
                          <div
                            key={`search-result-${index}`}
                            className="block cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50"
                            onClick={async () => {
                              setSearchValue("");
                              setShowSearchResults(false);
                              setIsHoveringSearch(false);
                              setShowSearch(false);

                              let targetUrl = getLocalizedPath("", language);
                              const queryParam = `?highlight=${encodeURIComponent(debouncedSearchValue)}`;

                              switch (result.type) {
                                case "home":
                                  targetUrl = getLocalizedPath(
                                    queryParam,
                                    language,
                                  );
                                  break;
                                case "about":
                                  targetUrl = getLocalizedPath(
                                    `/about${queryParam}`,
                                    language,
                                  );
                                  break;
                                case "report":
                                  targetUrl = await resolveReportSearchPath(
                                    result,
                                    queryParam,
                                  );
                                  break;
                                case "legal":
                                  const page =
                                    result.page_name === "terms"
                                      ? "terms-of-service"
                                      : "privacy";
                                  targetUrl = getLocalizedPath(
                                    `/${page}${queryParam}`,
                                    language,
                                  );
                                  break;
                                default:
                                  // Fallback to reports if type is missing (legacy)
                                  targetUrl = await resolveReportSearchPath(
                                    result,
                                    queryParam,
                                  );
                              }

                              window.location.href = targetUrl;
                            }}
                            onMouseDown={(e) => {
                              // Prevent output blur when clicking results
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="line-clamp-2 text-sm font-medium text-gray-900">
                                  {result.title}
                                </h4>
                                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                                  {result.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {(searchResults as any).results.length > 5 && (
                        <div className="border-t border-gray-100 px-4 py-2">
                          <div
                            className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setSearchValue("");
                              setShowSearchResults(false);
                              setIsHoveringSearch(false);
                              setShowSearch(false);
                              window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            View all {(searchResults as any).results.length}{" "}
                            results
                          </div>
                        </div>
                      )}
                    </div>
                  ) : debouncedSearchValue.trim().length > 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">
                        {HomePage?.navbar?.searchNoResults ||
                          "No results found"}{" "}
                        for "{debouncedSearchValue}"
                      </p>
                      <div
                        className="mt-2 inline-block cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          setSearchValue("");
                          setShowSearchResults(false);
                          setIsHoveringSearch(false);
                          setShowSearch(false);
                          window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        Search in reports
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Language Switch */}
            <GlobalLanguageSwitch />

            {/* Contact Us Button */}
            <Link
              href={getLocalizedPath("/contact", language)}
              className="flex-shrink-0"
            >
              <Button className="rounded-[7px] bg-gradient-to-r from-[#1160C9] to-[#08D2B8] px-6 py-2 font-normal whitespace-nowrap text-white transition-opacity hover:opacity-90">
                {HomePage?.navbar?.button_text ?? "Contact Us"}
              </Button>
            </Link>
          </div>
        </div>
        {/* MOBILE NAVBAR */}
        <div className="flex h-[80px] w-full items-center justify-between bg-[#060606]/90 px-4 lg:hidden">
          {/* Logo left */}
          <Link
            href={getLocalizedPath("/", language)}
            className="flex items-center"
          >
            <div className="h-[28px] w-auto">
              <FullLogo />
            </div>
          </Link>

          {/* Language Switch */}
          <div className="flex items-center">
            <GlobalLanguageSwitch />
          </div>

          {/* Hamburger */}
          <Icon
            icon={showMenu ? "mdi:close" : "mdi:menu"}
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer text-3xl text-gray-300 transition-colors hover:text-white"
          />
        </div>

        {/* MOBILE MENU CONTENT */}
        {showMenu && (
          <div className="absolute top-[80px] left-0 z-50 max-h-[70vh] w-full overflow-y-scroll bg-[#060606]/90 p-4">
            <div className="flex flex-col gap-4 text-lg text-gray-300">
              <div className="flex w-full flex-wrap gap-4">
                <div className="relative w-full">
                  <div className="flex items-center rounded-lg border border-gray-400 px-3 py-2">
                    <Icon
                      icon="mdi:magnify"
                      className="mr-2 flex-shrink-0 text-gray-300"
                    />
                    <input
                      type="search"
                      placeholder={
                        HomePage?.navbar?.searchPlaceholder || "Search"
                      }
                      className="h-[36px] w-full bg-transparent text-sm text-gray-300 placeholder:text-gray-400 focus:outline-none"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    {searchValue && (
                      <button
                        onClick={() => setSearchValue("")}
                        className="ml-2 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-300"
                      >
                        <Icon icon="mdi:close" className="text-sm" />
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {showSearchResults && (
                    <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {/* unchanged */}
                      {isSearchLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                          <p className="mt-2 text-sm">Searching...</p>
                        </div>
                      ) : searchError ? (
                        <div className="p-4 text-center text-red-500">
                          <p className="text-sm">
                            Error searching. Please try again.
                          </p>
                        </div>
                      ) : searchResults &&
                        (searchResults as any).results &&
                        (searchResults as any).results.length > 0 ? (
                        <div className="py-2">
                          <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
                            {(searchResults as any).total ||
                              (searchResults as any).results.length}{" "}
                            {HomePage?.navbar?.searchResultsCount || "result"}
                            {((searchResults as any).total ||
                              (searchResults as any).results.length) !== 1
                              ? "s"
                              : ""}{" "}
                            found
                          </div>
                          {(searchResults as any).results
                            .slice(0, 3)
                            .map((result: any, index: number) => (
                              <div
                                key={`mobile-search-result-${index}`}
                                className="block cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-gray-50"
                                onClick={async () => {
                                  setSearchValue("");
                                  setShowSearchResults(false);
                                  setShowMenu(false);

                                  let targetUrl = getLocalizedPath(
                                    "",
                                    language,
                                  );
                                  const queryParam = `?highlight=${encodeURIComponent(debouncedSearchValue)}`;

                                  switch (result.type) {
                                    case "home":
                                      targetUrl = getLocalizedPath(
                                        queryParam,
                                        language,
                                      );
                                      break;
                                    case "about":
                                      targetUrl = getLocalizedPath(
                                        `/about${queryParam}`,
                                        language,
                                      );
                                      break;
                                    case "report":
                                      targetUrl = await resolveReportSearchPath(
                                        result,
                                        queryParam,
                                      );
                                      break;
                                    case "legal":
                                      const page =
                                        result.page_name === "terms"
                                          ? "terms-of-service"
                                          : "privacy";
                                      targetUrl = getLocalizedPath(
                                        `/${page}${queryParam}`,
                                        language,
                                      );
                                      break;
                                    default:
                                      targetUrl = await resolveReportSearchPath(
                                        result,
                                        queryParam,
                                      );
                                  }

                                  window.location.href = targetUrl;
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="line-clamp-2 text-sm font-medium text-gray-900">
                                      {result.title}
                                    </h4>
                                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                                      {result.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : debouncedSearchValue.trim().length > 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">
                            {HomePage?.navbar?.searchNoResults ||
                              "No results found"}{" "}
                            for "{debouncedSearchValue}"
                          </p>
                          <div
                            className="mt-2 inline-block cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              setSearchValue("");
                              setShowSearchResults(false);
                              setShowMenu(false);
                              window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                            }}
                          >
                            Search in reports
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={getLocalizedPath("/about", language)}
                className="transition-colors hover:text-white"
                onClick={() => setShowMenu(false)}
              >
                {HomePage?.navbar?.item_one_name ?? "About Us"}
              </Link>
              <div
                id="mobile-case-studies-dropdown-button"
                className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white"
                onClick={() =>
                  setShowCaseStudiesDropdown(!showCaseStudiesDropdown)
                }
              >
                <span
                  className={`text-gray-300 transition-all ${showCaseStudiesDropdown ? "font-medium text-white" : "font-normal"}`}
                >
                  {HomePage?.navbar?.casestudy ?? "Case Studies"}
                </span>
                <Icon
                  icon="mdi:chevron-down"
                  className={`text-gray-300 transition-transform duration-200 ${showCaseStudiesDropdown ? "rotate-180" : ""}`}
                />
              </div>
              {showCaseStudiesDropdown && (
                <div
                  id="mobile-case-studies-dropdown-container"
                  className="relative w-full bg-white px-4 py-8 text-black shadow-sm sm:px-6"
                >
                  <h2
                    className="mb-6 text-left text-xl font-medium text-gray-900"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {HomePage?.navbar?.casestudy ?? "Case Studies"}
                  </h2>
                  <div className="grid grid-cols-1 gap-y-3">
                    {HomePage.case_studies?.map((caseStudy: any) => (
                      <Link
                        href={caseStudy.file_url || "#"}
                        target={caseStudy.file_url ? "_blank" : undefined}
                        key={caseStudy.id}
                        className="group"
                        onClick={() => setShowMenu(false)}
                      >
                        <div className="rounded-lg p-3 transition-colors hover:bg-gray-50">
                          <h3
                            className="text-[14px] leading-snug font-normal text-gray-900 transition-colors group-hover:text-blue-600"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                          >
                            {caseStudy.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div
                id="mobile-dropdown-button"
                className="flex cursor-pointer items-center gap-1 transition-colors hover:text-white"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span
                  className={`text-gray-300 transition-all ${showDropdown ? "font-medium text-white" : "font-normal"}`}
                >
                  {HomePage?.navbar?.item_two ?? "Reports Store"}
                </span>
                <Icon
                  icon="mdi:chevron-down"
                  className={`text-gray-300 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                />
              </div>
              {showDropdown && (
                <div
                  id="mobile-dropdown-container"
                  className="relative w-full bg-white px-4 py-8 text-black shadow-sm sm:px-6"
                >
                  <h2
                    className="mb-6 text-left text-xl font-medium text-gray-900"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    Reports Based On Industries
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
                    {HomePage.report_store_dropdown
                      .slice(0, 4)
                      .map((item: any, idx: number) => (
                        <Link
                          href={getLocalizedPath(
                            `/reports?category=${item.category_id}`,
                            language,
                          )}
                          key={`m-top-${idx}`}
                          className="group"
                          onClick={() => setShowMenu(false)}
                        >
                          <div className="flex items-start space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                            <div className="relative h-6 w-6 flex-shrink-0">
                              <Image
                                src={item.icon}
                                alt={item.category_name}
                                width={24}
                                height={24}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div>
                              <h3
                                className="text-sm leading-snug font-medium text-gray-900 transition-colors group-hover:text-blue-600"
                                style={{
                                  fontFamily: "var(--font-space-grotesk)",
                                }}
                              >
                                {item.category_name}
                              </h3>
                              <p
                                className="mt-1 text-xs font-normal text-black"
                                style={{
                                  fontFamily: "var(--font-space-grotesk)",
                                }}
                              >
                                {item.category_tagline
                                  ?.split(" ")
                                  .slice(0, 3)
                                  .join(" ")}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                  {HomePage.report_store_dropdown
                    .slice(4)
                    .reduce((rows: any[], item: any, idx: number) => {
                      const rowIndex = Math.floor(idx / 3);
                      if (!rows[rowIndex]) rows[rowIndex] = [];
                      rows[rowIndex].push({ ...item, originalIndex: idx + 4 });
                      return rows;
                    }, [])
                    .map((row: any[], rowIdx: number) => (
                      <div
                        key={`m-row-${rowIdx}`}
                        className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2"
                      >
                        {row.map((item: any) => (
                          <Link
                            href={getLocalizedPath(
                              `/reports?category=${item.category_id}`,
                              language,
                            )}
                            key={`m-item-${item.originalIndex}`}
                            className="group"
                            onClick={() => setShowMenu(false)}
                          >
                            <div className="flex items-start space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                              <div className="relative h-6 w-6 flex-shrink-0">
                                <Image
                                  src={item.icon}
                                  alt={item.category_name}
                                  width={24}
                                  height={24}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div>
                                <h3
                                  className="text-sm leading-snug font-bold text-gray-900 transition-colors group-hover:text-blue-600"
                                  style={{
                                    fontFamily: "var(--font-space-grotesk)",
                                  }}
                                >
                                  {item.category_name}
                                </h3>
                                <p
                                  className="mt-1 text-xs font-normal text-black"
                                  style={{
                                    fontFamily: "var(--font-space-grotesk)",
                                  }}
                                >
                                  {item.category_tagline
                                    ?.split(" ")
                                    .slice(0, 3)
                                    .join(" ")}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                </div>
              )}

              {/* Mobile User Menu */}

              <Link
                href={`/${language}/contact`}
                onClick={() => setShowMenu(false)}
              >
                <Button className="w-full rounded-lg bg-gradient-to-r from-[#1160C9] to-[#08D2B8] px-6 py-2 font-normal text-white transition-opacity hover:opacity-90">
                  {HomePage?.navbar?.button_text ?? "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
