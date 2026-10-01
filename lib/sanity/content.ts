import "server-only";

import { cache } from "react";

import { STATIC_PAGE_SLUGS } from "@/lib/site/routes";

import { REVALIDATE, sanityTag } from "./client";
import { sanityFetch } from "./fetch";
import * as Q from "./queries";
import {
  CONTENT_TYPE_LABEL,
  CONTENT_TYPE_ORDER,
  toCard,
  type BlogPost,
  type BlogPostCard,
  type CardSource,
  type Category,
  type CategoryCard,
  type ContentCardData,
  type ContentDocument,
  type ContentResolutionSlots,
  type ContentType,
  type Episode,
  type EpisodeCard,
  type HomePageData,
  type Movie,
  type MovieCard,
  type Page,
  type Paginated,
  type SearchResult,
  type Season,
  type SeasonCard,
  type SeasonTab,
  type Series,
  type SeriesCard,
  type SiteSettings,
  type SitemapRow,
} from "./types";

/**
 * The application's entire read surface.
 *
 * Everything above this layer (pages, templates, components) receives data via
 * props or calls one of these functions — no component ever touches GROQ, the
 * Sanity client, or the Content Lake directly.
 *
 * Every export is wrapped in React `cache()`, so two components on the same page
 * requesting the same document cost exactly one round trip.
 */

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

/** GROQ slice bounds from a 1-based page number. */
function slice(page: number, pageSize: number): { offset: number; end: number } {
  const safePage = Math.max(1, Math.trunc(page) || 1);
  const safeSize = Math.max(1, Math.trunc(pageSize) || 1);
  const offset = (safePage - 1) * safeSize;
  return { offset, end: offset + safeSize };
}

function paginated<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  const safeSize = Math.max(1, pageSize);
  return {
    items,
    total,
    page: Math.max(1, page),
    pageSize: safeSize,
    pageCount: Math.max(1, Math.ceil(total / safeSize)),
  };
}

/** Wraps a resolved slot in the discriminated union, preserving type safety. */
function toContentDocument<K extends ContentType>(
  type: K,
  document: ContentResolutionSlots[K] | null | undefined,
): ContentDocument | null {
  if (!document) return null;
  return { type, document } as ContentDocument;
}

const EMPTY_SLOTS: ContentResolutionSlots = {
  episode: null,
  series: null,
  season: null,
  movie: null,
  blogPost: null,
  category: null,
  page: null,
};

/** Cards from any card projection, skipping entries that cannot be linked. */
function toCards<T extends CardSource>(
  sources: readonly T[] | null | undefined,
): ContentCardData[] {
  if (!sources?.length) return [];
  return sources.filter((source) => Boolean(source?.slug)).map(toCard);
}

/** Attaches a 1-based index for numbered rails. */
function withRank(cards: readonly ContentCardData[]): ContentCardData[] {
  return cards.map((card, index) => ({ ...card, rank: index + 1 }));
}

interface IndexPayload<T> {
  total: number;
  items: T[];
}

/* -------------------------------------------------------------------------- */
/* 1. Flat slug resolution                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Resolves a root-level slug to exactly one document.
 *
 * One Content Lake request returns a slot per content type; the winner is picked
 * by walking `CONTENT_TYPE_ORDER`, so resolution is deterministic and cheap.
 * Returns `null` when nothing owns the slug — the caller renders `notFound()`.
 */
export const getContentBySlug = cache(async (slug: string): Promise<ContentDocument | null> => {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const slots = await sanityFetch<ContentResolutionSlots>({
    query: Q.RESOLVE_BY_SLUG,
    params: { slug: normalized },
    fallback: EMPTY_SLOTS,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.content, sanityTag.sitemap],
    label: "resolveBySlug",
  });

  for (const type of CONTENT_TYPE_ORDER) {
    const found = toContentDocument(type, slots[type]);
    if (found) return found;
  }
  return null;
});

/* -------------------------------------------------------------------------- */
/* 2. Single-document lookups                                                 */
/* -------------------------------------------------------------------------- */

