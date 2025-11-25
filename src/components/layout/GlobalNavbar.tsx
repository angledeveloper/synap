"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, logout } = useAuth();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language as keyof typeof codeToId] || codeToId['en'];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCaseStudiesDropdown, setShowCaseStudiesDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  // cart/login removed
  const [searchValue, setSearchValue] = useState("");
  const [isHoveringSearch, setIsHoveringSearch] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounce search value for API calls
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Deep search hook - always enabled when there's a search value
  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useDeepSearch(
    debouncedSearchValue,
    debouncedSearchValue.trim().length > 0
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
    if (searchResults && (searchResults as any).results && (searchResults as any).results.length > 0) {
      setShowSearchResults(true);
      setShowSearch(true); // Keep search expanded when results are shown
    }
  }, [searchResults]);

  // Handle clicking outside search to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        // Close search if no content and not hovering
        if (searchValue === '' && !isHoveringSearch) {
          setShowSearch(false);
          setShowSearchResults(false);
        }
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch, searchValue, isHoveringSearch]);

  // Handle clicking outside user menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      const dropdownContainer = document.getElementById('dropdown-container');
      const dropdownButton = document.getElementById('dropdown-button');
      const mobileDropdownButton = document.getElementById('mobile-dropdown-button');

      const caseStudiesDropdownContainer = document.getElementById('case-studies-dropdown-container');
      const caseStudiesDropdownButton = document.getElementById('case-studies-dropdown-button');
      const mobileCaseStudiesDropdownButton = document.getElementById('mobile-case-studies-dropdown-button');

      if (dropdownContainer &&
        !dropdownContainer.contains(event.target as Node) &&
        !dropdownButton?.contains(event.target as Node) &&
        !mobileDropdownButton?.contains(event.target as Node)) {
        setShowDropdown(false);
      }

      if (caseStudiesDropdownContainer &&
        !caseStudiesDropdownContainer.contains(event.target as Node) &&
        !caseStudiesDropdownButton?.contains(event.target as Node) &&
        !mobileCaseStudiesDropdownButton?.contains(event.target as Node)) {
        setShowCaseStudiesDropdown(false);
      }
    };

    if (showDropdown || showCaseStudiesDropdown) {
      document.addEventListener('mousedown', handleDropdownClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleDropdownClickOutside);
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

  return (
    <nav className="fixed top-0 left-0 z-50 w-full">
      <div className="relative flex h-20 w-full items-center bg-[#060606]/90 lg:justify-center justify-between">
        {/* Centered Container with 284px margins */}
        <div className="hidden lg:flex items-center justify-between w-full px-4 xl:px-8 2xl:px-[284px]">
          {/* Logo */}
          <Link href={`/${language}`} className="flex-shrink-0">
            <div className="h-[30px] w-auto">
              <FullLogo />
            </div>
          </Link>
          {/* Right Side - Navigation Links, Search, Language, Contact */}
          <div className="flex items-center gap-8 text-sm">
            {/* About Us */}
            <Link href={`/${language}/about`} className="text-gray-300 hover:text-white transition-colors font-normal whitespace-nowrap">
              {HomePage.navbar?.item_one_name ?? 'About Us'}
            </Link>
            {/* Case Studies Dropdown */}
            <div
              id="case-studies-dropdown-button"
              className="flex cursor-pointer items-center gap-1 text-gray-300 hover:text-white transition-colors font-normal whitespace-nowrap"
              onClick={() => setShowCaseStudiesDropdown(!showCaseStudiesDropdown)}
            >
              <span className={`transition-all ${showCaseStudiesDropdown ? 'text-white font-medium' : 'font-normal'}`}>
                {HomePage.navbar?.casestudy ?? 'Case Studies'}
              </span>
              <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showCaseStudiesDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showCaseStudiesDropdown && (
              <div id="case-studies-dropdown-container" className="absolute lg:top-[80px] lg:left-1/2 lg:-translate-x-1/2 w-full max-w-[1440px] h-auto max-h-[80vh] overflow-y-auto bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-6 lg:py-8 z-50">
                <h2 className="text-left text-xl font-medium text-gray-900 mb-8" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {HomePage.navbar?.casestudy ?? 'Case Studies'}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 gap-x-6">
                  {HomePage.case_studies?.map((caseStudy: any) => (
                    <Link href={`/${language}/case-studies/${caseStudy.id}`} key={caseStudy.id} className="group">
                      <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                        <h3 className="text-[14px] font-normal text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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
              className="flex cursor-pointer items-center gap-1 text-gray-300 hover:text-white transition-colors font-normal whitespace-nowrap"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className={`transition-all ${showDropdown ? 'text-white font-medium' : 'font-normal'}`}>
                {HomePage.navbar?.item_two ?? 'Reports Store'}
              </span>
              <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              {showDropdown && (
                <div id="dropdown-container" className="absolute lg:top-[80px] lg:left-1/2 lg:-translate-x-1/2 w-full max-w-[1440px] bg-white shadow-sm px-8 py-10 z-50">
                  <h2 className="text-left text-xl font-medium text-gray-900 mb-10" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {HomePage?.report_store_dropdown?.[0]?.title ?? ''}
                  </h2>

                  {/* First row - responsive categories */}
                  <div className="grid grid-cols-4 gap-x-10 gap-y-8">
                    {HomePage.report_store_dropdown.map((item: CategoryItem) => (
                      <Link
                        href={`/${language}/reports${item.category_name === 'All Industries' ? '' : `?category=${item.category_id}`}`}
                        key={item.category_id}
                        className="group"
                      >
                        <div className="flex items-start space-x-4 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                          <div className="w-7 h-7 relative flex-shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.category_name}
                              width={28}
                              height={28}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div>
                            <h3 className="text-[15px] font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {item.category_name}
                            </h3>
                            <p className="text-[13px] text-black font-normal mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {item.category_tagline?.split(' ').slice(0, 3).join(' ')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}


                  </div>

                </div>
              )}
            </div>

            {/* Search Bar */}
            <div id="search-container" className="relative flex items-center">
              <div className="flex items-center  border border-gray-400 rounded-lg w-48 md:w-56 px-3 py-2">
                <Icon
                  icon="mdi:magnify"
                  className="text-gray-300 flex-shrink-0 text-lg mr-2"
                />
                <input
                  id="search-input"
                  type="search"
                  placeholder={HomePage?.navbar?.searchPlaceholder || "Search"}
                  className="bg-transparent text-gray-300 placeholder:text-gray-400 focus:outline-none text-sm w-full"
                  value={searchValue}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSearchValue(newValue);
                    if (newValue === '') {
                      setShowSearchResults(false);
                    }
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
                {searchValue && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchValue('');
                      setShowSearchResults(false);
                      // Collapse after clearing if not hovering
                      if (!isHoveringSearch) {
                        setShowSearch(false);
                      }
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                  >
                    <Icon icon="mdi:close" className="text-sm" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div
                  className="absolute top-full right-0 w-64 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
                  onMouseEnter={() => setIsHoveringSearch(true)}
                  onMouseLeave={() => {
                    // Keep search expanded if there's text
                    if (searchValue === '') {
                      setIsHoveringSearch(false);
                      setShowSearch(false);
                    }
                  }}
                >
                  {isSearchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : searchError ? (
                    <div className="p-4 text-center text-red-500">
                      <p className="text-sm">Error searching. Please try again.</p>
                    </div>
                  ) : searchResults && (searchResults as any).results && (searchResults as any).results.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                        {(searchResults as any).total || (searchResults as any).results.length} {HomePage?.navbar?.searchResultsCount || 'result'}{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                      </div>
                      {(searchResults as any).results.slice(0, 5).map((result: any, index: number) => (
                        <div
                          key={`search-result-${index}`}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                          onClick={async () => {
                            setSearchValue('');
                            setShowSearchResults(false);
                            setIsHoveringSearch(false);
                            setShowSearch(false);

                            let targetUrl = `/${language}`;
                            const queryParam = `?highlight=${encodeURIComponent(debouncedSearchValue)}`;

                            switch (result.type) {
                              case 'home':
                                targetUrl = `/${language}${queryParam}`;
                                break;
                              case 'about':
                                targetUrl = `/${language}/about${queryParam}`;
                                break;
                              case 'report':
                                if (result.id) {
                                  targetUrl = `/${language}/reports/${result.id}${queryParam}`;
                                } else {
                                  // Workaround for missing ID: Fetch ID using reports_store_page API
                                  try {
                                    const formData = new FormData();
                                    formData.append('search', result.title);
                                    formData.append('language_id', codeToId[language as keyof typeof codeToId] || '1');
                                    formData.append('page', '1');
                                    formData.append('per_page', '10');
                                    // We don't send category_id or send 'all' to search across all categories
                                    formData.append('category_id', 'all');

                                    const response = await fetch(`${process.env.NEXT_PUBLIC_DB_URL}reports_store_page`, {
                                      method: 'POST',
                                      body: formData,
                                    });

                                    if (response.ok) {
                                      const data = await response.json();
                                      let reportId;

                                      // Check filtered categories for the report
                                      if (data.filtered && Array.isArray(data.filtered)) {
                                        for (const category of data.filtered) {
                                          if (category.reports && Array.isArray(category.reports)) {
                                            const foundReport = category.reports.find((r: any) => r.title === result.title);
                                            if (foundReport) {
                                              reportId = foundReport.id;
                                              break;
                                            }
                                          }
                                        }
                                      }

                                      // Fallback to direct data check if structure differs
                                      if (!reportId) {
                                        if (data.reports && data.reports.length > 0) {
                                          const found = data.reports.find((r: any) => r.title === result.title);
                                          if (found) reportId = found.id;
                                        } else if (data.data && data.data.length > 0) {
                                          const found = data.data.find((r: any) => r.title === result.title);
                                          if (found) reportId = found.id;
                                        }
                                      }

                                      if (reportId) {
                                        targetUrl = `/${language}/reports/${reportId}${queryParam}`;
                                      } else {
                                        console.error('Could not find report ID for:', result.title);
                                        // Fallback to reports list if ID still not found
                                        targetUrl = `/${language}/reports${queryParam}`;
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error fetching report ID:', error);
                                    targetUrl = `/${language}/reports${queryParam}`;
                                  }
                                }
                                break;
                              case 'legal':
                                const page = result.page_name === 'terms' ? 'terms-of-service' : 'privacy';
                                targetUrl = `/${language}/${page}${queryParam}`;
                                break;
                              default:
                                // Fallback to reports if type is missing (legacy)
                                targetUrl = `/${language}/reports/${result.id || ''}${queryParam}`;
                            }

                            window.location.href = targetUrl;
                          }}
                          onMouseDown={(e) => {
                            // Prevent input blur when clicking results
                            e.preventDefault();
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {result.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {result.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(searchResults as any).results.length > 5 && (
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            onClick={() => {
                              setSearchValue('');
                              setShowSearchResults(false);
                              setIsHoveringSearch(false);
                              setShowSearch(false);
                              window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                            }}
                          >
                            View all {(searchResults as any).results.length} results
                          </div>
                        </div>
                      )}
                    </div>
                  ) : debouncedSearchValue.trim().length > 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">{HomePage?.navbar?.searchNoResults || 'No results found'} for "{debouncedSearchValue}"</p>
                      <div
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block cursor-pointer"
                        onClick={() => {
                          setSearchValue('');
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

            {/* User Menu */}
            <div className="relative" id="user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#1160C9] to-[#08D2B8] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <Icon icon="mdi:chevron-down" className={`text-gray-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-white text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Us Button */}
            <Link href={`/${language}/contact`} className="flex-shrink-0">
              <Button className="bg-gradient-to-r from-[#1160C9] to-[#08D2B8] hover:opacity-90 text-white font-normal rounded-[7px] px-6 py-2 transition-opacity whitespace-nowrap">
                {HomePage?.navbar?.button_text ?? 'Contact Us'}
              </Button>
            </Link>
          </div>
        </div>
        {/* MOBILE NAVBAR */}
        <div className="flex w-full items-center px-4 h-[80px] bg-[#060606]/90 
    justify-between lg:hidden">

          {/* Logo left */}
          <Link href={`/${language}`} className="flex items-center">
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
            className="text-3xl text-gray-300 hover:text-white transition-colors cursor-pointer"
          />
        </div>

        {/* MOBILE MENU CONTENT */}
        {showMenu && (
          <div className="absolute top-[80px] left-0 w-full max-h-[70vh] overflow-y-scroll 
      rounded-b-[20px] bg-[#060606]/90 p-4 z-50">

            <div className="flex flex-col gap-4 text-lg text-gray-300">

              <div className="flex w-full flex-wrap gap-4">
                <div className="relative w-full">
                  <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2">
                    <Icon icon="mdi:magnify" className="text-gray-300 mr-2 flex-shrink-0" />
                    <input
                      type="search"
                      placeholder={HomePage?.navbar?.searchPlaceholder || "Search"}
                      className="h-[36px] w-full bg-transparent text-gray-300 placeholder:text-gray-400 focus:outline-none text-sm"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    {searchValue && (
                      <button
                        onClick={() => setSearchValue('')}
                        className="ml-2 text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                      >
                        <Icon icon="mdi:close" className="text-sm" />
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
                      {/* unchanged */}
                      {isSearchLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <p className="mt-2 text-sm">Searching...</p>
                        </div>
                      ) : searchError ? (
                        <div className="p-4 text-center text-red-500">
                          <p className="text-sm">Error searching. Please try again.</p>
                        </div>
                      ) : searchResults && (searchResults as any).results && (searchResults as any).results.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            {(searchResults as any).total || (searchResults as any).results.length} {HomePage?.navbar?.searchResultsCount || 'result'}{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                          </div>
                          {(searchResults as any).results.slice(0, 3).map((result: any, index: number) => (
                            <div
                              key={`mobile-search-result-${index}`}
                              className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                              onClick={() => {
                                setSearchValue('');
                                setShowSearchResults(false);
                                setShowMenu(false);

                                let targetUrl = `/${language}`;
                                const queryParam = `?highlight=${encodeURIComponent(debouncedSearchValue)}`;

                                switch (result.type) {
                                  case 'home':
                                    targetUrl = `/${language}${queryParam}`;
                                    break;
                                  case 'about':
                                    targetUrl = `/${language}/about${queryParam}`;
                                    break;
                                  case 'report':
                                    targetUrl = `/${language}/reports/${result.id}${queryParam}`;
                                    break;
                                  case 'legal':
                                    const page = result.page_name === 'terms' ? 'terms-of-service' : 'privacy';
                                    targetUrl = `/${language}/${page}${queryParam}`;
                                    break;
                                  default:
                                    targetUrl = `/${language}/reports/${result.id || ''}${queryParam}`;
                                }

                                window.location.href = targetUrl;
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {result.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {result.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : debouncedSearchValue.trim().length > 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">{HomePage?.navbar?.searchNoResults || 'No results found'} for "{debouncedSearchValue}"</p>
                          <div
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block cursor-pointer"
                            onClick={() => {
                              setSearchValue('');
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
                <GlobalLanguageSwitch />
              </div>
              <Link href={`/${language}/about`} className="hover:text-white transition-colors">{HomePage?.navbar?.item_one_name ?? 'About Us'}</Link>
              <div
                id="mobile-case-studies-dropdown-button"
                className="flex cursor-pointer items-center gap-1 hover:text-white transition-colors"
                onClick={() => setShowCaseStudiesDropdown(!showCaseStudiesDropdown)}
              >
                <span className={`text-gray-300 transition-all ${showCaseStudiesDropdown ? 'text-white font-medium' : 'font-normal'}`}>{HomePage?.navbar?.casestudy ?? 'Case Studies'}</span>
                <Icon icon="mdi:chevron-down" className={`text-gray-300 transition-transform duration-200 ${showCaseStudiesDropdown ? 'rotate-180' : ''}`} />
              </div>
              {showCaseStudiesDropdown && (
                <div id="mobile-case-studies-dropdown-container" className="relative w-full bg-white text-black shadow-sm px-4 sm:px-6 py-8">
                  <h2 className="text-left text-xl font-medium text-gray-900 mb-6" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {HomePage?.navbar?.casestudy ?? 'Case Studies'}
                  </h2>
                  <div className="grid grid-cols-1 gap-y-3">
                    {HomePage.case_studies?.map((caseStudy: any) => (
                      <Link href={`/${language}/case-studies/${caseStudy.id}`} key={caseStudy.id} className="group">
                        <div className="hover:bg-gray-50 p-3 rounded-lg transition-colors">
                          <h3 className="text-[14px] font-normal text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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
                className="flex cursor-pointer items-center gap-1 hover:text-white transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className={`text-gray-300 transition-all ${showDropdown ? 'text-white font-medium' : 'font-normal'}`}>{HomePage?.navbar?.item_two ?? 'Reports Store'}</span>
                <Icon icon="mdi:chevron-down" className={`text-gray-300 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </div>
              {showDropdown && (
                <div id="dropdown-container" className="relative w-full bg-white text-black shadow-sm px-4 sm:px-6 py-8">
                  <h2 className="text-left text-xl font-medium text-gray-900 mb-6" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    Reports Based On Industries
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-6">
                    {HomePage.report_store_dropdown.slice(0, 4).map((item: any, idx: number) => (
                      <Link href={`/${language}/reports?category=${item.category_id}`} key={`m-top-${idx}`} className="group">
                        <div className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <div className="w-6 h-6 relative flex-shrink-0">
                            <Image src={item.icon} alt={item.category_name} width={24} height={24} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {item.category_name}
                            </h3>
                            <p className="text-xs text-black font-normal mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {item.category_tagline?.split(' ').slice(0, 3).join(' ')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {HomePage.report_store_dropdown.slice(4).reduce((rows: any[], item: any, idx: number) => {
                    const rowIndex = Math.floor(idx / 3);
                    if (!rows[rowIndex]) rows[rowIndex] = [];
                    rows[rowIndex].push({ ...item, originalIndex: idx + 4 });
                    return rows;
                  }, []).map((row: any[], rowIdx: number) => (
                    <div key={`m-row-${rowIdx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 mt-6">
                      {row.map((item: any) => (
                        <Link href={`/${language}/reports?category=${item.category_id}`} key={`m-item-${item.originalIndex}`} className="group">
                          <div className="flex items-start space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <div className="w-6 h-6 relative flex-shrink-0">
                              <Image src={item.icon} alt={item.category_name} width={24} height={24} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {item.category_name}
                              </h3>
                              <p className="text-xs text-black font-normal mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                {item.category_tagline?.split(' ').slice(0, 3).join(' ')}
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
              {user && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#1160C9] to-[#08D2B8] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user?.name || 'User'}</p>
                      <p className="text-gray-400 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm rounded-lg border border-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              <Link href={`/${language}/contact`}>
                <Button className="w-full bg-gradient-to-r from-[#1160C9] to-[#08D2B8] hover:opacity-90 text-white font-normal rounded-lg px-6 py-2 transition-opacity">
                  {HomePage?.navbar?.button_text ?? 'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}

