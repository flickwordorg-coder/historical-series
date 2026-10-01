/**
 * Public utility surface. Import from `@/lib/utils` — never deep-import a
 * helper file, so the internals stay free to move.
 */

export { cn } from "./cn";

export {
  formatCompact,
  formatCount,
  formatDuration,
  formatEpisodeNumber,
  formatSeasonNumber,
  clampPage,
  pageCount,
  paginationRange,
  readPageParam,
} from "./number";

export {
  clampMetaDescription,
  joinMeta,
  normalizeForSearch,
  plainTextFromPortableText,
  slugify,
  titleCase,
  truncate,
} from "./text";

export { absoluteUrl, generateCanonicalUrl, paginatedUrl } from "./url";

export {
  formatDate,
  formatRelativeTime,
  formatShortDate,
  isFuture,
  toDate,
  toIsoString,
} from "./date";

export { chunk, compact, isPresent, uniqueBy } from "./array";