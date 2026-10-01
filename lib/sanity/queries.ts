/**
 * Every GROQ query in the application.
 *
 * Rules this file enforces by construction:
 *  - No GROQ exists anywhere else (no inline queries in pages or components).
 *  - Projections are composed from shared fragments, so a field is defined once.
 *  - Ordering is always explicit. Episodes order by `seasonNumber, episodeNumber`
 *    and are never slug-parsed.
 *  - Filtering is always by `slug.current == $slug` — the flat URL contract.
 */

import { CONTENT_TYPES } from "./types";

/* -------------------------------------------------------------------------- */
/* Fragments                                                                  */
/* -------------------------------------------------------------------------- */

export const ID = `_id`;
export const SLUG = `"slug": slug.current`;

export const TIMES = /* groq */ `{
  "publishedAt": publishedAt,
  "updatedAt": updatedAt
}`;

/** SEO fields are denormalized in every projection so no template re-joins them. */
export const SEO = /* groq */ `{
  "seoTitle": seo.seoTitle,
  "seoDescription": seo.seoDescription,
  "keywords": seo.keywords,
  "noIndex": seo.noIndex
}`;

export const IMAGE = /* groq */ `{
  asset->{
    "_ref": _id,
    url,
    metadata{ lqip, dimensions{ width, height, aspectRatio } }
  },
  alt,
  hotspot{ x, y }
}`;

/** Minimal reference used for every relationship projection. */
export const REF = /* groq */ `{
  "id": _id,
  "title": title,
  "slug": slug.current
}`;

export const DESCRIPTION = `description[]{ ..., markDefs[]{ ... } }`;
export const BODY = `body[]{ ..., markDefs[]{ ... } }`;

/**
 * Category membership rule — used identically by the category page, the
 * category item counts and the homepage/category card counts, so a document
 * can never appear in one and be missing from another.
 *
 * A document belongs to a category when it is referenced by the category
 * (blog posts), shares a genre with the category title, belongs to the series
 * the category is attached to, or is that series itself.
 *
 * `^` = the category document. This rule is therefore only valid when the
 * filter is evaluated *inside* a projection of that category document — never
 * at the top level of a query, where `^` has no category to point at. It reads
 * `^._id` rather than a `$categoryId` param so no caller can forget to supply
 * one; every query below nests its item lists inside the category projection
 * to satisfy that requirement.
 */
export const CATEGORY_MATCH = /* groq */ `(
    count(categories[@._ref == ^._id]) > 0 ||
    count(genres[lower(^.title) == lower(@)]) > 0 ||
    (_type == "episode" && count(series->genres[lower(^.title) == lower(@)]) > 0) ||
    (_type == "season" && defined(^.series._ref) && references(^.series._ref)) ||
    (_type == "series" && defined(^.series._ref) && _id == ^.series._ref)
  )`;

/** Documents that can appear inside a category page. */
export const CATEGORY_ITEM_TYPES = '"series","season","episode","movie","blogPost"';

/* -------------------------------------------------------------------------- */
/* Deterministic orderings                                                    */
/* -------------------------------------------------------------------------- */

/*
 * GROQ only pipes a traversal into the next one, so an ordering always follows
 * a `|`. Every fragment below therefore carries its own leading pipe and is
 * composed as `*[filter] ${ORDER}[slice] ${PROJECTION}`. Writing
 * `*[filter] order(...)` is a parse error, which is exactly the bug these
 * fragments exist to make impossible to reintroduce.
 */

/** Episodes: season then episode number. Never slug order. */
export const EPISODE_ASC = /* groq */ `| order(
  coalesce(seasonNumber, 0) asc,
  coalesce(episodeNumber, 99999) asc,
  title asc
)`;

/** Episodes: descending, used by the "previous episode" lookup. */
export const EPISODE_DESC = /* groq */ `| order(
  coalesce(seasonNumber, 0) desc,
  coalesce(episodeNumber, 99999) desc,
  title desc
)`;

