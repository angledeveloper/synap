"use client";

import { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useLanguageStore } from "@/store";
import { supportedLanguages } from "../../lib/utils";
import { Icon } from "@iconify/react";

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
    <div className="flex h-[36px] w-full cursor-pointer items-center gap-0 rounded-[7px] border border-neutral-100 bg-black px-2 py-1 lg:w-fit">
      <Icon icon="mdi:language" className="text-white" />
      <select
        className="cursor-pointer rounded px-2 py-1 text-sm outline-none"
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
          <option
            className="text-black hover:bg-neutral-200"
            key={l.code}
            value={l.code}
          >
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
