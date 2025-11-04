"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";

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
  const id = codeToId[language];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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
  const { data: navbarData } = useNavbarData({ language });

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
    const shouldShowSearch = isHoveringSearch || searchValue.length > 0;
    setShowSearch(shouldShowSearch);
    // Only show search results when there's actual content or results
    setShowSearchResults(shouldShowSearch && searchValue.length > 0);
  }, [isHoveringSearch, searchValue]);

  // Show search results when we have data
  useEffect(() => {
    if (searchResults && (searchResults as any).results && (searchResults as any).results.length > 0) {
      setShowSearchResults(true);
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

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleDropdownClickOutside = (event: MouseEvent) => {
      const dropdownContainer = document.getElementById('dropdown-container');
      const dropdownButton = document.getElementById('dropdown-button');
      const mobileDropdownButton = document.getElementById('mobile-dropdown-button');
      
      if (dropdownContainer && 
          !dropdownContainer.contains(event.target as Node) &&
          !dropdownButton?.contains(event.target as Node) &&
          !mobileDropdownButton?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleDropdownClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleDropdownClickOutside);
    };
  }, [showDropdown]);

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

  return (
    <nav className="fixed top-0 left-0 z-50 w-full">
      <div className="relative flex h-20 w-full items-center justify-between bg-black/90 px-6 lg:px-8">
        <Link href={`/${language}`}>
          <div className="h-[30px] w-auto">
            <FullLogo />
          </div>
        </Link>
        {/* Center Navigation */}
        <div className="hidden items-center gap-8 text-sm text-white lg:flex">
          <Link href={`/${language}/about`} className="hover:font-bold transition-all">
            {HomePage?.navbar?.item_one_name ?? ''}
          </Link>
          <div
  id="dropdown-button"
  className="flex cursor-pointer items-center gap-1 hover:font-bold transition-all"
  onClick={() => setShowDropdown(!showDropdown)}
>
  <span className={`bg-clip-text text-white transition-all ${showDropdown ? 'font-bold' : 'font-normal'}`}>
    {HomePage?.navbar?.item_two ?? ''}
  </span>
  <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
  {showDropdown && (
  <div id="dropdown-container" className="relative lg:absolute lg:top-[90px] lg:left-1/2 lg:-translate-x-1/2 w-full max-w-[1440px] h-auto max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <h2 className="text-left text-xl font-medium text-gray-900 mb-8" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        {HomePage?.report_store_dropdown?.[0]?.title ?? ''}
      </h2>

       {/* First row - responsive categories */}
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 sm:gap-y-4 gap-x-4 sm:gap-x-4 lg:gap-x-6">
         {/* All Industries first */}
         {HomePage.report_store_dropdown
           .filter((item: CategoryItem) => 
             item.category_name === 'All Industries')
           .map((item: CategoryItem) => (
             <Link href={`/${language}/reports`} key={item.category_id} className="group">
               <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
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
         
         {/* Other categories (excluding All Industries) */}
         {HomePage.report_store_dropdown
           .filter((item: CategoryItem) => item.category_name !== 'All Industries')
           .slice(0, 3)  // Take 3 more to make it 4 in total with All Industries
           .map((item: CategoryItem, idx: number) => (
           <Link href={`/${language}/reports?category=${item.id}`} key={idx} className="group">
             <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
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
       
       {/* Subsequent rows - responsive 3-up rows */}
       {HomePage.report_store_dropdown
         .filter((item: CategoryItem) => item.category_name !== 'All Industries')
         .slice(3)  // Skip the first 3 we already showed
         .reduce((rows: (CategoryItem & { originalIndex: number })[][], item: CategoryItem, idx: number) => {
         const rowIndex = Math.floor(idx / 3);
         if (!rows[rowIndex]) rows[rowIndex] = [];
         rows[rowIndex].push({...item, originalIndex: idx + 4});
         return rows;
       }, []).map((row: any[], rowIdx: number) => (
         <div key={rowIdx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 sm:gap-y-4 gap-x-4 sm:gap-x-4 mt-4 w-full lg:max-w-[75%]">
           {row.map((item: CategoryItem, idx: number) => (
             <Link href={`/${language}/reports?category=${item.id}`} key={item.originalIndex} className="group">
               <div className="flex items-start space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors">
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
                   <h3 className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
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
       ))}
    </div>
  )}
</div>
          <Link href={`/${language}/contact`} className="hover:font-bold transition-all">
            {HomePage?.navbar?.button_text ?? ''}
          </Link>
        </div>

        {/* Right Side Items */}
        <div className="hidden items-center gap-4 text-sm text-white lg:flex">
          {/* Expandable Search */}
          <div 
            id="search-container"
            className="relative flex items-center"
            onMouseEnter={() => setIsHoveringSearch(true)}
            onMouseLeave={() => setIsHoveringSearch(false)}
          >
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => {
                setIsHoveringSearch(true);
                setShowSearch(true);
              }}
            >
              <Icon icon="mdi:magnify" className="text-xl text-white" />
            </div>
            
            <div 
              className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                showSearch ? 'w-64 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="flex items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                  <input
                    type="search"
                    placeholder={navbarData?.searchPlaceholder || "Let's find what you need!"}
                    className="w-full bg-transparent text-white placeholder:text-white/70 focus:outline-none text-sm"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsHoveringSearch(true)}
                    onBlur={() => {
                      // Only close if search input is empty and not hovering
                      if (searchValue === '' && !isHoveringSearch) {
                        setShowSearch(false);
                      }
                    }}
                    autoFocus={showSearch}
                  />
                  {searchValue && (
                    <button
                      onClick={() => {
                        setSearchValue('');
                        setIsHoveringSearch(false);
                      }}
                      className="ml-2 text-white/70 hover:text-white transition-colors"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full right-0 w-64 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
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
                          {(searchResults as any).total || (searchResults as any).results.length} {navbarData?.searchResultsCount || 'result'}{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                        </div>
                        {(searchResults as any).results.slice(0, 5).map((result: any, index: number) => (
                          <div
                            key={`search-result-${index}`}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                            onClick={() => {
                              setSearchValue('');
                              setShowSearchResults(false);
                              setIsHoveringSearch(false);
                              window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
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
                                window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                              }}
                            >
                              View all {(searchResults as any).results.length} results
                            </div>
                          </div>
                        )}
                      </div>
                    ) : debouncedSearchValue.trim().length > 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">{navbarData?.searchNoResults || 'No results found'} for "{debouncedSearchValue}"</p>
                        <div
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block cursor-pointer"
                          onClick={() => {
                            setSearchValue('');
                            setShowSearchResults(false);
                            setIsHoveringSearch(false);
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
          
          {/* Language Switch */}
          <GlobalLanguageSwitch />
          
          {/* Login removed */}
        </div>
        <div className="flex h-[36px] items-center gap-6 text-2xl text-white lg:hidden">
          <Icon
            icon={showMenu ? "mdi:close" : "mdi:menu"}
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer"
          />
          {showMenu && (
            <div className="absolute top-[90px] left-0 m-auto max-h-[70vh] w-full overflow-scroll rounded-[20px] bg-black p-4 text-black">
              <div className="flex flex-col gap-4 text-2xl text-white">
                <div className="flex w-full flex-wrap gap-4">
                    <div className="relative w-full">
                      <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                      <input
                        type="search"
                        placeholder={navbarData?.searchPlaceholder || "Let's find what you need!"}
                        className="h-[36px] w-full rounded-[7px] border border-white/20 bg-white/10 px-10 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      {searchValue && (
                        <button
                          onClick={() => setSearchValue('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          <Icon icon="mdi:close" className="text-sm" />
                        </button>
                      )}
                      
                      {/* Mobile Search Results */}
                      {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
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
                                {(searchResults as any).total || (searchResults as any).results.length} {navbarData?.searchResultsCount || 'result'}{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                              </div>
                              {(searchResults as any).results.slice(0, 3).map((result: any, index: number) => (
                                <div
                                  key={`mobile-search-result-${index}`}
                                  className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                                  onClick={() => {
                                    setSearchValue('');
                                    setShowSearchResults(false);
                                    setShowMenu(false);
                                    window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
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
                              {(searchResults as any).results.length > 3 && (
                                <div className="px-4 py-2 border-t border-gray-100">
                                  <div
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                                    onClick={() => {
                                      setSearchValue('');
                                      setShowSearchResults(false);
                                      setShowMenu(false);
                                      window.location.href = `/${language}/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                                    }}
                                  >
                                    View all {(searchResults as any).results.length} results
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : debouncedSearchValue.trim().length > 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <p className="text-sm">{navbarData?.searchNoResults || 'No results found'} for "{debouncedSearchValue}"</p>
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
                <Link href={`/${language}/about`} className="hover:font-bold transition-all">{HomePage?.navbar?.item_one_name ?? ''}</Link>
                <div
                  id="dropdown-button"
                  className="flex cursor-pointer items-center gap-1 hover:font-bold transition-all"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className={`text-white transition-all ${showDropdown ? 'font-bold' : 'font-normal'}`}>{HomePage?.navbar?.item_two ?? ''}</span>
                  <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </div>
                {showDropdown && (
                  <div id="dropdown-container" className="relative w-full rounded-2xl bg-white text-black shadow-sm px-4 sm:px-6 py-8">
                    <h2 className="text-left text-xl font-medium text-gray-900 mb-6" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                      Reports Based On Industries
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-6">
                      {HomePage.report_store_dropdown.slice(0, 4).map((item: any, idx: number) => (
                        <Link href={`/${language}/reports?category=${item.id}`} key={`m-top-${idx}`} className="group">
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
                      rows[rowIndex].push({...item, originalIndex: idx + 4});
                      return rows;
                    }, []).map((row: any[], rowIdx: number) => (
                      <div key={`m-row-${rowIdx}`} className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 mt-6">
                        {row.map((item: any) => (
                          <Link href={`/${language}/reports?category=${item.id}`} key={`m-item-${item.originalIndex}`} className="group">
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
                <Link href={`/${language}/contact`} className="hover:font-bold transition-all">{HomePage?.navbar?.button_text ?? ''}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