/** Seasons: season number, then title. */
export const SEASON_ASC = /* groq */ `| order(
  coalesce(seasonNumber, 0) asc,
  title asc
)`;

export const TITLE_ASC = /* groq */ `| order(title asc)`;

/** Editorial order for anything that is not episode/season-shaped. */
export const PUBLISHED_DESC = /* groq */ `| order(
  coalesce(publishedAt, _createdAt) desc,
  title asc
)`;

export const LATEST_DESC = /* groq */ `| order(
  coalesce(publishedAt, _createdAt) desc
)`;

/* -------------------------------------------------------------------------- */
/* Card projections (lean shape: grids, rails, search, related)                */
/* -------------------------------------------------------------------------- */

export const SERIES_CARD = /* groq */ `{
  _id,
  "_type": "series",
  title,
  ${SLUG},
  "poster": coalesce(poster, banner)${IMAGE},
  status,
  releaseYear,
  country
}`;

export const SERIES_HERO = /* groq */ `{
  _id,
  "_type": "series",
  title,
  ${SLUG},
  "poster": coalesce(banner, poster)${IMAGE},
  status,
  releaseYear,
  country
}`;

export const SEASON_CARD = /* groq */ `{
  _id,
  "_type": "season",
  title,
  ${SLUG},
  "poster": coalesce(poster, banner)${IMAGE},
  seasonNumber,
  "series": series->${REF}
}`;

/** Season card + the counters the series season switcher renders. */
export const SEASON_TAB = /* groq */ `{
  ...${SEASON_CARD},
  "hasPublicSlug": defined(slug.current) && length(slug.current) > 0,
  "episodeCount": count(*[_type == "episode" && references(^._id)])
}`;

export const EPISODE_CARD = /* groq */ `{
  _id,
  "_type": "episode",
  title,
  ${SLUG},
  "thumbnail": thumbnail${IMAGE},
  episodeNumber,
  seasonNumber,
  "series": series->${REF},
  duration,
  "noIndex": seo.noIndex
}`;

export const MOVIE_CARD = /* groq */ `{
  _id,
  "_type": "movie",
  title,
  ${SLUG},
  "poster": coalesce(poster, banner)${IMAGE},
  releaseYear,
  language,
  country
}`;

export const BLOG_POST_CARD = /* groq */ `{
  _id,
  "_type": "blogPost",
  title,
  ${SLUG},
  "featuredImage": featuredImage${IMAGE},
  author,
  "publishedAt": publishedAt
}`;

/** Category card + live item count (same matcher as the category page). */
export const CATEGORY_CARD = /* groq */ `{
  _id,
  "_type": "category",
  title,
  ${SLUG},
  "image": image${IMAGE},
  "itemCount": count(*[_type in [${CATEGORY_ITEM_TYPES}] && ${CATEGORY_MATCH}])
}`;

export const PAGE_CARD = /* groq */ `{
  _id,
  "_type": "page",
  title,
  ${SLUG},
  "image": image${IMAGE}
}`;

/* -------------------------------------------------------------------------- */
/* Full document projections                                                  */
/* -------------------------------------------------------------------------- */

export const SERIES = /* groq */ `{
  _id,
  "_type": "series",
  title,
  ${SLUG},
  ${DESCRIPTION},
  "poster": poster${IMAGE},
  "banner": banner${IMAGE},
  "logo": logo${IMAGE},
  country,
  language,
  genres,
  status,
  releaseYear,
  featured,
  ...${SEO},
  ...${TIMES},
  "episodeCount": count(*[_type == "episode" && references(^._id)]),
  "seasonCount": count(*[_type == "season" && references(^._id)])
}`;

export const SEASON = /* groq */ `{
  _id,
  "_type": "season",
  title,
  ${SLUG},
  ${DESCRIPTION},
  "poster": poster${IMAGE},
  "banner": banner${IMAGE},
  seasonNumber,
  "hasPublicSlug": defined(slug.current) && length(slug.current) > 0,
  "series": series->${REF},
  ...${SEO},
  ...${TIMES},
  "episodeCount": count(*[_type == "episode" && references(^._id)])
}`;

