import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";

import { ScrollTopButton } from "@/components/layout/ScrollTopButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLdSet } from "@/components/seo/JsonLd";
import { SEO, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site/config";

import "./globals.css";

/* -------------------------------------------------------------------------- */
/* Fonts                                                                      */
/* -------------------------------------------------------------------------- */

/** Display face for titles — the site's editorial voice. */
const display = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

/** Text face — optimised for long-form reading. */
const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: SEO.defaultTitle, template: SEO.titleTemplate },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    images: [{ url: siteConfig.defaultOgImage, alt: siteConfig.name }],
  },
  twitter: {
    card: SEO.twitter.card,
    images: [siteConfig.defaultOgImage],
    ...(siteConfig.twitterHandle
      ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.language} className={`${display.variable} ${sans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ink-950 font-sans antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
        >
          Skip to content
        </a>

        {/* Site-level structured data, emitted once for the whole site. */}
        <JsonLdSet nodes={[websiteJsonLd(), organizationJsonLd()]} />

        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        <SiteFooter />
        <ScrollTopButton />
      </body>
    </html>
  );
}