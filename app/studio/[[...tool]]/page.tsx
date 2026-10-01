import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

import { isSanityConfigured } from "@/lib/sanity";

import { StudioClient } from "./StudioClient";

/**
 * Embedded Sanity Studio, served from the same origin as the site.
 *
 * The catch-all is required: the Studio owns real URLs beneath `/studio`
 * (`/studio/introduction`, `/studio/structure/<type>/<id>`, …), and
 * `basePath: "/studio"` in `sanity.config.ts` makes the Studio router and the
 * Next router agree on where those paths live.
 */

export const metadata: Metadata = {
  ...studioMetadata,
  title: "Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = studioViewport;

/**
 * Absent when no project id is set. Imported lazily by `StudioClient`, so this
 * guard is also what keeps `sanity.config.ts` (which throws on missing env) out
 * of the module graph on a fresh clone — a build with no `.env.local` 404s here
 * instead of crashing.
 */
export default function StudioPage() {
  if (!isSanityConfigured()) notFound();

  return <StudioClient />;
}