export const EPISODE = /* groq */ `{
  _id,
  "_type": "episode",
  title,
  ${SLUG},
  ${DESCRIPTION},
  "thumbnail": thumbnail${IMAGE},
  episodeNumber,
  seasonNumber,
  embedUrl,
  videoType,
  duration,
  "series": series->${REF},
  "season": season->${REF},
  ...${SEO},
  ...${TIMES}
}`;

export const MOVIE = /* groq */ `{
  _id,
  "_type": "movie",
  title,
  ${SLUG},
  ${DESCRIPTION},
  "poster": poster${IMAGE},
  "banner": banner${IMAGE},
  "logo": logo${IMAGE},
  embedUrl,
  videoType,
  duration,
  language,
  country,
  releaseYear,
  genres,
  ...${SEO},
  ...${TIMES}
}`;

export const BLOG_POST = /* groq */ `{
  _id,
  "_type": "blogPost",
  title,
  ${SLUG},
  excerpt,
  ${BODY},
  "featuredImage": featuredImage${IMAGE},
  author,
  "categories": categories[]->${REF},
  tags,
  ...${SEO},
  ...${TIMES}
}`;

export const CATEGORY = /* groq */ `{
  _id,
  "_type": "category",
  title,
  ${SLUG},
  ${DESCRIPTION},
  "image": image${IMAGE},
  "series": series->${REF},
  ...${SEO},
  ...${TIMES}
}`;

export const PAGE = /* groq */ `{
  _id,
  "_type": "page",
  title,
  ${SLUG},
  ${DESCRIPTION},
  ${BODY},
  "image": image${IMAGE},
  hideFromNavigation,
  ...${SEO},
  ...${TIMES}
}`;

export const SITE_SETTINGS = /* groq */ `{
  _id,
  siteTitle,
  siteDescription,
  "defaultOgImage": defaultOgImage${IMAGE},
  homepageSeoTitle,
  homepageSeoDescription,
  "homepageSeoContent": homepageSeoContent[]{ ..., markDefs[]{ ... } },
  featuredSeriesSlugs
}`;

/* -------------------------------------------------------------------------- */
/* 1. Flat slug resolution — one round trip, one slot per content type        */
/* -------------------------------------------------------------------------- */

export const RESOLVE_BY_SLUG = /* groq */ `{
  "episode": *[_type == "episode" && defined(slug.current) && slug.current == $slug][0] ${EPISODE},
  "series": *[_type == "series" && defined(slug.current) && slug.current == $slug][0] ${SERIES},
  "season": *[_type == "season" && defined(slug.current) && slug.current == $slug][0] ${SEASON},
  "movie": *[_type == "movie" && defined(slug.current) && slug.current == $slug][0] ${MOVIE},
  "blogPost": *[_type == "blogPost" && defined(slug.current) && slug.current == $slug][0] ${BLOG_POST},
  "category": *[_type == "category" && defined(slug.current) && slug.current == $slug][0] ${CATEGORY},
  "page": *[_type == "page" && defined(slug.current) && slug.current == $slug][0] ${PAGE}
}`;

/* -------------------------------------------------------------------------- */
/* 2. Single-document lookups                                                 */
/* -------------------------------------------------------------------------- */

export const GET_SERIES_BY_SLUG = /* groq */ `*[
  _type == "series" && defined(slug.current) && slug.current == $slug
][0] ${SERIES}`;

export const GET_SEASON_BY_SLUG = /* groq */ `*[
  _type == "season" && defined(slug.current) && slug.current == $slug
][0] ${SEASON}`;

export const GET_EPISODE_BY_SLUG = /* groq */ `*[
  _type == "episode" && defined(slug.current) && slug.current == $slug
][0] ${EPISODE}`;

export const GET_MOVIE_BY_SLUG = /* groq */ `*[
  _type == "movie" && defined(slug.current) && slug.current == $slug
][0] ${MOVIE}`;

