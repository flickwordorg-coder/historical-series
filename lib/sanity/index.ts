/**
 * Public Sanity surface.
 *
 * Components and pages import from `@/lib/sanity` only. Deep imports stay
 * possible for advanced use, but the barrel is the documented entry point so
 * internal file moves never ripple through the UI.
 */

export { sanityImageSrcSet, imageAspectRatio, imageBlurDataUrl, resolveImage, sanityImageUrl } from "./image";
export type { ResolvedImage } from "./image";

export {
  isSanityConfigured,
  isSanityStrict,
  REVALIDATE,
  SANITY_API_VERSION,
  SANITY_DATASET,
  sanityTag,
} from "./client";

export {
  CONTENT_TYPE_LABEL,
  CONTENT_TYPE_ORDER,
  CONTENT_TYPES,
  authorOf,
  embedUrlOf,
  primaryImageOf,
  seoFieldsOf,
  toCard,
} from "./types";

export type {
  AnyContentDocument,
  BlogPost,
  BlogPostCard,
  CardSource,
  Category,
  CategoryCard,
  ChangeFrequency,
  ContentCardData,
  ContentDocument,
  ContentResolutionSlots,
  ContentType,
  Episode,
  EpisodeCard,
  HomePageData,
  Movie,
  MovieCard,
  Page,
  Paginated,
  PortableTextBlock,
  Reference,
  SanityImage,
  SearchResult,
  Season,
  SeasonCard,
  SeasonTab,
  Series,
  SeriesCard,
  SitemapEntry,
  SitemapRow,
  SiteSettings,
} from "./types";

export * from "./content";