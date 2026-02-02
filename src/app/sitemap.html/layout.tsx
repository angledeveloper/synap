import { Geist, Geist_Mono, Orbitron, Space_Grotesk, Noto_Sans_Arabic, Noto_Sans_JP, Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";
import QueryProvider from "@/components/common/QueryProvider";
import GlobalNavbar from "@/components/layout/GlobalNavbar";
import GlobalFooter from "@/components/layout/GlobalFooter";
import HomepageHydrator from "@/components/common/HomepageHydrator";
import { codeToId } from "@/lib/utils";
import "../[lang]/globals.css";

export const dynamic = "force-static";
export const revalidate = 3600;

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

export default async function SitemapHtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const languageId = codeToId.en;
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const homepageData = baseUrl
    ? await fetch(`${baseUrl}homepage/${languageId}`, {
        next: { revalidate: 3600 },
      }).then((res) => res.json())
    : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} ${notoSansArabic.variable} ${notoSansJP.variable} ${notoSansKR.variable} ${notoSansSC.variable} bg-black text-white antialiased`}
      >
        <QueryProvider>
          <HomepageHydrator homepageData={homepageData} />
          <GlobalNavbar />
          <main>{children}</main>
          <GlobalFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
