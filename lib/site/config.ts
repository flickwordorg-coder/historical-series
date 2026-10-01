/**
 * Single source of truth for site-wide identity, URLs and social handles.
 * Never duplicate these values anywhere else in the codebase.
 */

const DEFAULT_SITE_URL = "http://localhost:3000";

function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function readImageUrl(name: "NEXT_PUBLIC_LOGO_URL" | "NEXT_PUBLIC_DEFAULT_OG_IMAGE"): string {
  const value = process.env[name]?.trim() || "";
  return value.toLowerCase() === "/next.svg" || value.toLowerCase() === "/window.svg"
    ? ""
    : value;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Historical Series",
  shortName: "HistoricalSeries",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    "Watch historical Turkish series and movies with Urdu subtitles, and explore in-depth history articles.",
  url: readSiteUrl(),
  locale: "en_US",
  language: "en",
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim() || "",
  logo: readImageUrl("NEXT_PUBLIC_LOGO_URL") || "/logo.png",
  defaultOgImage: readImageUrl("NEXT_PUBLIC_DEFAULT_OG_IMAGE") || "/logo.png",
  contactEmail: "contact@example.com",
  foundedYear: 2023,
} as const;

export type SiteConfig = typeof siteConfig;

/** Breadcrumb label for the site root — never a duplicate of the brand name. */
export const HOME_CRUMB_LABEL = "Home";