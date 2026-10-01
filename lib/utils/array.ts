/** Small array/collection helpers shared across listing pages. */

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [[...items]];
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** De-duplicates by a key, keeping the first occurrence. */
export function uniqueBy<T>(items: readonly T[], key: (item: T) => string | undefined): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const id = key(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}

/** Drops empty / nullish entries and narrows the type. */
export function compact<T>(items: ReadonlyArray<T | null | undefined>): T[] {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

/** Type guard used when Sanity returns `null` for an empty single-doc query. */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}