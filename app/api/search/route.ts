import { NextResponse } from "next/server";

import { searchContent } from "@/lib/sanity";
import { REVALIDATE } from "@/lib/sanity/client";

/**
 * JSON search endpoint used by the header dialog.
 *
 * Same query as the server-rendered `/search/` page — the client never talks to
 * Sanity directly, so the Content Lake is only ever reached through the cached
 * data layer in `lib/sanity/content.ts`.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const term = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (term.length < 2) {
    return NextResponse.json({ query: term, results: [] });
  }

  try {
    const results = await searchContent(term, 8);

    return NextResponse.json(
      { query: term, results },
      {
        headers: {
          // Short shared cache: fast enough for typeahead, fresh enough for a new episode.
          "Cache-Control": `public, s-maxage=${REVALIDATE.aggregates}, stale-while-revalidate=60`,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
