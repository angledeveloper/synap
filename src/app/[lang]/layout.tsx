import { Metadata } from "next";
import { supportedLanguages } from "@/lib/utils";
import { Geist, Geist_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/Queryprovider";

import GlobalNavbar from "./GlobalNavbar";
import GlobalFooter from "./GlobalFooter";

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
  variable: "--font-space-grotesk",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = (await params) || ({} as any);
  const langCode = lang || "en";
  const langObj =
    supportedLanguages.find((l) => l.code === langCode) || supportedLanguages[0];
  return {
    title: `Home | ${langObj.label}`,
    description: `Welcome to the ${langObj.label} version of our site.`,
    alternates: {
      canonical: `/${langCode}`,
      languages: Object.fromEntries(
        supportedLanguages.map((l) => [l.code, `/${l.code}`]),
      ),
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
  return (
    <html lang={langCode}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${spaceGrotesk.variable} bg-black text-white antialiased`}
      >
        <QueryProvider>
          <GlobalNavbar />
          <main>{children}</main>
          <GlobalFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
