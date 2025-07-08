"use client";

import { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useLanguageStore } from "@/store";
import { supportedLanguages } from "../../lib/utils";

export default function GlobalLanguageSwitch() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const lang = params.lang as string;

  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    if (lang) {
      setLanguage(lang);
    }
  }, [lang, setLanguage]);

  return (
    <div>
      <select
        className="rounded border px-2 py-1 text-sm"
        value={lang}
        onChange={(e) => {
          // Replace the first segment (lang) with the new language
          const segments = pathname.split("/");
          segments[1] = e.target.value;
          const newPath = segments.join("/");
          router.push(newPath);
        }}
      >
        {supportedLanguages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
