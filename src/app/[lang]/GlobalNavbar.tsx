"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import Image from "next/image";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";
import FullLogo from "./FullLogo";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalNavbar() {
  const { language } = useLanguageStore();
  const { HomePage, setHomePage } = useHomePageStore();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language];
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
            className="flex cursor-pointer items-center gap-1 hover:font-bold transition-all"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {/* todo: make dropdown compact */}
            <span className="bg-gradient-to-r from-[#08D2B8] to-[#1160C9] bg-clip-text text-transparent font-bold">
              Reports Store
            </span>
            <Icon icon="mdi:chevron-down" />
            {showDropdown && (
              <div className="absolute top-[90px] left-0 m-auto w-full rounded-[20px] bg-neutral-200 p-4 text-black backdrop-blur-2xl">
                <span className="text-[20px]">Reports based on industry</span>
                <div className="md:grid-col-2 mt-10 grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-4">
                  {HomePage.report_store_dropdown.map(  
                    (item: any, idx: number) => (
                      <Link href="/" key={idx}>
                        <div className="flex items-start gap-2">
                          <Image
                            src={item.icon}
                            alt={item.category_name}
                            width={50}
                            height={50}
                            className="h-[31] w-[31] object-cover"
                          />
                          <div>
                            <span className="text-[16px]">
                              {item.category_name}
                            </span>
                            <p className="text-[14px]">
                              {item.category_tagline}
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
          <Link href="/contact" className="hover:font-bold transition-all">
            Contact Us
          </Link>
        </div>

        {/* Right Side Items, todo: cart button */}
        <div className="hidden items-center gap-4 text-sm text-white lg:flex">
          {/* Expandable Search */}
          <div 
            className="relative flex items-center"
            onMouseEnter={() => setShowSearch(true)}
            onMouseLeave={() => setShowSearch(false)}
          >
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all cursor-pointer">
              <Icon icon="mdi:magnify" className="text-xl text-white" />
            </div>
            
          
            <div 
              className={`absolute right-0 top-0 overflow-hidden transition-all duration-300 ease-in-out ${
                showSearch ? 'w-64 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="flex items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                <input
                  type="search"
                  placeholder="Let's find what you need!"
                  className="w-full bg-transparent text-white placeholder:text-white/70 focus:outline-none text-sm"
                  autoFocus={showSearch}
                />
              </div>
            </div>
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
                    />
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
                  className="flex cursor-pointer flex-col gap-1"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="flex cursor-pointer items-center gap-1">
                    <span className="bg-gradient-to-r from-[#08D2B8] to-[#1160C9] bg-clip-text text-transparent font-bold">
                      Reports Store
                    </span>
                    <Icon icon="mdi:chevron-down" />
                  </div>

                  {showDropdown && (
                    <div className="text-white">
                      <span className="text-[20px]">
                        Reports based on industry
                      </span>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {HomePage.report_store_dropdown.map(
                          (item: any, idx: number) => (
                            <Link href="/" key={idx}>
                              <div className="flex items-start gap-2">
                                <Image
                                  src={item.icon}
                                  alt={item.category_name}
                                  width={50}
                                  height={50}
                                  className="h-[31] w-[31] object-cover text-xs"
                                />
                                <div>
                                  <span className="text-[16px]">
                                    {item.category_name}
                                  </span>
                                  <p className="text-[14px]">
                                    {item.category_tagline}
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
