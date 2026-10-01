/**
 * SEO layer entry point.
 *
 * Import from `@/lib/seo` so metadata and JSON-LD helpers stay swappable in one
 * place. Nothing outside this directory should build an Open Graph object or a
 * `<script type="application/ld+json">` payload.
 */

export { SEO } from "./constants";

export {
  absoluteUrl,
  canonicalForArchive,
  canonicalForSlug,
  generateCanonicalUrl,
  paginatedUrl,
} from "./urls";

export {
  formatEpisodeNumber,
  formatEpisodeTitle,
  formatSeasonNumber,
  generateArchiveMetadata,
  generateContentMetadata,
  generateHomeMetadata,
} from "./metadata";
export type { GenerateMetadataOptions, SeoSource } from "./metadata";

export {
  articleJsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  organizationJsonLd,
  videoObjectJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from "./json-ld";
export type { ArticleInput, CollectionInput, Crumb, VideoInput } from "./json-ld";