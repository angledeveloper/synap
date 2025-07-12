import { Metadata } from "next";
import { supportedLanguages } from "@/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/Querryprovider";

import GlobalNavbar from "./GlobalNavbar";
import GlobalFooter from "./GlobalFooter";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const { lang } = (await params) || "en";
  const langObj =
    supportedLanguages.find((l) => l.code === lang) || supportedLanguages[0];
  return {
    title: `Home | ${langObj.label}`,
    description: `Welcome to the ${langObj.label} version of our site.`,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        supportedLanguages.map((l) => [l.code, `/${l.code}`]),
      ),
    },
    openGraph: {
      locale: lang,
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
  params: { lang: string };
}) {
  const { lang } = (await params) || "en";
  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
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
