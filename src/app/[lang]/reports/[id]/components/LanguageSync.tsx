"use client";

import { useEffect } from "react";
import { useLanguageStore, useHomePageStore } from "@/store";

export default function LanguageSync({ lang, refId, catRefId }: { lang: string, refId?: string, catRefId?: string }) {
    const { setLanguage } = useLanguageStore();
    const { setIdentity } = useHomePageStore();

    useEffect(() => {
        if (lang) setLanguage(lang);
        if (refId) {
            setIdentity({
                report_reference_id: refId,
                category_reference_id: catRefId || ""
            });
        }
    }, [lang, refId, catRefId, setLanguage, setIdentity]);

    return null;
}