export const getSeriesBySlug = cache(async (slug: string): Promise<Series | null> =>
  sanityFetch<Series | null>({
    query: Q.GET_SERIES_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.series()],
    label: "getSeriesBySlug",
  }),
);

export const getSeasonBySlug = cache(async (slug: string): Promise<Season | null> =>
  sanityFetch<Season | null>({
    query: Q.GET_SEASON_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.season()],
    label: "getSeasonBySlug",
  }),
);

export const getEpisodeBySlug = cache(async (slug: string): Promise<Episode | null> =>
  sanityFetch<Episode | null>({
    query: Q.GET_EPISODE_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.episodes,
    tags: [sanityTag.episode()],
    label: "getEpisodeBySlug",
  }),
);

export const getMovieBySlug = cache(async (slug: string): Promise<Movie | null> =>
  sanityFetch<Movie | null>({
    query: Q.GET_MOVIE_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.movie()],
    label: "getMovieBySlug",
  }),
);

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> =>
  sanityFetch<BlogPost | null>({
    query: Q.GET_BLOG_POST_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.blogPost()],
    label: "getBlogPostBySlug",
  }),
);

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> =>
  sanityFetch<Category | null>({
    query: Q.GET_CATEGORY_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.category()],
    label: "getCategoryBySlug",
  }),
);

export const getPageBySlug = cache(async (slug: string): Promise<Page | null> =>
  sanityFetch<Page | null>({
    query: Q.GET_PAGE_BY_SLUG,
    params: { slug: slug.trim().toLowerCase() },
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.content],
    label: "getPageBySlug",
  }),
);

/* -------------------------------------------------------------------------- */
/* 3. Detail page payloads (at most two round trips per page)                 */
/* -------------------------------------------------------------------------- */

export interface SeriesPageData {
  series: Series | null;
  seasons: SeasonTab[];
  latestEpisodes: ContentCardData[];
  seasonCount: number;
  episodeCount: number;
}

/** The raw `GET_SERIES_PAGE_DATA` projection, before card adaptation. */
interface SeriesPageRaw {
  series: Series | null;
  seasons: SeasonTab[];
  latestEpisodes: EpisodeCard[];
  seasonCount: number;
  episodeCount: number;
}

export const getSeriesPageData = cache(
  async (slug: string, latestLimit = 12): Promise<SeriesPageData> => {
    const data = await sanityFetch<SeriesPageRaw>({
      query: Q.GET_SERIES_PAGE_DATA,
      params: { slug: slug.trim().toLowerCase(), latestLimit },
      fallback: {
        series: null,
        seasons: [],
        latestEpisodes: [],
        seasonCount: 0,
        episodeCount: 0,
      },
      revalidate: REVALIDATE.episodes,
      tags: [sanityTag.series(), sanityTag.episode(), sanityTag.season()],
      label: "getSeriesPageData",
    });
    return { ...data, latestEpisodes: toCards(data.latestEpisodes) };
  },
);

/**
 * Related series. Needs the resolved genres, so it runs after
 * `getSeriesPageData`; falls back to an alphabetical slice when a series has no
 * genres yet, so the section is never empty for no reason.
 */
export const getRelatedSeries = cache(
  async (
    seriesId: string,
    genres: readonly string[] | null,
    limit = 8,
  ): Promise<ContentCardData[]> => {
    if (!genres?.length) {
      const { offset, end } = slice(1, limit);
      const data = await sanityFetch<IndexPayload<SeriesCard>>({
        query: Q.GET_SERIES_INDEX,
        params: { offset, end },
        fallback: { total: 0, items: [] },
        revalidate: REVALIDATE.aggregates,
        tags: [sanityTag.series()],
        label: "relatedSeriesFallback",
      });
      return toCards(data.items);
    }

    const data = await sanityFetch<{ related: SeriesCard[] }>({
      query: Q.GET_SERIES_AUX,
      params: { seriesId, genres: [...genres], limit },
      fallback: { related: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.series()],
      label: "getRelatedSeries",
    });
    return toCards(data.related);
  },
);

export interface SeasonPageData {
  season: Season | null;
  episodes: ContentCardData[];
  total: number;
}

