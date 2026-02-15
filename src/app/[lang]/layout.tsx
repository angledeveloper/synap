import { Metadata } from "next";
import Script from "next/script";
import { supportedLanguages } from "@/lib/utils";
import {
  Geist,
  Geist_Mono,
  Orbitron,
  Space_Grotesk,
  Noto_Sans_Arabic,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/common/QueryProvider";

import GlobalNavbar from "@/components/layout/GlobalNavbar";
import GlobalFooter from "@/components/layout/GlobalFooter";
import HomepageHydrator from "@/components/common/HomepageHydrator";

import { codeToId } from "@/lib/utils";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-noto-kr",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sc",
});

function getScriptFontVariable(langCode: string) {
  switch (langCode) {
    case "ar":
      return notoSansArabic.variable;
    case "ja":
      return notoSansJP.variable;
    case "ko":
      return notoSansKR.variable;
    case "zh":
      return notoSansSC.variable;
    default:
      return "";
  }
}

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_DB_URL
      ? new URL(process.env.NEXT_PUBLIC_DB_URL).origin
      : null;
  } catch {
    return null;
  }
})();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const langObj =
    supportedLanguages.find((l) => l.code === langCode) ||
    supportedLanguages[0];

  const alternates: Record<string, string> = {};
  supportedLanguages.forEach((l) => {
    alternates[l.code] = l.code === "en" ? "/" : `/${l.code}`;
  });
  alternates["x-default"] = "/";

  return {
    metadataBase: new URL(`https://www.synapseaglobal.com`),
    title: `Home | ${langObj.label}`,
    description: `Welcome to the ${langObj.label} version of our site.`,
    alternates: {
      canonical: langCode === "en" ? "/" : `/${langCode}`,
      languages: alternates,
    },
    openGraph: {
      locale: langCode,
      title: `Home | ${langObj.label}`,
      description: `Welcome to the ${langObj.label} version of our site.`,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const scriptFontVariable = getScriptFontVariable(langCode);
  const languageId =
    codeToId[langCode as keyof typeof codeToId] || codeToId["en"];
  // Fetch homepage server-side
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  let homepageData = null;
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}homepage/${languageId}`);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("application/json")) {
        homepageData = await res.json();
      } else {
        console.error(
          `Homepage fetch returned ${res.status} with content-type ${contentType} for language ${languageId}`,
        );
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  }

  return (
    <html lang={langCode}>
      <head>
        <meta
          name="google-site-verification"
          content="aPd1gzb6sohn1LKvKuQrtOlN8XAkSpn4ee4Sxmj3J2k"
        />
        {apiOrigin && apiOrigin !== "https://www.synapseaglobal.com" && (
          <link rel="preconnect" href={apiOrigin} crossOrigin="" />
        )}
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin=""
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YNH1SG5DHK"
          strategy="beforeInteractive"
        />
        <Script id="ga4" strategy="beforeInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YNH1SG5DHK');
        `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} ${scriptFontVariable} bg-black text-white antialiased`}
      >
        <QueryProvider>
          {/* Hydrate Zustand store for HomePage on client */}
          <HomepageHydrator homepageData={homepageData} />
          <GlobalNavbar />
          <main>{children}</main>
          <GlobalFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