export const GET_BLOG_POST_BY_SLUG = /* groq */ `*[
  _type == "blogPost" && defined(slug.current) && slug.current == $slug
][0] ${BLOG_POST}`;

export const GET_CATEGORY_BY_SLUG = /* groq */ `*[
  _type == "category" && defined(slug.current) && slug.current == $slug
][0] ${CATEGORY}`;

export const GET_PAGE_BY_SLUG = /* groq */ `*[
  _type == "page" && defined(slug.current) && slug.current == $slug
][0] ${PAGE}`;

/** Footer + sitemap batch: many slugs, one request. */
export const GET_PAGES_BY_SLUGS = /* groq */ `*[
  _type == "page" && defined(slug.current) && slug.current in $slugs
] ${TITLE_ASC} { ${ID}, title, ${SLUG}, hideFromNavigation }`;

export const GET_SITE_SETTINGS = /* groq */ `*[_type == "siteSettings"][0] ${SITE_SETTINGS}`;

/* -------------------------------------------------------------------------- */
/* 3. Series detail page                                                      */
/* -------------------------------------------------------------------------- */

export const GET_SERIES_SEASONS = /* groq */ `*[
  _type == "season" && series._ref == $seriesId
] ${SEASON_ASC} ${SEASON_TAB}`;

export const GET_SERIES_EPISODES = /* groq */ `*[
  _type == "episode" && series._ref == $seriesId && ($seasonId == "" || season._ref == $seasonId)
] ${EPISODE_ASC}[$offset...$end] ${EPISODE_CARD}`;

export const GET_SERIES_EPISODES_COUNT = /* groq */ `count(*[
  _type == "episode" && series._ref == $seriesId && ($seasonId == "" || season._ref == $seasonId)
])`;

export const GET_SERIES_LATEST_EPISODES = /* groq */ `*[
  _type == "episode" && series._ref == $seriesId
] ${LATEST_DESC}[0...$limit] ${EPISODE_CARD}`;

export const GET_SERIES_RELATED = /* groq */ `*[
  _type == "series" && _id != $seriesId && count(genres[@ in $genres]) > 0
] ${TITLE_ASC}[0...$limit] ${SERIES_CARD}`;

/* -------------------------------------------------------------------------- */
/* 4. Season detail page                                                      */
/* -------------------------------------------------------------------------- */

export const GET_SEASON_EPISODES = /* groq */ `*[
  _type == "episode" && season._ref == $seasonId
] ${EPISODE_ASC}[$offset...$end] ${EPISODE_CARD}`;

export const GET_SEASON_EPISODES_COUNT = /* groq */ `count(*[
  _type == "episode" && season._ref == $seasonId
])`;

/* -------------------------------------------------------------------------- */
/* 5. Episode detail page                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Previous / next episode, derived purely from the Sanity relationships
 * (`series` reference) plus the numeric `seasonNumber` / `episodeNumber`
 * fields — never from the slug. Ordering spans the whole series, so the last
 * episode of season N links to the first episode of season N+1.
 *
 * An empty result means "first" / "last"; the component then hides the link.
 */
export const GET_EPISODE_SIBLINGS = /* groq */ `{
  "previous": *[
    _type == "episode" && series._ref == $seriesId && _id != $episodeId &&
    (
      (defined($seasonNumber) && seasonNumber < $seasonNumber) ||
      ((!defined($seasonNumber) || seasonNumber == $seasonNumber) && episodeNumber < $episodeNumber)
    )
  ] ${EPISODE_DESC}[0] ${EPISODE_CARD},
  "next": *[
    _type == "episode" && series._ref == $seriesId && _id != $episodeId &&
    (
      (defined($seasonNumber) && seasonNumber > $seasonNumber) ||
      ((!defined($seasonNumber) || seasonNumber == $seasonNumber) && episodeNumber > $episodeNumber)
    )
  ] ${EPISODE_ASC}[0] ${EPISODE_CARD}
}`;

export const GET_SEASON_EPISODES_PREVIEW = /* groq */ `*[
  _type == "episode" && season._ref == $seasonId
] ${EPISODE_ASC}[0...$limit] ${EPISODE_CARD}`;