export const getSeasonPageData = cache(
  async (slug: string, page: number, pageSize: number): Promise<SeasonPageData> => {
    const { offset, end } = slice(page, pageSize);
    const data = await sanityFetch<{
      season: Season | null;
      episodes: EpisodeCard[];
      total: number;
    }>({
      query: Q.GET_SEASON_PAGE_DATA,
      params: { slug: slug.trim().toLowerCase(), offset, end },
      fallback: { season: null, episodes: [], total: 0 },
      revalidate: REVALIDATE.episodes,
      tags: [sanityTag.season(), sanityTag.episode()],
      label: "getSeasonPageData",
    });
    return { ...data, episodes: toCards(data.episodes) };
  },
);

export interface EpisodeAuxData {
  previous: ContentCardData | null;
  next: ContentCardData | null;
  seasonEpisodes: ContentCardData[];
  seasonEpisodeTotal: number;
  related: ContentCardData[];
}

export interface EpisodeAuxOptions {
  seasonPreview?: number;
  related?: number;
  /** Series genre values, used to widen the related-episodes lookup. */
  genreIds?: string[];
}

/**
 * Everything an episode template needs beyond the episode itself, in a single
 * request: previous/next (relationship + numeric ordering), the full season list,
 * the season total and related episodes.
 */
export const getEpisodeAuxData = cache(
  async (episode: Episode, options: EpisodeAuxOptions = {}): Promise<EpisodeAuxData> => {
    const data = await sanityFetch<{
      previous: EpisodeCard | null;
      next: EpisodeCard | null;
      seasonEpisodes: EpisodeCard[];
      seasonEpisodeTotal: number;
      related: EpisodeCard[];
    }>({
      query: Q.GET_EPISODE_AUX,
      params: {
        episodeId: episode._id,
        seriesId: episode.series?.id ?? "",
        seasonId: episode.season?.id ?? "",
        seasonNumber: episode.seasonNumber ?? null,
        episodeNumber: episode.episodeNumber ?? null,
        limit: options.seasonPreview ?? 100,
        genres: options.genreIds ?? [],
      },
      fallback: {
        previous: null,
        next: null,
        seasonEpisodes: [],
        seasonEpisodeTotal: 0,
        related: [],
      },
      revalidate: REVALIDATE.episodes,
      tags: [sanityTag.episode(episode._id), sanityTag.episode()],
      label: "getEpisodeAuxData",
    });

    return {
      previous: data.previous?.slug ? toCard(data.previous) : null,
      next: data.next?.slug ? toCard(data.next) : null,
      seasonEpisodes: toCards(data.seasonEpisodes),
      seasonEpisodeTotal: data.seasonEpisodeTotal,
      related: toCards(data.related),
    };
  },
);

export interface BlogPostPageData {
  related: ContentCardData[];
  latest: ContentCardData[];
}

export const getBlogPostPageData = cache(
  async (post: BlogPost, limit = 6): Promise<BlogPostPageData> => {
    const data = await sanityFetch<BlogPostPageData>({
      query: Q.GET_BLOG_POST_AUX,
      params: {
        postId: post._id,
        categoryIds: post.categories?.map((category) => category.id) ?? [],
        limit,
        latestLimit: limit,
      },
      fallback: { related: [], latest: [] },
      revalidate: REVALIDATE.content,
      tags: [sanityTag.blogPost(post._id), sanityTag.blogPost()],
      label: "getBlogPostPageData",
    });
    // `GET_BLOG_POST_AUX` already projects complete card objects, so this result
    // is used as-is — re-running `toCards()` here would re-adapt normalized data.
    return data;
  },
);

export interface CategoryPageData {
  category: Category | null;
  items: ContentCardData[];
  total: number;
}

/**
 * The raw projection returned by `GET_CATEGORY_PAGE_DATA` — a concatenation of
 * the five per-type card projections, each of which `toCard()` understands.
 */
type CategoryItemSource = SeriesCard | SeasonCard | EpisodeCard | MovieCard | BlogPostCard;

