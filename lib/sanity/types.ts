/**
 * Shared content types.
 *
 * These mirror the GROQ projections in `lib/sanity/queries.ts` — if a projection
 * changes, the matching interface changes here. Nothing else in the app is
 * allowed to invent its own document shape.
 *
 * Two projection depths exist for every document type:
 *  - `*Card`  — lean fields only, used by grids, rails, search and the sitemap.
 *  - `Series` / `Episode` / … — the full document, used by detail templates.
 *
 * A full document structurally satisfies its `*Card` interface, so the single
 * `toCard()` adapter serves both. Card formatting exists in exactly one place.
 */

import type { PortableTextBlock } from "@portabletext/types";

export type { PortableTextBlock };

/** Canonical content types. */
export const CONTENT_TYPES = [
  "episode",
  "series",
  "season",
  "movie",
  "blogPost",
  "category",
  "page",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/**
 * Deterministic resolution order for `app/[slug]/page.tsx`.
 * Episodes resolve first because an episode slug always embeds its series slug
 * (`…-episode-85-…`) and is therefore the most specific interpretation.
 */
export const CONTENT_TYPE_ORDER: readonly ContentType[] = [
  "episode",
  "series",
  "season",
  "movie",
  "blogPost",
  "category",
  "page",
];

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

export type Slug = { current: string };

/** Normalized image shape produced by the GROQ `IMAGE` projection. */
export interface SanityImage {
  asset: {
    _ref: string;
    url: string | null;
    metadata: {
      lqip: string | null;
      dimensions: { width: number; height: number; aspectRatio: number } | null;
    } | null;
  } | null;
  alt: string | null;
  hotspot: { x: number; y: number } | null;
}

/** Fields every document carries (denormalized from the `seo` object). */
export interface SeoProjection {
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[] | null;
  noIndex: boolean | null;
}

export interface Timestamps {
  publishedAt: string | null;
  updatedAt: string | null;
}

/** A minimal reference, always projected as `{ id, title, slug }`. */
export interface Reference {
  id: string;
  title: string;
  slug: string | null;
}

/* -------------------------------------------------------------------------- */
/* Card projections                                                          */
/* -------------------------------------------------------------------------- */

interface CardBase {
  _id: string;
  title: string;
  slug: string | null;
}

export interface SeriesCard extends CardBase {
  _type: "series";
  poster: SanityImage | null;
  status: string | null;
  releaseYear: number | null;
  country: string | null;
}

export interface SeasonCard extends CardBase {
  _type: "season";
  poster: SanityImage | null;
  seasonNumber: number | null;
  series: Reference | null;
}

/**
 * Season card plus the two counters the series season switcher needs. Kept
 * separate from `SeasonCard` so list/query code stays honest about which
 * projection it received.
 */
export interface SeasonTab extends SeasonCard {
  hasPublicSlug: boolean;
  episodeCount: number;
}

export interface EpisodeCard extends CardBase {
  _type: "episode";
  thumbnail: SanityImage | null;
  episodeNumber: number | null;
  seasonNumber: number | null;
  series: Reference | null;
  duration: number | null;
  noIndex: boolean | null;
}

export interface MovieCard extends CardBase {
  _type: "movie";
  poster: SanityImage | null;
  releaseYear: number | null;
  language: string | null;
  country: string | null;
}

export interface BlogPostCard extends CardBase {
  _type: "blogPost";
  featuredImage: SanityImage | null;
  author: string | null;
  publishedAt: string | null;
}

export interface CategoryCard extends CardBase {
  _type: "category";
  image: SanityImage | null;
  itemCount: number | null;
}

export interface PageCard extends CardBase {
  _type: "page";
  image: SanityImage | null;
}

export type CardSource =
  | SeriesCard
  | SeasonCard
  | EpisodeCard
  | MovieCard
  | BlogPostCard
  | CategoryCard
  | PageCard;

/* -------------------------------------------------------------------------- */
/* Full documents                                                            */
/* -------------------------------------------------------------------------- */

export interface Series extends SeriesCard, Timestamps, SeoProjection {
  _type: "series";
  description: PortableTextBlock[] | null;
  banner: SanityImage | null;
  logo: SanityImage | null;
  language: string | null;
  genres: string[] | null;
  featured: boolean | null;
  episodeCount?: number | null;
  seasonCount?: number | null;
}

export interface Season extends SeasonCard, Timestamps, SeoProjection {
  _type: "season";
  description: PortableTextBlock[] | null;
  banner: SanityImage | null;
  /** True only when the season owns a unique public slug (i.e. is publicly reachable). */
  hasPublicSlug: boolean;
  episodeCount?: number | null;
}

export interface Episode extends EpisodeCard, Timestamps, SeoProjection {
  _type: "episode";
  description: PortableTextBlock[] | null;
  embedUrl: string | null;
  videoType: string | null;
  season: Reference | null;
}

export interface Movie extends MovieCard, Timestamps, SeoProjection {
  _type: "movie";
  description: PortableTextBlock[] | null;
  banner: SanityImage | null;
  logo: SanityImage | null;
  embedUrl: string | null;
  videoType: string | null;
  duration: number | null;
  genres: string[] | null;
}

export interface BlogPost extends BlogPostCard, Timestamps, SeoProjection {
  _type: "blogPost";
  excerpt: string | null;
  body: PortableTextBlock[] | null;
  categories: Reference[] | null;
  tags: string[] | null;
  updatedAt: string | null;
}

export interface Category extends CategoryCard, Timestamps, SeoProjection {
  _type: "category";
  description: PortableTextBlock[] | null;
  /** Optional link to the series this category represents. */
  series: Reference | null;
}

export interface Page extends PageCard, Timestamps, SeoProjection {
  _type: "page";
  description: PortableTextBlock[] | null;
  body: PortableTextBlock[] | null;
  hideFromNavigation: boolean | null;
}

export interface SiteSettings {
  _id: string;
  siteTitle: string | null;
  siteDescription: string | null;
  defaultOgImage: SanityImage | null;
  homepageSeoTitle: string | null;
  homepageSeoDescription: string | null;
  homepageSeoContent: PortableTextBlock[] | null;
  featuredSeriesSlugs: string[] | null;
}

/* -------------------------------------------------------------------------- */
/* Resolution union                                                          */
/* -------------------------------------------------------------------------- */

export interface ContentResolutionSlots {
  episode: Episode | null;
  series: Series | null;
  season: Season | null;
  movie: Movie | null;
  blogPost: BlogPost | null;
  category: Category | null;
  page: Page | null;
}

export type ContentDocument = {
  [K in ContentType]: { type: K; document: Extract<Series | Season | Episode | Movie | BlogPost | Category | Page, { _type: K }> };
}[ContentType];

/** Every full document, regardless of type. */
export type AnyContentDocument =
  | Series
  | Season
  | Episode
  | Movie
  | BlogPost
  | Category
  | Page;

/**
 * The single artwork field for a document.
 *
 * Each type stores its key image under a different name (`poster`, `thumbnail`,
 * `featuredImage`, `image`), so every consumer that needs "the picture for this
 * document" — metadata, JSON-LD, share images — calls this instead of branching
 * on `_type` itself.
 */
export function primaryImageOf(document: AnyContentDocument): SanityImage | null {
  switch (document._type) {
    case "series":
    case "season":
    case "movie":
      return document.poster ?? document.banner;
    case "episode":
      return document.thumbnail;
    case "blogPost":
      return document.featuredImage;
    case "category":
    case "page":
      return document.image;
  }
}

/** The byline, which only exists on articles. */
export function authorOf(document: AnyContentDocument): string | null {
  return document._type === "blogPost" ? document.author : null;
}

/** The CMS-supplied player URL, which only exists on episodes and movies. */
export function embedUrlOf(document: AnyContentDocument): string | null {
  return document._type === "episode" || document._type === "movie" ? document.embedUrl : null;
}

/** Fields that only some document types carry, normalised for `generateContentMetadata`. */
export function seoFieldsOf(document: AnyContentDocument): {
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[] | null;
  noIndex: boolean | null;
} {
  return {
    seoTitle: document.seoTitle,
    seoDescription: document.seoDescription,
    keywords: document.keywords,
    noIndex: document.noIndex,
  };
}

/* -------------------------------------------------------------------------- */
/* Cards, search, sitemap                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The minimal shape `ContentCard` needs. One adapter (`toCard`) produces it from
 * every projection, which is what keeps `ContentCard` / `ContentGrid` generic.
 */
export interface ContentCardData {
  _id: string;
  _type: ContentType;
  title: string;
  slug: string | null;
  image: SanityImage | null;
  /** Small label rendered on the artwork, e.g. `Episode 85`. */
  badge: string | null;
  /** Pre-composed meta line: `Season 4 · 42m`. */
  meta: string | null;
  /** Trailing element: series title, release year, author. */
  subtitle: string | null;
  /** Optional 1-based index for numbered rails. */
  rank: number | null;
  noIndex: boolean | null;
}

/** Result row for the search surfaces. */
export interface SearchResult extends ContentCardData {
  typeLabel: string;
}

export interface SitemapRow {
  path: string;
  lastModified: string | null;
  type: ContentType | "home";
}

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/** A single URL for `app/sitemap.ts`. */
export interface SitemapEntry {
  url: string;
  lastModified: Date | null;
  changeFrequency: ChangeFrequency;
  priority: number;
  alternates?: { languages?: Record<string, string> };
}

/** Paginated list envelope used by every index/archive page. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/* -------------------------------------------------------------------------- */
/* Home                                                                       */
/* -------------------------------------------------------------------------- */

export interface HomePageData {
  settings: SiteSettings | null;
  hero: ContentCardData | null;
  featuredSeries: ContentCardData[];
  latestEpisodes: ContentCardData[];
  popularSeries: ContentCardData[];
  movies: ContentCardData[];
  articles: ContentCardData[];
  categories: ContentCardData[];
  isEmpty: boolean;
}

/* -------------------------------------------------------------------------- */
/* Cards & labels                                                             */
/* -------------------------------------------------------------------------- */

/** Human label for a content type — used by search results, rails and metadata. */
export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  episode: "Episode",
  series: "Series",
  season: "Season",
  movie: "Movie",
  blogPost: "Article",
  category: "Category",
  page: "Page",
};

