import type { Metadata } from "next";

import type { PortableTextBlock } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/site/config";
import {
  clampMetaDescription,
  formatEpisodeNumber,
  formatSeasonNumber,
  plainTextFromPortableText,
  truncate,
} from "@/lib/utils";

import { SEO } from "./constants";
import { canonicalForArchive, canonicalForSlug } from "./urls";

/**
 * The single metadata factory for the whole site.
 *
 * Every page calls this — no page builds its own `title`, `openGraph`,
 * `twitter` or `robots` object. Guarantees:
 *  - canonical is absolute and query-free
 *  - robots respects the editor's `seo.noIndex`
 *  - `noindex` is also applied to anything published in the future (embargo)
 *  - Open Graph / Twitter images always resolve to an absolute URL
 */

export interface SeoSource {
  /** Root-level slug that owns the page. */
  slug?: string | null;
  /** Human title used when `seoTitle` is absent. */
  title: string;
  /** Rich text or plain description used when `seoDescription` is absent. */
  description?: PortableTextBlock[] | string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string[] | null;
  noIndex?: boolean | null;
  /** 1200×630 share image. */
  image?: string | null;
  imageAlt?: string | null;
  /** Publication date — used for `article:published_time`. */
  publishedAt?: string | null;
  modifiedAt?: string | null;
  author?: string | null;
  /** OG object type; defaults to `website`. */
  type?: "website" | "article" | "video.other";
  /** Only set for videos — drives `og:video`. */
  embedUrl?: string | null;
  /** Page number for archive pages. */
  page?: number;
}

function resolveDescription(source: SeoSource): string {
  if (source.seoDescription?.trim()) return clampMetaDescription(source.seoDescription.trim());

  const fromBody =
    typeof source.description === "string"
      ? source.description
      : plainTextFromPortableText(source.description ?? null);

  if (fromBody.trim()) return clampMetaDescription(fromBody.trim());

  return SEO.defaultDescription;
}

function resolveTitle(source: SeoSource, maxLength: number = SEO.titleLength): string {
  if (source.seoTitle?.trim()) return truncate(source.seoTitle.trim(), maxLength);
  return truncate(source.title, maxLength);
}

/**
 * `noindex` when the editor requested it or the document is embargoed.
 */
function resolveRobots(source: SeoSource): Metadata["robots"] {
  if (source.noIndex) return SEO.robots.noIndex;
  if (source.publishedAt && new Date(source.publishedAt).getTime() > Date.now()) {
    return SEO.robots.noIndex;
  }
  return SEO.robots.index;
}

export interface GenerateMetadataOptions {
  /**
   * Root-level slug for the canonical URL. Omit for the homepage, or pass an
   * explicit canonical for paginated archives.
   */
  canonical?: string;
  /** Suppresses the `| Brand` template (the homepage sets its own full title). */
  absoluteTitle?: boolean;
}

export function generateContentMetadata(
  source: SeoSource,
  options: GenerateMetadataOptions = {},
): Metadata {
  const titleLength = options.absoluteTitle
    ? SEO.titleLength
    : Math.max(1, SEO.titleLength - siteConfig.name.length - 3);
  const title = resolveTitle(source, titleLength);
  const pageSuffix = source.page && source.page > 1 ? ` - Page ${source.page}` : "";
  const pageTitle = pageSuffix
    ? `${truncate(title, titleLength - pageSuffix.length)}${pageSuffix}`
    : title;
  const description = resolveDescription(source);
  const canonical = options.canonical ?? canonicalForSlug(source.slug);
  const image = source.image?.trim() || siteConfig.defaultOgImage;
  const images = image ? [{ url: absoluteImage(image), alt: source.imageAlt ?? source.title }] : undefined;

  const ogType = source.type ?? "website";

  return {
    title: options.absoluteTitle ? { absolute: pageTitle } : pageTitle,
    description,
    keywords: source.keywords?.length ? source.keywords : undefined,
    alternates: { canonical },
    authors: source.author ? [{ name: source.author }] : undefined,
    robots: resolveRobots(source),
    openGraph: {
      type: ogType,
      title: pageTitle,
      description,
      url: canonical,
      siteName: SEO.og.siteName,
      locale: SEO.og.locale,
      images,
      ...(ogType === "article"
        ? {
            publishedTime: source.publishedAt ?? undefined,
            modifiedTime: source.modifiedAt ?? source.publishedAt ?? undefined,
            authors: source.author ? [source.author] : undefined,
          }
        : {}),
      ...(source.embedUrl && ogType !== "article" ? { videos: [source.embedUrl] } : {}),
    },
    twitter: {
      card: SEO.twitter.card,
      title: pageTitle,
      description,
      images: images?.map((image) => image.url),
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle } : {}),
    },
  };
}

/** Absolute-ises a possibly relative share image URL. */
function absoluteImage(image: string): string {
  return /^https?:\/\//i.test(image) ? image : new URL(image, siteConfig.url).toString();
}

/* -------------------------------------------------------------------------- */
/* Convenience wrappers — identical rules, less call-site noise               */
/* -------------------------------------------------------------------------- */

export function generateHomeMetadata(input: {
  title?: string | null;
  description?: string | null;
  keywords?: string[] | null;
  image?: string | null;
}): Metadata {
  return generateContentMetadata(
    {
      slug: null,
      title: input.title?.trim() || SEO.defaultTitle,
      description: input.description?.trim() || SEO.defaultDescription,
      keywords: input.keywords,
      image: input.image,
      imageAlt: SEO.defaultTitle,
    },
    { canonical: "/", absoluteTitle: true },
  );
}

export function generateArchiveMetadata(input: {
  title: string;
  description?: SeoSource["description"];
  canonical: string;
  image?: string | null;
  keywords?: string[] | null;
  page?: number;
  noIndex?: boolean | null;
  publishedAt?: string | null;
}): Metadata {
  const page = input.page ?? 1;

  return generateContentMetadata(
    {
      slug: null,
      title: input.title,
      description: input.description,
      keywords: input.keywords,
      image: input.image,
      page,
      noIndex: input.noIndex,
      publishedAt: input.publishedAt,
    },
    { canonical: canonicalForArchive(input.canonical, page) },
  );
}

/** `"Sultan Muhammad Fateh Episode 85 with Urdu Subtitles"` — one phrasing. */
export function formatEpisodeTitle(seriesTitle: string | null | undefined, title: string): string {
  if (!seriesTitle) return title;
  const label = title.toLowerCase();
  return label.includes(seriesTitle.toLowerCase()) ? title : `${seriesTitle} ${title}`;
}

export { formatEpisodeNumber, formatSeasonNumber };