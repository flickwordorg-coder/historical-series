/**
 * The one place URLs are built. Guarantees:
 *  - absolute URLs always use the configured site origin
 *  - canonical/document URLs are absolute, lowercase-safe and NEVER contain
 *    query strings or fragments (required by the SEO contract)
 */

import { siteConfig } from "@/lib/site/config";
import { rootPath } from "@/lib/site/routes";

/**
 * Builds a canonical absolute URL from a root-level slug.
 * `generateCanonicalUrl("sultan-muhammad-fateh")` →
 * `https://site.com/sultan-muhammad-fateh/`
 */
export function generateCanonicalUrl(slug?: string | null): string {
  return absoluteUrl(rootPath(slug));
}

/** Joins the site origin with a path, tolerating a missing/relative input. */
export function absoluteUrl(path = "/"): string {
  const raw = path.trim();
  if (/^https?:\/\//i.test(raw)) return raw;

  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const [pathname, ...rest] = withLeadingSlash.split(/[?#]/);
  const normalizedPath = pathname.replace(/\/{2,}/g, "/");
  const suffix = rest.length ? `?${rest.join("?")}` : "";
  return `${siteConfig.url}${normalizedPath}${suffix}`;
}

/** Builds a URL for a paginated listing page (only listings carry query params). */
export function paginatedUrl(path: string, page: number): string {
  return page <= 1 ? absoluteUrl(path) : absoluteUrl(`${path}?page=${page}`);
}