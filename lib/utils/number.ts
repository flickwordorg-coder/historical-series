/**
 * Number / duration formatting used by episode cards and episode info tables.
 */

const LOCALE = "en-GB";

/** `Season 4`, `Episode 85` — keeps ordinal wording out of components. */
export function formatSeasonNumber(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `Season ${value}`;
}

export function formatEpisodeNumber(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `Episode ${value}`;
}

/** Seconds → `1h 42m` / `42m`. Returns "" when unknown (never guesses). */
export function formatDuration(seconds?: number | null): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${Math.max(minutes, 1)}m`;
}

/** `1,234` — exact counts in category chips and stats. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** `12.3K` — compact counts for stat bubbles. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Clamps a page number into `[1, pageCount]`. */
export function clampPage(page: number, pageCount: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), Math.max(pageCount, 1));
}

/**
 * Reads a `?page=` search param into a safe 1-based page number.
 *
 * Accepts the loose shapes Next.js gives us (`string | string[] | undefined`) and
 * clamps anything unusable back to page 1, so a hand-edited `?page=-99` or
 * `?page=abc` can never break a route.
 */
export function readPageParam(value: unknown): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" && typeof raw !== "number") return 1;
  const parsed = Number.parseInt(String(raw), 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

/**
 * Builds a `[start, end]` window for `Pagination` (e.g. `4 5 [6] 7 8`).
 * Returns an empty array when there is nothing to page through.
 */
export function paginationRange(
  page: number,
  pageCount: number,
  siblings = 1,
): Array<number | "start-ellipsis" | "end-ellipsis"> {
  if (pageCount <= 1) return [];

  const total = siblings * 2 + 5;
  if (total >= pageCount) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showStartEllipsis = left > 2;
  const showEndEllipsis = right < pageCount - 1;

  const range: Array<number | "start-ellipsis" | "end-ellipsis"> = [1];
  if (showStartEllipsis) range.push("start-ellipsis");
  for (let i = left; i <= right; i += 1) range.push(i);
  if (showEndEllipsis) range.push("end-ellipsis");
  range.push(pageCount);
  return range;
}

/** Total pages for a row count / page size pair. */
export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}