"use client";

import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

/**
 * The Studio itself.
 *
 * Rendered client-side only, inside `NextStudioLayout` (supplied by
 * `<NextStudio />`), which owns the full-viewport box and the Studio's global
 * styles. The site's `color-scheme: dark` is inherited from `globals.css`, so
 * the Studio is pinned to its light scheme rather than inheriting the archive
 * palette's form-control rendering.
 */
export default function StudioRoot() {
  return (
    <div className="[color-scheme:light]">
      <NextStudio config={config} />
    </div>
  );
}
