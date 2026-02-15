import { Geist, Geist_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import QueryProvider from "@/components/common/QueryProvider";
import GlobalNavbar from "@/components/layout/GlobalNavbar";
import GlobalFooter from "@/components/layout/GlobalFooter";
import HomepageHydrator from "@/components/common/HomepageHydrator";
import { codeToId } from "@/lib/utils";
import "../[lang]/globals.css";

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

export default async function SitemapHtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const languageId = codeToId.en;
  const baseUrl = process.env.NEXT_PUBLIC_DB_URL;
  const homepageData = baseUrl
    ? await fetch(`${baseUrl}homepage/${languageId}`).then((res) => res.json())
    : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} bg-black text-white antialiased`}
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