export const GET_RELATED_EPISODES = /* groq */ `*[
  _type == "episode" && _id != $episodeId && (
    series._ref == $seriesId ||
    count(series->genres[@ in $genres]) > 0
  )
] ${LATEST_DESC}[0...$limit] ${EPISODE_CARD}`;

/* -------------------------------------------------------------------------- */
/* 6. Blog post detail page                                                   */
/* -------------------------------------------------------------------------- */

export const GET_RELATED_POSTS = /* groq */ `*[
  _type == "blogPost" && _id != $postId &&
  count(categories[@._ref in $categoryIds]) > 0
] ${PUBLISHED_DESC}[0...$limit] ${BLOG_POST_CARD}`;

export const GET_LATEST_POSTS_EXCLUDING = /* groq */ `*[
  _type == "blogPost" && _id != $postId
] ${PUBLISHED_DESC}[0...$limit] ${BLOG_POST_CARD}`;

/* -------------------------------------------------------------------------- */
/* 7. Movie detail page                                                       */
/* -------------------------------------------------------------------------- */

export const GET_RELATED_MOVIES = /* groq */ `*[
  _type == "movie" && _id != $movieId && count(genres[@ in $genres]) > 0
] ${TITLE_ASC}[0...$limit] ${MOVIE_CARD}`;

/* -------------------------------------------------------------------------- */
/* 8. Category detail page                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Unified, mixed-type category listing, fetched as one round trip.
 *
 * The item lists live *inside* the category document projection because
 * `CATEGORY_MATCH` reads `^` to mean "the category being viewed". Flattening
 * this into a top-level `*[]` would break membership for every document.
 * Each type is ordered independently and the typed arrays are concatenated,
 * then paged — so the result order is deterministic for a given content set.
 */
export const GET_CATEGORY_ITEMS = /* groq */ `*[
  _type == "category" && defined(slug.current) && slug.current == $slug
][0] {
  _id,
  "total": count(*[_type in [${CATEGORY_ITEM_TYPES}] && ${CATEGORY_MATCH}]),
  "items": (
      (*[_type == "series" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
    + (*[_type == "season" && ${CATEGORY_MATCH}] ${SEASON_ASC})
    + (*[_type == "episode" && ${CATEGORY_MATCH}] ${EPISODE_ASC})
    + (*[_type == "movie" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
    + (*[_type == "blogPost" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
  )[$offset...$end]
}`;

export const GET_POPULAR_CATEGORIES = /* groq */ `*[_type == "category"] ${PUBLISHED_DESC}[0...$limit] ${CATEGORY_CARD}`;

/* -------------------------------------------------------------------------- */
/* 9. Index / archive pages                                                   */
/* -------------------------------------------------------------------------- */

export const GET_SERIES_INDEX = /* groq */ `{
  "total": count(*[_type == "series"]),
  "items": *[_type == "series"] ${TITLE_ASC}[$offset...$end] ${SERIES_CARD}
}`;

export const GET_MOVIES_INDEX = /* groq */ `{
  "total": count(*[_type == "movie"]),
  "items": *[_type == "movie"] ${PUBLISHED_DESC}[$offset...$end] ${MOVIE_CARD}
}`;

export const GET_BLOG_INDEX = /* groq */ `{
  "total": count(*[_type == "blogPost"]),
  "items": *[_type == "blogPost"] ${PUBLISHED_DESC}[$offset...$end] ${BLOG_POST_CARD}
}`;

export const GET_CATEGORIES_INDEX = /* groq */ `{
  "total": count(*[_type == "category"]),
  "items": *[_type == "category"] ${PUBLISHED_DESC}[$offset...$end] ${CATEGORY_CARD}
}`;

/* -------------------------------------------------------------------------- */
/* 10. Standalone rails                                                       */
/* -------------------------------------------------------------------------- */

export const GET_FEATURED_SERIES = /* groq */ `*[
  _type == "series" && featured == true
] ${TITLE_ASC}[0...$limit] ${SERIES_CARD}`;

