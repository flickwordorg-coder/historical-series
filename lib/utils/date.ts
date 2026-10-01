/**
 * Date formatting. Every human-readable date in the app funnels through here so
 * the format is consistent and locale-aware (and so hydration never mismatches —
 * we always format in UTC and use a fixed locale).
 */

const DISPLAY_LOCALE = "en-GB";
const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

/** Parses a Sanity datetime, tolerating `null`/undefined by returning null. */
export function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `12 March 2026` — used for `publishedAt` / `updatedAt` metadata lines. */
export function formatDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** `12 Mar 2026` — compact variant for dense lists and table cells. */
export function formatShortDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * `3 days ago`. Returns "" for null so callers can skip rendering the element.
 * `now` is injectable to keep this pure and testable.
 */
export function formatRelativeTime(
  value?: string | null,
  now: Date = new Date(),
): string {
  const date = toDate(value);
  if (!date) return "";

  const diff = date.getTime() - now.getTime();
  const formatter = new Intl.RelativeTimeFormat(DISPLAY_LOCALE, { numeric: "auto" });

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return formatter.format(0, "minute");
}

/** ISO 8601 for `<time dateTime>` and JSON-LD. */
export function toIsoString(value?: string | null): string | undefined {
  return toDate(value)?.toISOString();
}

/** True when the value is in the future (used for embargo / `noIndex` logic). */
export function isFuture(value?: string | null, now: Date = new Date()): boolean {
  const date = toDate(value);
  return date ? date.getTime() > now.getTime() : false;
}