export const getCategoryPageData = cache(
  async (category: Category, page: number, pageSize: number): Promise<CategoryPageData> => {
    const { offset, end } = slice(page, pageSize);
    /**
     * `GET_CATEGORY_PAGE_DATA` returns the category document itself at the top
     * level with the item lists nested inside its projection — `CATEGORY_MATCH`
     * reads `^` to mean "the category being viewed", which only resolves in
     * that position. So the flat `{ category, items, total }` shape the caller
     * expects is re-assembled here.
     */
    const data = await sanityFetch<
      (Category & { items: CategoryItemSource[]; total: number }) | null
    >({
      query: Q.GET_CATEGORY_PAGE_DATA,
      params: { slug: category.slug, offset, end },
      fallback: null,
      revalidate: REVALIDATE.episodes,
      tags: [sanityTag.category(category._id), sanityTag.content],
      label: "getCategoryPageData",
    });
    return {
      category: data ?? category,
      items: toCards(data?.items ?? []),
      total: data?.total ?? 0,
    };
  },
);

export const getRelatedMovies = cache(
  async (
    movieId: string,
    genres: readonly string[] | null,
    limit = 6,
  ): Promise<ContentCardData[]> => {
    if (!genres?.length) return [];
    const data = await sanityFetch<{ related: MovieCard[] }>({
      query: Q.GET_MOVIE_AUX,
      params: { movieId, genres: [...genres], limit },
      fallback: { related: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.movie()],
      label: "getRelatedMovies",
    });
    return toCards(data.related);
  },
);

/* -------------------------------------------------------------------------- */
/* 4. Episode navigation (relationship + numeric ordering, never slug order)   */
/* -------------------------------------------------------------------------- */

export interface EpisodeNavigation {
  previous: ContentCardData | null;
  next: ContentCardData | null;
}

/**
 * A `null` side means the episode is the first/last of its series, so the UI
 * hides that link entirely.
 */
export const getEpisodeNavigation = cache(async (episode: Episode): Promise<EpisodeNavigation> => {
  const data = await getEpisodeAuxData(episode, { seasonPreview: 0, related: 0 });
  return { previous: data.previous, next: data.next };
});

export const getPreviousEpisode = cache(
  async (episode: Episode): Promise<ContentCardData | null> =>
    (await getEpisodeNavigation(episode)).previous,
);

export const getNextEpisode = cache(
  async (episode: Episode): Promise<ContentCardData | null> =>
    (await getEpisodeNavigation(episode)).next,
);

/* -------------------------------------------------------------------------- */
/* 5. Episode listings                                                        */
/* -------------------------------------------------------------------------- */

export const getEpisodesBySeries = cache(
  async (
    seriesId: string,
    options: { seasonId?: string; page?: number; pageSize?: number } = {},
  ): Promise<Paginated<ContentCardData>> => {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 24;
    const { offset, end } = slice(page, pageSize);
    const seasonId = options.seasonId ?? "";

    const [items, total] = await Promise.all([
      sanityFetch<EpisodeCard[]>({
        query: Q.GET_SERIES_EPISODES,
        params: { seriesId, seasonId, offset, end },
        fallback: [],
        revalidate: REVALIDATE.episodes,
        tags: [sanityTag.episode(), sanityTag.series(seriesId)],
        label: "getEpisodesBySeries",
      }),
      sanityFetch<number>({
        query: Q.GET_SERIES_EPISODES_COUNT,
        params: { seriesId, seasonId },
        fallback: 0,
        revalidate: REVALIDATE.aggregates,
        tags: [sanityTag.episode(), sanityTag.series(seriesId)],
        label: "getEpisodesBySeriesCount",
      }),
    ]);

    return paginated(toCards(items), total, page, pageSize);
  },
);