export const GET_POPULAR_SERIES = /* groq */ `*[
  _type == "series"
] | order(count(*[_type == "episode" && references(^._id)]) desc, title asc)[0...$limit] ${SERIES_CARD}`;

export const GET_LATEST_EPISODES = /* groq */ `*[
  _type == "episode"
] ${LATEST_DESC}[0...$limit] ${EPISODE_CARD}`;

export const GET_LATEST_MOVIES = /* groq */ `*[
  _type == "movie"
] ${LATEST_DESC}[0...$limit] ${MOVIE_CARD}`;

export const GET_LATEST_POSTS = /* groq */ `*[
  _type == "blogPost"
] ${PUBLISHED_DESC}[0...$limit] ${BLOG_POST_CARD}`;

/* -------------------------------------------------------------------------- */
/* 11. Homepage — every section in ONE round trip                             */
/* -------------------------------------------------------------------------- */

export const GET_HOME_PAGE = /* groq */ `{
  "settings": *[_type == "siteSettings"][0] ${SITE_SETTINGS},
  "hero": *[_type == "series"] | order(
    select(featured == true => 0, 1) asc,
    coalesce(publishedAt, _createdAt) desc
  )[0] ${SERIES_HERO},
  "featuredSeries": *[_type == "series" && featured == true]
    ${TITLE_ASC}[0...$featuredLimit] ${SERIES_CARD},
  "latestEpisodes": *[_type == "episode"]
    ${LATEST_DESC}[0...$episodeLimit] ${EPISODE_CARD},
  "popularSeries": *[_type == "series"] | order(
    count(*[_type == "episode" && references(^._id)]) desc,
    title asc
  )[0...$seriesLimit] ${SERIES_CARD},
  "movies": *[_type == "movie"]
    ${LATEST_DESC}[0...$movieLimit] ${MOVIE_CARD},
  "articles": *[_type == "blogPost"]
    ${PUBLISHED_DESC}[0...$articleLimit] ${BLOG_POST_CARD},
  "categories": *[_type == "category"] | order(
    count(*[_type in [${CATEGORY_ITEM_TYPES}] && ${CATEGORY_MATCH}]) desc,
    title asc
  )[0...$categoryLimit] ${CATEGORY_CARD}
}`;

/* -------------------------------------------------------------------------- */
/* 12. Static generation & sitemap                                            */
/* -------------------------------------------------------------------------- */

/**
 * Slug source for `generateStaticParams`. Only publicly reachable documents are
 * listed — seasons only when they own a slug.
 */
export const GET_ALL_SLUGS = /* groq */ `*[
  _type in $types && defined(slug.current) && slug.current != ""
]{ "slug": slug.current }`;

/**
 * Sitemap rows for every published document. `lastModified` uses `updatedAt`
 * and falls back to `publishedAt` then `_updatedAt` — never an invented date.
 */
export const GET_SITEMAP_ROWS = /* groq */ `*[
  _type in $types && defined(slug.current) && slug.current != "" &&
  coalesce(seo.noIndex, false) != true &&
  (!defined(publishedAt) || dateTime(publishedAt) <= dateTime(now()))
] ${PUBLISHED_DESC} {
  "path": "/" + slug.current + "/",
  "lastModified": coalesce(updatedAt, publishedAt, _updatedAt),
  "type": _type
}`;

/* -------------------------------------------------------------------------- */
/* 13. Search                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One query across every searchable type. Titles use `match` (tokenised search)
 * and the `keywords` array is matched literally, so SEO keywords entered in the
 * Studio genuinely contribute to discovery.
 */
