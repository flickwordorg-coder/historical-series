import { absoluteUrl, generateCanonicalUrl, paginatedUrl } from "@/lib/utils/url";

export { absoluteUrl, generateCanonicalUrl, paginatedUrl };

/**
 * Canonical URLs are built here and only here.
 *
 * Guarantees the SEO contract:
 *  - always absolute, always the configured site origin
 *  - always a clean root-level path ending in `/`
 *  - never carries a query string, fragment or tracking parameter
 */
export function canonicalForSlug(slug?: string | null): string {
  return generateCanonicalUrl(slug);
}

/** Canonical for index pages — page 1 is canonical, deeper pages self-canonical. */
export function canonicalForArchive(path: string, page: number): string {
  return page <= 1 ? absoluteUrl(path) : paginatedUrl(path, page);
}