/** Season-scoped episode list — reused by the season page and the episode page. */
export const getEpisodesBySeason = cache(
  async (
    seasonId: string,
    options: { page?: number; pageSize?: number } = {},
  ): Promise<Paginated<ContentCardData>> => {
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 24;
    const { offset, end } = slice(page, pageSize);

    const [items, total] = await Promise.all([
      sanityFetch<EpisodeCard[]>({
        query: Q.GET_SEASON_EPISODES,
        params: { seasonId, offset, end },
        fallback: [],
        revalidate: REVALIDATE.episodes,
        tags: [sanityTag.episode(), sanityTag.season(seasonId)],
        label: "getEpisodesBySeason",
      }),
      sanityFetch<number>({
        query: Q.GET_SEASON_EPISODES_COUNT,
        params: { seasonId },
        fallback: 0,
        revalidate: REVALIDATE.aggregates,
        tags: [sanityTag.episode(), sanityTag.season(seasonId)],
        label: "getEpisodesBySeasonCount",
      }),
    ]);

    return paginated(toCards(items), total, page, pageSize);
  },
);

/**
 * Every episode of a series, grouped by season number.
 *
 * One Content Lake request, then a deterministic in-process partition. This is
 * what lets the series template render complete seasons with server-side links
 * only — no client-side tab widget is needed anywhere.
 */
export interface SeasonEpisodeGroup {
  seasonNumber: number | null;
  episodes: ContentCardData[];
}

export const getSeriesEpisodeGroups = cache(
  async (seriesId: string, pageSize = 1000): Promise<SeasonEpisodeGroup[]> => {
    const { offset, end } = slice(1, pageSize);
    const cards = await sanityFetch<EpisodeCard[]>({
      query: Q.GET_SERIES_EPISODES,
      params: { seriesId, seasonId: "", offset, end },
      fallback: [],
      revalidate: REVALIDATE.episodes,
      tags: [sanityTag.episode(), sanityTag.series(seriesId)],
      label: "getSeriesEpisodeGroups",
    });

    const buckets = new Map<number | null, EpisodeCard[]>();
    for (const card of cards) {
      const key = card?.seasonNumber ?? null;
      const bucket = buckets.get(key);
      if (bucket) bucket.push(card);
      else buckets.set(key, [card]);
    }

    // Seasons ascending; the season-less bucket always comes last.
    return [...buckets.entries()]
      .sort(([a], [b]) => {
        if (a === null) return 1;
        if (b === null) return -1;
        return a - b;
      })
      .map(([seasonNumber, episodes]) => ({ seasonNumber, episodes: toCards(episodes) }));
  },
);

/* -------------------------------------------------------------------------- */
/* 6. Index / archive pages                                                   */
/* -------------------------------------------------------------------------- */

export const getAllSeriesIndex = cache(
  async (page = 1, pageSize = 24): Promise<Paginated<ContentCardData>> => {
    const { offset, end } = slice(page, pageSize);
    const data = await sanityFetch<IndexPayload<SeriesCard>>({
      query: Q.GET_SERIES_INDEX,
      params: { offset, end },
      fallback: { total: 0, items: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.series()],
      label: "getAllSeriesIndex",
    });
    return paginated(toCards(data.items), data.total, page, pageSize);
  },
);

export const getAllMovieIndex = cache(
  async (page = 1, pageSize = 24): Promise<Paginated<ContentCardData>> => {
    const { offset, end } = slice(page, pageSize);
    const data = await sanityFetch<IndexPayload<MovieCard>>({
      query: Q.GET_MOVIES_INDEX,
      params: { offset, end },
      fallback: { total: 0, items: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.movie()],
      label: "getAllMovieIndex",
    });
    return paginated(toCards(data.items), data.total, page, pageSize);
  },
);

export const getAllBlogPostIndex = cache(
  async (page = 1, pageSize = 12): Promise<Paginated<ContentCardData>> => {
    const { offset, end } = slice(page, pageSize);
    const data = await sanityFetch<IndexPayload<BlogPostCard>>({
      query: Q.GET_BLOG_INDEX,
      params: { offset, end },
      fallback: { total: 0, items: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.blogPost()],
      label: "getAllBlogPostIndex",
    });
    return paginated(toCards(data.items), data.total, page, pageSize);
  },
);

