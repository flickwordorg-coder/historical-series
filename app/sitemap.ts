import type { MetadataRoute } from "next";

import { getSitemapRows, isSanityConfigured } from "@/lib/sanity";
import { STATIC_ROUTES } from "@/lib/site/routes";
import { siteConfig } from "@/lib/site/config";
import type { ChangeFrequency, SitemapEntry } from "@/lib/sanity/types";

/**
 * Dynamic sitemap.
 *
 * Static routes come from `STATIC_ROUTES`; every document URL comes from one
 * GROQ projection in `GET_SITEMAP_ROWS`. `lastModified` uses the CMS
 * `updatedAt`/`publishedAt` and never an invented timestamp, and per-type
 * priorities encode the site's actual hierarchy (episodes matter more than
 * season landing pages).
 */

export const revalidate = 86400;

/** Relative importance, by content type. */
const PRIORITY: Record<string, number> = {
  home: 1,
  series: 0.9,
  episode: 0.7,
  season: 0.6,
  movie: 0.7,
  blogPost: 0.7,
  category: 0.5,
  page: 0.3,
};

/** Crawl cadence, by content type. */
const FREQUENCY: Record<string, ChangeFrequency> = {
  home: "daily",
  series: "weekly",
  episode: "weekly",
  season: "monthly",
  movie: "monthly",
  blogPost: "weekly",
  category: "weekly",
  page: "yearly",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: null,
    changeFrequency:
      route.path === "/"
        ? FREQUENCY.home
        : route.path === "/turkish-movies/"
          ? FREQUENCY.movie
          : route.path === "/categories/"
            ? FREQUENCY.category
            : route.path === "/blog/"
              ? FREQUENCY.blogPost
              : FREQUENCY.series,
    priority: route.priority,
  }));

  if (isSanityConfigured()) {
    const rows = await getSitemapRows();

    for (const row of rows) {
      entries.push({
        url: `${siteConfig.url}${row.path}`,
        lastModified: toDate(row.lastModified),
        changeFrequency: FREQUENCY[row.type] ?? "monthly",
        priority: PRIORITY[row.type] ?? 0.5,
      });
    }
  }

  // `lastModified` is omitted for static routes rather than guessed — an
  // invented timestamp would be a lie in the sitemap.
  return entries.map((entry) => ({
    url: entry.url,
    ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

/** `null` → `null`; anything unparseable is dropped rather than faked. */
function toDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
