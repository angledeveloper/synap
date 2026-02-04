import { NextRequest, NextResponse } from "next/server";
import { locales } from "./lib/i18n";

// List your supported locales (should match your [lang] folders)
const defaultLocale = "en";

function getLocale(request: NextRequest) {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  const supported = new Set(locales);
  const parts = header.split(",");

  for (const part of parts) {
    const lang = part.trim().split(";")[0]?.toLowerCase();
    if (!lang) continue;
    if (supported.has(lang as (typeof locales)[number])) return lang;
    const base = lang.split("-")[0];
    if (supported.has(base as (typeof locales)[number])) return base;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore _next, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if the pathname already includes a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    // If the locale is 'en', redirect to the path without 'en'
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      const newPathname = pathname.replace(/^\/en/, "");
      const finalPath = newPathname === "" ? "/" : newPathname;
      return NextResponse.redirect(new URL(finalPath, request.url));
    }
    return;
  }

  // If no locale is present, we need to determine if we should rewrite to /en
  // Since 'en' is default, any path without locale should be handled as 'en'
  // But we need to rewrite it so the [lang] param is populated
  const locale = getLocale(request);

  if (locale === "en") {
    // Rewrite to /en/... so that the [lang] dynamic route catches it
    // but the URL in the browser remains without /en
    const newUrl = new URL(`/en${pathname}`, request.url);
    return NextResponse.rewrite(newUrl);
  }

  // Check if the user's preferred locale is NOT 'en' (e.g. 'fr')
  // If so, we should redirect them to their localized version?
  // Or do we just treat root as 'en' always unless they explicitly switch?
  // Current logic in original generic middleware forces redirect to preferred locale.
  // But standard behavior is often:
  // / -> default (en)
  // /fr -> fr

  // If we want to force redirect to preferred locale if it's not en:
  if (locale !== "en") {
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Fallback for when locale is 'en' (which we handled above with rewrite)
  // This part shouldn't be reached if logic holds, but acts as safety
  const newUrl = new URL(`/en${pathname}`, request.url);
  return NextResponse.rewrite(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
