import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_NAME = "FairRentWize";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fairrentwize.com";
const GA_ID = "G-Y95BZ0SEQR";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - US Fair Market Rents & Rental Affordability Data`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Explore HUD Fair Market Rents for 3,000+ US counties and 400 metro areas. Compare rental costs, calculate affordability, and find rent burden data by location.",
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${GA_ID}")` }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5724806562146685"
          crossOrigin="anonymous"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "FairRentWize",
              "url": "https://fairrentwize.com",
              "description": "Explore HUD Fair Market Rents for 3,000+ US counties and 400 metro areas. Compare rental costs, calculate affordability, and find rent burden data by location.",
              "inLanguage": "en-US"
            },
            {
              "@type": "Organization",
              "name": "FairRentWize",
              "url": "https://fairrentwize.com",
              "description": "Explore HUD Fair Market Rents for 3,000+ US counties and 400 metro areas. Compare rental costs, calculate affordability, and find rent burden data by location.",
              "sameAs": []
            }
          ]
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600">{SITE_NAME}</a>
            <nav className="flex gap-6 text-sm">
              <a href="/calculator/" className="hover:text-indigo-600">Calculator</a>
              <a href="/state/california/" className="hover:text-indigo-600">States</a>
              <a href="/compare/california-vs-texas/" className="hover:text-indigo-600">Compare</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p>Data based on HUD Fair Market Rents (FY 2026) and U.S. Census Bureau estimates.</p>
            <p className="mt-2">
              <a href="/about/" className="hover:text-indigo-600">About</a>{" | "}
              <a href="/privacy/" className="hover:text-indigo-600">Privacy</a>{" | "}
              <a href="/terms/" className="hover:text-indigo-600">Terms</a>{" | "}
              <a href="/contact/" className="hover:text-indigo-600">Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://costbycity.com" className="hover:text-indigo-600">Cost of Living</a>
                <a href="https://zippeek.com" className="hover:text-indigo-600">ZIP Codes</a>
                <a href="https://propertytaxpeek.com" className="hover:text-indigo-600">Property Tax</a>
                <a href="https://guidebycity.com" className="hover:text-indigo-600">City Guides</a>
                <a href="https://powerbillpeek.com" className="hover:text-indigo-600">Power Bills</a>
              </div>
            </div>
            <p className="mt-1">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
