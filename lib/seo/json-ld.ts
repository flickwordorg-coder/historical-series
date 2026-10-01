import { siteConfig } from "@/lib/site/config";
import { absoluteUrl, clampMetaDescription, formatDuration, toIsoString, truncate } from "@/lib/utils";

import { canonicalForArchive, canonicalForSlug } from "./urls";

/**
 * Structured-data builders.
 *
 * Hard rule: **every property emitted must come from real CMS data.** No invented
 * ratings, review counts, view counts, actors, upload dates or durations. When a
 * value is missing the property is simply omitted — which is strictly better for
 * SEO than a plausible-looking lie.
 *
 * All builders return plain objects; `components/seo/JsonLd.tsx` is the only
 * place that turns them into a `<script>` tag.
 */

type Json = Record<string, unknown>;

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

/** Site-level graph: `WebSite` + `Organization`, emitted once in the root layout. */
export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function organizationJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.logo ? { logo: absoluteUrl(siteConfig.logo) } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Breadcrumbs                                                                */
/* -------------------------------------------------------------------------- */

export interface Crumb {
  name: string;
  /** Root-level slug or path, including the current page when available. */
  path?: string | null;
}

/** `BreadcrumbList` with a stable ID so page schemas can reference the trail. */
export function breadcrumbJsonLd(crumbs: Crumb[]): Json {
  const items = crumbs.filter((crumb) => crumb.name);
  if (items.length === 0) return {};
  const currentUrl = absoluteUrl(items[items.length - 1].path ?? "/");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${currentUrl}#breadcrumb`,
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Article                                                                    */
/* -------------------------------------------------------------------------- */

export interface ArticleInput {
  title: string;
  slug: string | null;
  description: string | null;
  body?: unknown;
  image?: string | null;
  imageAlt?: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  author?: string | null;
  keywords?: string[] | null;
  section?: string | null;
}

/**
 * `Article` for editorial content. Dates are only emitted when the CMS actually
 * has them.
 */
export function articleJsonLd(input: ArticleInput): Json {
  const url = canonicalForSlug(input.slug);
  const description = input.description
    ? clampMetaDescription(input.description)
    : undefined;

  return prune({
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: truncate(input.title, 110),
    url,
    ...(description ? { description } : {}),
    ...(input.image
      ? {
          image: {
            "@type": "ImageObject",
            url: input.image,
            ...(input.imageAlt ? { caption: input.imageAlt } : {}),
          },
        }
      : {}),
    ...(toIsoString(input.publishedAt) ? { datePublished: toIsoString(input.publishedAt) } : {}),
    ...(toIsoString(input.updatedAt) ? { dateModified: toIsoString(input.updatedAt) } : {}),
    ...(input.author ? { author: { "@type": "Person", name: input.author } } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.body ? { articleBody: input.body } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
  });
}

/* -------------------------------------------------------------------------- */
/* Video                                                                      */
/* -------------------------------------------------------------------------- */

export interface VideoInput {
  title: string;
  slug: string | null;
  description: string | null;
  thumbnail?: string | null;
  thumbnailAlt?: string | null;
  embedUrl: string | null;
  /** Real runtime in seconds. Omitted from JSON-LD when unknown. */
  duration?: number | null;
  uploadDate: string | null;
  seriesTitle?: string | null;
}

/**
 * `VideoObject` — only produced when a real, approved `embedUrl` exists.
 *
 * Deliberately omits `contentRating`, `actor`, `aggregateRating` and
 * `interactionStatistic`: none of those are backed by CMS data, and inventing
 * them is a manual-action risk.
 */
export function videoObjectJsonLd(input: VideoInput): Json | null {
  if (!input.embedUrl) return null;

  const url = canonicalForSlug(input.slug);
  const duration = formatDuration(input.duration);
  const description = input.description ? clampMetaDescription(input.description) : undefined;

  return prune({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: truncate(input.title, 100),
    url,
    ...(description ? { description } : {}),
    embedUrl: input.embedUrl,
    ...(input.thumbnail
      ? {
          thumbnailUrl: [input.thumbnail],
          ...(input.thumbnailAlt ? { caption: input.thumbnailAlt } : {}),
        }
      : {}),
    ...(duration ? { duration } : {}),
    ...(toIsoString(input.uploadDate) ? { uploadDate: toIsoString(input.uploadDate) } : {}),
    ...(input.seriesTitle ? { isPartOf: { "@type": "CreativeWorkSeries", name: input.seriesTitle } } : {}),
    publisher: { "@id": ORGANIZATION_ID },
  });
}

/* -------------------------------------------------------------------------- */
/* Collection / web page                                                      */
/* -------------------------------------------------------------------------- */

export interface CollectionInput {
  name: string;
  slug: string | null;
  description: string | null;
  image?: string | null;
  /** Only include an item count when the CMS genuinely produced one. */
  itemCount?: number | null;
  page?: number;
}

/** `CollectionPage` for archives, categories and series index pages. */
export function collectionPageJsonLd(input: CollectionInput): Json | null {
  const url = canonicalForArchive(canonicalForSlug(input.slug), input.page ?? 1);
  if (!url) return null;

  return prune({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: truncate(input.name, 100),
    ...(input.description ? { description: clampMetaDescription(input.description) } : {}),
    ...(input.image
      ? { primaryImageOfPage: { "@type": "ImageObject", url: input.image } }
      : {}),
    ...(input.itemCount ? { numberOfItems: input.itemCount } : {}),
    isPartOf: { "@id": WEBSITE_ID },
    ...(url ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
  });
}

/** `WebPage` used by plain content pages (legal, about, contact). */
export function webPageJsonLd(input: {
  title: string;
  slug: string | null;
  description: string | null;
  image?: string | null;
  modifiedAt?: string | null;
}): Json {
  const url = canonicalForSlug(input.slug);

  return prune({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: truncate(input.title, 100),
    ...(input.description ? { description: clampMetaDescription(input.description) } : {}),
    ...(input.image ? { primaryImageOfPage: { "@type": "ImageObject", url: input.image } } : {}),
    ...(toIsoString(input.modifiedAt) ? { dateModified: toIsoString(input.modifiedAt) } : {}),
    isPartOf: { "@id": WEBSITE_ID },
  });
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Recursively removes `undefined`/`null` so the emitted JSON-LD stays clean. */
function prune<T extends Json>(value: T): T {
  const output: Json = {};

  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === null) continue;
    if (typeof entry === "object" && !Array.isArray(entry)) {
      const nested = prune(entry as Json);
      if (Object.keys(nested).length > 0) output[key] = nested;
      continue;
    }
    output[key] = entry;
  }

  return output as T;
}