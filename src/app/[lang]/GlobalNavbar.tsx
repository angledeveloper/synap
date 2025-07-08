"use client";
import { useState, useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { codeToId } from "@/lib/utils";
import GlobalLanguageSwitch from "./GlobalLanguageSwitch";

export default function GlobalNavbar() {
  const { language } = useLanguageStore();
  const { HomePage, setHomePage } = useHomePageStore();
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const id = codeToId[language];

  const { data, isLoading, error } = useQuery({
    queryKey: ["navbarData", language],
    queryFn: () => fetch(`${baseUrl}homepage/${id}`).then((res) => res.json()),
  });

  useEffect(() => {
    if (data) {
      setHomePage(data);
    }
  }, [data]);

  return (
    <nav>
      <GlobalLanguageSwitch />
      GlobalNavbar
    </nav>
  );
}
