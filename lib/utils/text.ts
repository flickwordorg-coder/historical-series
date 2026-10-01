import type { PortableTextBlock } from "@/lib/sanity/types";

/** Joins non-empty parts with a separator — the canonical meta-line builder. */
export function joinMeta(...parts: Array<string | number | null | undefined>): string {
  return parts
    .map((part) => (typeof part === "number" ? String(part) : (part ?? "").trim()))
    .filter((part) => part.length > 0)
    .join(" · ");
}

/** Truncates on a word boundary and appends an ellipsis when shortened. */
export function truncate(value: string, maxLength: number, suffix = "…"): string {
  const text = value.trim();
  if (text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${base.replace(/[\s,.;:-]+$/, "")}${suffix}`;
}

/**
 * Builds a meta description: uses the supplied description, clamped to `maxLength`
 * so Google never truncates mid-word.
 */
export function clampMetaDescription(value: string, maxLength = 160): string {
  return truncate(value, maxLength);
}

/**
 * Flattens Portable Text to plain text for <meta name="description">, OG tags and
 * JSON-LD. Returns "" for empty documents instead of an empty-ish string.
 */
export function plainTextFromPortableText(
  value: PortableTextBlock[] | null | undefined,
  maxLength?: number,
): string {
  if (!value?.length) return "";

  const text = value
    .filter((block) => block._type === "block" && Array.isArray(block.children))
    .flatMap((block) => block.children.map((child) => child.text ?? ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return maxLength ? clampMetaDescription(text, maxLength) : text;
}

/** URL-safe slug. Mirrors the Studio's slug generation so previews match reality. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

/** Uppercases the first character only — used for genre/status chips. */
export function titleCase(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Removes diacritics so search matching works for transliterated titles. */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}