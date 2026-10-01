/**
 * Route registry.
 *
 * Everything that is NOT a Sanity-backed document lives here, so we can:
 *  1. Give the CMS a list of slugs it must never hand out (prevents route shadowing).
 *  2. Resolve internal links without hard-coding "/about-us" strings in components.
 *  3. Feed the sitemap with the static (non-document) URLs.
 */

/** Slugs owned by Next.js route segments — never assign these in the Studio. */
export const RESERVED_SLUGS = [
  "",
  "turkish-series",
  "turkish-movies",
  "blog",
  "categories",
  "search",
  "studio",
  "api",
  "_next",
  "sitemap",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
] as const;

/**
 * Documents that must always exist in the CMS for the legal footer to work.
 * Kept here (not in navigation) because footer + sitemap both need them.
 */
export const STATIC_PAGE_SLUGS = [
  "about-us",
  "contact-us",
  "privacy-policy",
  "terms-and-conditions",
  "disclaimer",
  "dmca",
] as const;

export type StaticPageSlug = (typeof STATIC_PAGE_SLUGS)[number];

/** Static, non-document URLs that belong in the sitemap. */
export const STATIC_ROUTES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/turkish-series/", priority: 0.9 },
  { path: "/turkish-movies/", priority: 0.8 },
  { path: "/blog/", priority: 0.8 },
  { path: "/categories/", priority: 0.7 },
];

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.trim().toLowerCase());
}

/** `/` for the home crumb, `/{slug}/` for everything else. Never produces a double slash. */
export function rootPath(slug?: string | null): string {
  const value = (slug ?? "").trim().replace(/^\/+|\/+$/g, "");
  return value ? `/${value}/` : "/";
}