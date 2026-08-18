import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { site } from "@/lib/site";
import "./globals.css";

/**
 * Inter throughout, carrying the full weight range. One family used across a
 * wide weight span reads as more deliberate than two families fighting each
 * other, and it holds up at small sizes on the low-end Android devices most of
 * our visitors use. The boldness comes from weight, not from a second face.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    // Every page appends the org name, which is what shows in a search result.
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.legalName,
  keywords: [
    "HIV prevention Kenya",
    "HIV testing services",
    "TB screening",
    "cervical cancer screening",
    "gender-based violence support",
    "GBV survivor services",
    "HPV vaccination",
    "reusable sanitary pads",
    "adolescent girls health",
    "community health NGO Kenya",
    "Ujasiri Community Care",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitterHandle,
    creator: site.twitterHandle,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "nonprofit",
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#0a1f44",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-KE"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-navy-950">
        {children}
      </body>
    </html>
  );
}