export const getAllCategoryIndex = cache(
  async (page = 1, pageSize = 24): Promise<Paginated<ContentCardData>> => {
    const { offset, end } = slice(page, pageSize);
    const data = await sanityFetch<IndexPayload<CategoryCard>>({
      query: Q.GET_CATEGORIES_INDEX,
      params: { offset, end },
      fallback: { total: 0, items: [] },
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.category()],
      label: "getAllCategoryIndex",
    });
    return paginated(toCards(data.items), data.total, page, pageSize);
  },
);

/* -------------------------------------------------------------------------- */
/* 7. Rails                                                                   */
/* -------------------------------------------------------------------------- */

export const getFeaturedSeries = cache(async (limit = 10): Promise<ContentCardData[]> =>
  sanityFetch<SeriesCard[]>({
    query: Q.GET_FEATURED_SERIES,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.series()],
    label: "getFeaturedSeries",
  }).then(toCards).then(withRank),
);

export const getPopularSeries = cache(async (limit = 8): Promise<ContentCardData[]> =>
  sanityFetch<SeriesCard[]>({
    query: Q.GET_POPULAR_SERIES,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.series()],
    label: "getPopularSeries",
  }).then(toCards),
);

export const getLatestEpisodes = cache(async (limit = 12): Promise<ContentCardData[]> =>
  sanityFetch<EpisodeCard[]>({
    query: Q.GET_LATEST_EPISODES,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.episodes,
    tags: [sanityTag.episode()],
    label: "getLatestEpisodes",
  }).then(toCards),
);

export const getLatestMovies = cache(async (limit = 8): Promise<ContentCardData[]> =>
  sanityFetch<MovieCard[]>({
    query: Q.GET_LATEST_MOVIES,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.movie()],
    label: "getLatestMovies",
  }).then(toCards),
);

export const getLatestPosts = cache(async (limit = 6): Promise<ContentCardData[]> =>
  sanityFetch<BlogPostCard[]>({
    query: Q.GET_LATEST_POSTS,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.blogPost()],
    label: "getLatestPosts",
  }).then(toCards),
);

export const getPopularCategories = cache(async (limit = 12): Promise<ContentCardData[]> =>
  sanityFetch<CategoryCard[]>({
    query: Q.GET_POPULAR_CATEGORIES,
    params: { limit },
    fallback: [],
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.category()],
    label: "getPopularCategories",
  }).then(toCards),
);

/* -------------------------------------------------------------------------- */
/* 8. Site-wide                                                               */
/* -------------------------------------------------------------------------- */

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> =>
  sanityFetch<SiteSettings | null>({
    query: Q.GET_SITE_SETTINGS,
    fallback: null,
    revalidate: REVALIDATE.content,
    tags: [sanityTag.settings],
    label: "getSiteSettings",
  }),
);

export const getDefaultOgImageUrl = cache(async (): Promise<string | undefined> => {
  const settings = await getSiteSettings();
  return settings?.defaultOgImage?.asset?.url ?? undefined;
});

export type NavigationPage = Pick<Page, "_id" | "title" | "slug" | "hideFromNavigation">;

/** Static pages used by the footer. Hidden pages are excluded. */
export const getNavigationPages = cache(async (): Promise<NavigationPage[]> =>
  sanityFetch<NavigationPage[]>({
    query: Q.GET_PAGES_BY_SLUGS,
    params: { slugs: [...STATIC_PAGE_SLUGS] },
    fallback: [],
    revalidate: REVALIDATE.content,
    tags: [sanityTag.content],
    label: "getNavigationPages",
  }),
);

/** Every publicly reachable slug — the source for `generateStaticParams`. */
export const getAllSlugs = cache(async (): Promise<string[]> => {
  const rows = await sanityFetch<Array<{ slug: string }>>({
    query: Q.GET_ALL_SLUGS,
    params: { types: [...CONTENT_TYPE_ORDER] },
    fallback: [],
    revalidate: REVALIDATE.slugs,
    tags: [sanityTag.slugs],
    label: "getAllSlugs",
  });
  return rows.map((row) => row.slug).filter(Boolean);
});