export const GET_SEARCH_RESULTS = /* groq */ `{
  "series": *[_type == "series" && (title match $term || $term in keywords)]
    ${TITLE_ASC}[0...$limit] ${SERIES_CARD},
  "season": *[_type == "season" && (title match $term || $term in keywords)]
    ${TITLE_ASC}[0...$limit] ${SEASON_CARD},
  "episode": *[_type == "episode" && (title match $term || $term in keywords)]
    ${LATEST_DESC}[0...$limit] ${EPISODE_CARD},
  "movie": *[_type == "movie" && (title match $term || $term in keywords)]
    ${TITLE_ASC}[0...$limit] ${MOVIE_CARD},
  "blogPost": *[_type == "blogPost" && (title match $term || $term in keywords || excerpt match $term)]
    ${PUBLISHED_DESC}[0...$limit] ${BLOG_POST_CARD},
  "category": *[_type == "category" && (title match $term || $term in keywords)]
    ${TITLE_ASC}[0...$limit] ${CATEGORY_CARD}
}`;

/** Pure-numeric searches ("85") resolve to episodes by `episodeNumber`. */
export const GET_EPISODES_BY_NUMBER = /* groq */ `*[
  _type == "episode" && episodeNumber == $number
] ${EPISODE_ASC}[0...$limit] ${EPISODE_CARD}`;

/* -------------------------------------------------------------------------- */
/* 14. Page-shaped batch queries                                              */
/*                                                                             */
/* Detail templates need several projections of the same document. These       */
/* composites collapse them into ONE Content Lake round trip each, keyed by     */
/* the flat slug, so no page needs more than two requests total.               */
/* -------------------------------------------------------------------------- */

export const GET_SERIES_PAGE_DATA = /* groq */ `{
  "series": *[_type == "series" && defined(slug.current) && slug.current == $slug][0] ${SERIES},
  "seasons": *[_type == "season" && series->slug.current == $slug] ${SEASON_ASC} ${SEASON_TAB},
  "latestEpisodes": *[_type == "episode" && series->slug.current == $slug]
    ${LATEST_DESC}[0...$latestLimit] ${EPISODE_CARD},
  "seasonCount": count(*[_type == "season" && series->slug.current == $slug]),
  "episodeCount": count(*[_type == "episode" && series->slug.current == $slug])
}`;

/** Follow-up for the series page — needs the resolved series genres. */
export const GET_SERIES_AUX = /* groq */ `{
  "related": *[
    _type == "series" && _id != $seriesId && count(genres[@ in $genres]) > 0
  ] ${TITLE_ASC}[0...$limit] ${SERIES_CARD}
}`;

export const GET_SEASON_PAGE_DATA = /* groq */ `{
  "season": *[_type == "season" && defined(slug.current) && slug.current == $slug][0] ${SEASON},
  "episodes": *[_type == "episode" && season->slug.current == $slug]
    ${EPISODE_ASC}[$offset...$end] ${EPISODE_CARD},
  "total": count(*[_type == "episode" && season->slug.current == $slug])
}`;

export const GET_EPISODE_PAGE_DATA = /* groq */ `*[
  _type == "episode" && defined(slug.current) && slug.current == $slug
][0] ${EPISODE}`;

/** Follow-up for the episode page — resolved references + related content. */
export const GET_EPISODE_AUX = /* groq */ `{
  "previous": *[
    _type == "episode" && series._ref == $seriesId && _id != $episodeId &&
    (
      (defined($seasonNumber) && seasonNumber < $seasonNumber) ||
      ((!defined($seasonNumber) || seasonNumber == $seasonNumber) && episodeNumber < $episodeNumber)
    )
  ] ${EPISODE_DESC}[0] ${EPISODE_CARD},
  "next": *[
    _type == "episode" && series._ref == $seriesId && _id != $episodeId &&
    (
      (defined($seasonNumber) && seasonNumber > $seasonNumber) ||
      ((!defined($seasonNumber) || seasonNumber == $seasonNumber) && episodeNumber > $episodeNumber)
    )
  ] ${EPISODE_ASC}[0] ${EPISODE_CARD},
  "seasonEpisodes": *[
    _type == "episode" && season._ref == $seasonId
  ] ${EPISODE_ASC}[0...$limit] ${EPISODE_CARD},
  "seasonEpisodeTotal": count(*[_type == "episode" && season._ref == $seasonId]),
  "related": *[
    _type == "episode" && _id != $episodeId && (
      series._ref == $seriesId ||
      count(series->genres[@ in $genres]) > 0
    )
  ] ${LATEST_DESC}[0...$limit] ${EPISODE_CARD}
}`;

