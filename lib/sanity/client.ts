import "server-only";

import { createClient, type SanityClient } from "next-sanity";

/**
 * Env access is centralised and validated so every module fails the same,
 * legible way instead of crashing on a half-set variable.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const API_VERSION = process.env.SANITY_API_VERSION?.trim() || "2026-09-30";

/** Pinned per read so a future API change cannot silently alter live output. */
export const SANITY_API_VERSION = API_VERSION;
export const SANITY_DATASET = DATASET;

/**
 * True when a real project id is configured. A function (not a const) so the
 * value is read at call time, which keeps it correct in tests and in any code
 * path that builds before env loading finishes.
 */
export function isSanityConfigured(): boolean {
  return Boolean(PROJECT_ID);
}

/**
 * When set, Sanity failures throw instead of degrading to an empty state.
 * Recommended in CI so a broken CMS contract fails the build loudly.
 */
export const isSanityStrict =
  process.env.SANITY_STRICT_MODE?.trim().toLowerCase() === "true";

let client: SanityClient | null = null;

/**
 * Lazily created, request-cached client.
 *
 * - `useCdn` + `perspective: 'published'` for fast, cacheable public reads.
 * - A write token is read here but is NEVER sent to the browser: this module is
 *   server-only (it is imported by `queries.ts`, which is imported by
 *   Server Components and route handlers only).
 */
export function getSanityClient(): SanityClient {
  if (client) return client;

  client = createClient({
    projectId: PROJECT_ID || "placeholder",
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: true,
    perspective: "published",
    stega: false,
    ignoreBrowserTokenWarning: true,
  });

  return client;
}

/** Read client for authenticated server reads (revalidation webhooks). */
export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!token || !PROJECT_ID) return null;

  return getSanityClient().withConfig({
    token,
    useCdn: false,
    perspective: "raw",
  });
}

/** Cache tag helpers — one place so tags stay consistent with query names. */
export const sanityTag = {
  all: "sanity:all",
  content: "sanity:content",
  series: (id?: string) => (id ? `sanity:series:${id}` : "sanity:series"),
  season: (id?: string) => (id ? `sanity:season:${id}` : "sanity:season"),
  episode: (id?: string) => (id ? `sanity:episode:${id}` : "sanity:episode"),
  movie: (id?: string) => (id ? `sanity:movie:${id}` : "sanity:movie"),
  blogPost: (id?: string) => (id ? `sanity:blogPost:${id}` : "sanity:blogPost"),
  category: (id?: string) => (id ? `sanity:category:${id}` : "sanity:category"),
  settings: "sanity:settings",
  sitemap: "sanity:sitemap",
  slugs: "sanity:slugs",
  search: "sanity:search",
} as const;

/** Stale-while-revalidate windows, tuned per content volatility. */
export const REVALIDATE = {
  /** Episodes change often — short window keeps listings fresh. */
  episodes: 300,
  /** Series / movies / blog change rarely. */
  content: 3600,
  /** Aggregations (homepage rails, category counts) are expensive; cache longer. */
  aggregates: 1800,
  /** Slug lists only change on publish/unpublish. */
  slugs: 86400,
} as const;