/**
 * THE card adapter. Every grid, rail, search result and related-content block in
 * the app passes through this function — badge/meta/subtitle wording is defined
 * exactly once per content type.
 */
export function toCard(source: CardSource): ContentCardData {
  const base = {
    _id: source._id,
    _type: source._type,
    title: source.title,
    slug: source.slug,
    image: null,
    badge: null,
    meta: null,
    subtitle: null,
    rank: null,
    noIndex: null,
  };

  switch (source._type) {
    case "episode":
      return {
        ...base,
        image: source.thumbnail,
        badge: source.episodeNumber ? `Episode ${source.episodeNumber}` : "Episode",
        meta:
          source.seasonNumber && source.duration
            ? `Season ${source.seasonNumber} · ${formatMinutes(source.duration)}`
            : source.seasonNumber
              ? `Season ${source.seasonNumber}`
              : source.duration
                ? formatMinutes(source.duration)
                : null,
        subtitle: source.series?.title ?? null,
        noIndex: source.noIndex ?? null,
      };
    case "series":
      return {
        ...base,
        image: source.poster,
        badge: source.status?.trim() || "Series",
        meta: source.releaseYear ? String(source.releaseYear) : null,
        subtitle: source.country,
      };
    case "season":
      return {
        ...base,
        image: source.poster,
        badge: source.seasonNumber ? `Season ${source.seasonNumber}` : "Season",
        meta: source.series?.title ?? null,
      };
    case "movie":
      return {
        ...base,
        image: source.poster,
        badge: source.releaseYear ? String(source.releaseYear) : "Movie",
        meta: [source.language, source.country].filter(Boolean).join(" · ") || null,
      };
    case "blogPost":
      return { ...base, image: source.featuredImage, badge: "Article", subtitle: source.author };
    case "category":
      return { ...base, image: source.image, badge: "Category" };
    case "page":
      return { ...base, image: source.image };
  }
}

/** Local helper — kept private to avoid a circular import with `lib/utils`. */
function formatMinutes(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${Math.max(minutes, 1)}m`;
}