export const GET_CATEGORY_PAGE_DATA = /* groq */ `*[
  _type == "category" && defined(slug.current) && slug.current == $slug
][0] {
  ...${CATEGORY},
  "total": count(*[_type in [${CATEGORY_ITEM_TYPES}] && ${CATEGORY_MATCH}]),
  "items": (
      (*[_type == "series" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
    + (*[_type == "season" && ${CATEGORY_MATCH}] ${SEASON_ASC})
    + (*[_type == "episode" && ${CATEGORY_MATCH}] ${EPISODE_ASC})
    + (*[_type == "movie" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
    + (*[_type == "blogPost" && ${CATEGORY_MATCH}] ${PUBLISHED_DESC})
  )[$offset...$end]
}`;

export const GET_BLOG_POST_AUX = /* groq */ `{
  "related": *[
    _type == "blogPost" && _id != $postId &&
    count(categories[@._ref in $categoryIds]) > 0
  ] ${PUBLISHED_DESC}[0...$limit] ${BLOG_POST_CARD},
  "latest": *[_type == "blogPost" && _id != $postId]
    ${PUBLISHED_DESC}[0...$latestLimit] ${BLOG_POST_CARD}
}`;

export const GET_MOVIE_AUX = /* groq */ `{
  "related": *[
    _type == "movie" && _id != $movieId && count(genres[@ in $genres]) > 0
  ] ${TITLE_ASC}[0...$limit] ${MOVIE_CARD}
}`;

/* -------------------------------------------------------------------------- */
/* Named exports used by `lib/sanity/content.ts`                              */
/* -------------------------------------------------------------------------- */

export const SITEMAP_TYPES = CONTENT_TYPES;

export const queries = {
  RESOLVE_BY_SLUG,
  GET_SERIES_BY_SLUG,
  GET_SEASON_BY_SLUG,
  GET_EPISODE_BY_SLUG,
  GET_MOVIE_BY_SLUG,
  GET_BLOG_POST_BY_SLUG,
  GET_CATEGORY_BY_SLUG,
  GET_PAGE_BY_SLUG,
  GET_PAGES_BY_SLUGS,
  GET_SITE_SETTINGS,
  GET_SERIES_SEASONS,
  GET_SERIES_EPISODES,
  GET_SERIES_EPISODES_COUNT,
  GET_SERIES_LATEST_EPISODES,
  GET_SERIES_RELATED,
  GET_SEASON_EPISODES,
  GET_SEASON_EPISODES_COUNT,
  GET_EPISODE_SIBLINGS,
  GET_SEASON_EPISODES_PREVIEW,
  GET_RELATED_EPISODES,
  GET_RELATED_POSTS,
  GET_LATEST_POSTS_EXCLUDING,
  GET_RELATED_MOVIES,
  GET_CATEGORY_ITEMS,
  GET_POPULAR_CATEGORIES,
  GET_SERIES_INDEX,
  GET_MOVIES_INDEX,
  GET_BLOG_INDEX,
  GET_CATEGORIES_INDEX,
  GET_FEATURED_SERIES,
  GET_POPULAR_SERIES,
  GET_LATEST_EPISODES,
  GET_LATEST_MOVIES,
  GET_LATEST_POSTS,
  GET_HOME_PAGE,
  GET_EPISODE_PAGE_DATA,
  GET_EPISODE_AUX,
  GET_SERIES_PAGE_DATA,
  GET_SERIES_AUX,
  GET_SEASON_PAGE_DATA,
  GET_CATEGORY_PAGE_DATA,
  GET_BLOG_POST_AUX,
  GET_MOVIE_AUX,
  GET_ALL_SLUGS,
  GET_SITEMAP_ROWS,
  GET_SEARCH_RESULTS,
  GET_EPISODES_BY_NUMBER,
} as const;