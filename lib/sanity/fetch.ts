import "server-only";

import {
  getSanityClient,
  isSanityConfigured,
  isSanityStrict,
} from "./client";
import type { QueryParams } from "next-sanity";

/**
 * The ONLY function in the app that talks to the Sanity Content Lake.
 *
 * Responsibilities (kept here so no call site has to think about them):
 *  - guard against an unconfigured project (fresh clone must still build)
 *  - degrade to a typed fallback instead of 500-ing a page on a CMS blip
 *  - apply ISR revalidation + cache tags so a webhook can invalidate precisely
 *  - wrap params so GROQ injection is impossible (params are always bound, never interpolated)
 */

export interface SanityFetchOptions<T> {
  query: string;
  params?: QueryParams;
  /** Value returned when the project is unconfigured, the query fails, or the result is null. */
  fallback: T;
  /** Seconds of ISR caching. Omit for uncached reads. */
  revalidate?: number | false;
  /** Cache tags for targeted invalidation. */
  tags?: string[];
  /** Optional label used in error logs. Defaults to the query's first line. */
  label?: string;
}

const warned = new Set<string>();

function warnOnce(message: string, detail?: string): void {
  const key = `${message}|${detail ?? ""}`;
  if (warned.has(key)) return;
  warned.add(key);
  if (detail) console.warn(`[sanity] ${message} — ${detail}`);
  else console.warn(`[sanity] ${message}`);
}

function errorOnce(label: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  warnOnce(`query failed (${label})`, detail);
}

export async function sanityFetch<T>({
  query,
  params,
  fallback,
  revalidate,
  tags,
  label,
}: SanityFetchOptions<T>): Promise<T> {
  const name = label ?? query.trim().split("\n")[0]?.slice(0, 60) ?? "anonymous";

  if (!isSanityConfigured()) {
    warnOnce(
      "NEXT_PUBLIC_SANITY_PROJECT_ID is not set — serving fallback content",
      name,
    );
    if (isSanityStrict) {
      throw new Error(
        `SANITY_STRICT_MODE is enabled but NEXT_PUBLIC_SANITY_PROJECT_ID is missing (query: ${name})`,
      );
    }
    return fallback;
  }

  try {
    const result = await getSanityClient().fetch<T>(query, params ?? {}, {
      next: {
        revalidate: revalidate ?? false,
        ...(tags?.length ? { tags } : {}),
      },
    });

    // A single-document lookup legitimately resolves to null — that is not a fallback
    // case, the caller decides. Arrays use an explicit fallback of [] so `??` stays
    // meaningful for the (rare) documented null return.
    return (result ?? fallback) as T;
  } catch (error) {
    errorOnce(name, error);
    if (isSanityStrict) throw error;
    return fallback;
  }
}

/** Cache tag for "everything" — used by the revalidate webhook endpoint. */
export const ALL_TAGS = "sanity:all";