"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore, useCartStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import Image from "next/image";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";
import FullLogo from "./FullLogo";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDeepSearch } from "@/hooks/useDeepSearch";
import { useDebounce } from "@/hooks/useDebounce";

export default function GlobalNavbar() {
  const { language } = useLanguageStore();
  const { HomePage, setHomePage } = useHomePageStore();
  const { items: cartItems, getItemCount } = useCartStore();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["navbarData", language],
    queryFn: () => fetch(`${baseUrl}homepage/${id}`).then((res) => res.json()),
  });

  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLoading) {
      timer = setTimeout(() => setShowLoading(false), 200);
    } else {
      setShowLoading(true);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

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
    <nav className="fixed top-4 left-0 z-50 flex w-full justify-center px-3">
      <div className="relative flex h-20 w-full max-w-[1440px] items-center justify-between rounded-3xl bg-black/80 px-8 backdrop-blur-xs lg:px-8">
        <Link href="/">
          <div className="h-[30px] w-auto">
            <FullLogo />
          </div>
        </Link>
        {/* Center Navigation */}
        <div className="hidden items-center gap-8 text-sm text-white lg:flex">
          <Link href="/about" className="hover:font-bold transition-all">
            About Us
          </Link>
          <div
  id="dropdown-button"
  className="flex cursor-pointer items-center gap-1 hover:font-bold transition-all"
  onClick={() => setShowDropdown(!showDropdown)}
>
  <span className={`bg-clip-text text-white transition-all ${showDropdown ? 'font-bold' : 'font-normal'}`}>
    Reports Store
  </span>
  <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
  {showDropdown && (
    <div id="dropdown-container" className="absolute top-[90px] left-1/2 transform -translate-x-1/2 w-[1440px] h-[450px] rounded-2xl bg-white shadow-sm px-8 py-12">
      <h2 className="text-left text-xl font-medium text-gray-900 mb-8" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        Reports Based On Industries
      </h2>

       {/* First row - 4 categories */}
       <div className="grid grid-cols-4 gap-y-10 gap-x-12">
         {HomePage.report_store_dropdown.slice(0, 4).map((item: any, idx: number) => (
           <Link href="/" key={idx} className="group">
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
       
       {/* Subsequent rows - 3 categories each */}
       {HomePage.report_store_dropdown.slice(4).reduce((rows: any[], item: any, idx: number) => {
         const rowIndex = Math.floor(idx / 3);
         if (!rows[rowIndex]) rows[rowIndex] = [];
         rows[rowIndex].push({...item, originalIndex: idx + 4});
         return rows;
       }, []).map((row: any[], rowIdx: number) => (
         <div key={rowIdx} className="grid grid-cols-3 gap-y-10 gap-x-8 mt-6 max-w-[75%]">
           {row.map((item: any, idx: number) => (
             <Link href="/" key={item.originalIndex} className="group">
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
          <Link href="/contact" className="hover:font-bold transition-all">
            Contact Us
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
                    placeholder="Let's find what you need!"
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
                          {(searchResults as any).total || (searchResults as any).results.length} result{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                        </div>
                        {(searchResults as any).results.slice(0, 5).map((result: any, index: number) => (
                          <div
                            key={`search-result-${index}`}
                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                            onClick={() => {
                              setSearchValue('');
                              setShowSearchResults(false);
                              setIsHoveringSearch(false);
                              window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
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
                                window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                              }}
                            >
                              View all {(searchResults as any).results.length} results
                            </div>
                          </div>
                        )}
                      </div>
                    ) : debouncedSearchValue.trim().length > 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No results found for "{debouncedSearchValue}"</p>
                        <div
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block cursor-pointer"
                          onClick={() => {
                            setSearchValue('');
                            setShowSearchResults(false);
                            setIsHoveringSearch(false);
                            window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                          }}
                        >
                          Search in reports
                        </div>
                      </div>
                    ) : null}
              </div>
            )}
          </div>
          
          {/* Cart Button */}
          <div className="relative">
            <button
              onClick={() => setShowCart(!showCart)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all cursor-pointer relative"
            >
              <Icon icon="mdi:cart" className="text-xl text-white" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
            </button>
            
            {/* Cart Dropdown */}
            {showCart && (
              <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon="mdi:close" className="text-xl" />
                  </button>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon icon="mdi:cart-outline" className="text-4xl text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          {item.category && (
                            <p className="text-xs text-gray-500">{item.category}</p>
                          )}
                        </div>
                        <button
                          onClick={() => useCartStore.getState().removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Icon icon="mdi:delete" className="text-lg" />
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          {getItemCount()} item{getItemCount() !== 1 ? 's' : ''}
                        </span>
                        <Link href="/checkout">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Checkout
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Language Switch */}
          <GlobalLanguageSwitch />
          
          {/* Login Button */}
          <Link href="/login">
            <Button className="cursor-pointer border border-white bg-transparent hover:bg-white/10 transition-all">
              <Icon icon="mdi:user" className="mr-2" />
              Login
            </Button>
          </Link>
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
                        placeholder="Let's find what you need!"
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
                                {(searchResults as any).total || (searchResults as any).results.length} result{((searchResults as any).total || (searchResults as any).results.length) !== 1 ? 's' : ''} found
                              </div>
                              {(searchResults as any).results.slice(0, 3).map((result: any, index: number) => (
                                <div
                                  key={`mobile-search-result-${index}`}
                                  className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                                  onClick={() => {
                                    setSearchValue('');
                                    setShowSearchResults(false);
                                    setShowMenu(false);
                                    window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
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
                                      window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                                    }}
                                  >
                                    View all {(searchResults as any).results.length} results
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : debouncedSearchValue.trim().length > 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              <p className="text-sm">No results found for "{debouncedSearchValue}"</p>
                              <div
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block cursor-pointer"
                                onClick={() => {
                                  setSearchValue('');
                                  setShowSearchResults(false);
                                  setShowMenu(false);
                                  window.location.href = `/reports?search=${encodeURIComponent(debouncedSearchValue)}`;
                                }}
                              >
                                Search in reports
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  {/* Mobile Cart Button */}
                  <div className="w-full">
                    <button
                      onClick={() => setShowCart(!showCart)}
                      className="w-full flex items-center justify-center gap-2 p-3 border border-white bg-transparent hover:bg-white/10 transition-all rounded-lg"
                    >
                      <Icon icon="mdi:cart" className="text-xl text-white" />
                      <span className="text-white">Cart</span>
                      {getItemCount() > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {getItemCount()}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <GlobalLanguageSwitch />
                  <Link className="w-full" href="/login">
                    <Button className="w-full cursor-pointer border border-white bg-transparent">
                      <Icon icon="mdi:user" className="mr-2" />
                      Login
                    </Button>
                  </Link>
                </div>
                <Link href="/about" className="hover:font-bold transition-all">About Us</Link>
                <div
                  id="mobile-dropdown-button"
                  className="flex cursor-pointer flex-col gap-1"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex cursor-pointer items-center gap-1">
                    <span className={`bg-gradient-to-r from-[#08D2B8] to-[#1160C9] bg-clip-text text-transparent transition-all ${showDropdown ? 'font-bold' : 'font-normal'}`}>
                      Reports Store
                    </span>
                    <Icon icon="mdi:chevron-down" className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  {showDropdown && (
                    <div id="dropdown-container" className="text-white">
                      <h3 className="text-center text-xl font-medium text-white mb-8" style={{ fontFamily: 'var(--font-geist-mono)' }}>Reports Based On Industries</h3>
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4">
                        {HomePage.report_store_dropdown.map(
                          (item: any, idx: number) => (
                            <Link href="/" key={idx} className="group">
                              <div className="flex items-start space-x-4 hover:bg-white/10 p-3 rounded-lg transition-colors">
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
                                  <h4 className="text-[15px] font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {item.category_name}
                                  </h4>
                                  <p className="text-[13px] text-gray-300 mt-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                    {item.category_tagline?.split(' ').slice(0, 3).join(' ')}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link href="/contact" className="hover:font-bold transition-all">Contact Us</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