/** Every published document URL for `app/sitemap.ts`. */
export const getSitemapRows = cache(async (): Promise<SitemapRow[]> =>
  sanityFetch<SitemapRow[]>({
    query: Q.GET_SITEMAP_ROWS,
    params: { types: [...CONTENT_TYPE_ORDER] },
    fallback: [],
    revalidate: REVALIDATE.slugs,
    tags: [sanityTag.sitemap],
    label: "getSitemapRows",
  }),
);

/** The whole homepage payload in a single request. */
export const getHomePageData = cache(async (): Promise<HomePageData> => {
  const data = await sanityFetch<{
    settings: SiteSettings | null;
    hero: SeriesCard | null;
    featuredSeries: SeriesCard[];
    latestEpisodes: EpisodeCard[];
    popularSeries: SeriesCard[];
    movies: MovieCard[];
    articles: BlogPostCard[];
    categories: CategoryCard[];
  }>({
    query: Q.GET_HOME_PAGE,
    params: {
      featuredLimit: 10,
      episodeLimit: 12,
      seriesLimit: 8,
      movieLimit: 8,
      articleLimit: 6,
      categoryLimit: 12,
    },
    fallback: {
      settings: null,
      hero: null,
      featuredSeries: [],
      latestEpisodes: [],
      popularSeries: [],
      movies: [],
      articles: [],
      categories: [],
    },
    revalidate: REVALIDATE.aggregates,
    tags: [sanityTag.content, sanityTag.settings],
    label: "getHomePageData",
  });

  const home: HomePageData = {
    settings: data.settings,
    hero: data.hero?.slug ? toCard(data.hero) : null,
    featuredSeries: withRank(toCards(data.featuredSeries)),
    latestEpisodes: toCards(data.latestEpisodes),
    popularSeries: toCards(data.popularSeries),
    movies: toCards(data.movies),
    articles: toCards(data.articles),
    categories: toCards(data.categories),
    isEmpty: false,
  };

  home.isEmpty =
    !home.hero &&
    !home.featuredSeries.length &&
    !home.latestEpisodes.length &&
    !home.popularSeries.length &&
    !home.movies.length &&
    !home.articles.length &&
    !home.categories.length;

  return home;
});

/* -------------------------------------------------------------------------- */
/* 9. Search                                                                  */
/* -------------------------------------------------------------------------- */

const SEARCH_RESULT_TYPES = [
  "series",
  "season",
  "episode",
  "movie",
  "blogPost",
  "category",
] as const;

/**
 * Multi-type search. Titles are matched token-wise (`match`), keywords are
 * matched literally, and a purely numeric term also resolves to episodes by
 * `episodeNumber`, so "85" finds `…-episode-85-in-urdu-subtitles`.
 */
export const searchContent = cache(
  async (term: string, limitPerType = 6): Promise<SearchResult[]> => {
    const query = term.trim();
    if (query.length < 2) return [];

    const slots = await sanityFetch<Partial<Record<(typeof SEARCH_RESULT_TYPES)[number], CardSource[]>>>({
      query: Q.GET_SEARCH_RESULTS,
      params: { term: query, limit: limitPerType },
      fallback: {},
      revalidate: REVALIDATE.aggregates,
      tags: [sanityTag.search],
      label: "searchContent",
    });

    const results: SearchResult[] = [];

    for (const type of SEARCH_RESULT_TYPES) {
      for (const source of slots[type] ?? []) {
        if (!source?.slug) continue;
        results.push({ ...toCard(source), typeLabel: CONTENT_TYPE_LABEL[type] });
      }
    }

    const numeric = /^\d+$/.test(query) ? Number(query) : null;
    if (numeric !== null) {
      const episodes = await sanityFetch<EpisodeCard[]>({
        query: Q.GET_EPISODES_BY_NUMBER,
        params: { number: numeric, limit: limitPerType },
        fallback: [],
        revalidate: REVALIDATE.aggregates,
        tags: [sanityTag.search],
        label: "searchEpisodesByNumber",
      });

      const seen = new Set(results.map((result) => result._id));
      for (const episode of episodes) {
        if (!episode.slug || seen.has(episode._id)) continue;
        results.push({ ...toCard(episode), typeLabel: CONTENT_TYPE_LABEL.episode });
      }
    }

    return results;
  },
);