"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "synapse_ref_id";

export default function RefIdTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refId = searchParams?.get("ref_id");
    if (!refId) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, refId);
    } catch (error) {
      console.error("Failed to store ref_id:", error);
    }
  }, [searchParams]);

  return null;
}
