"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary for the Studio.
 *
 * `ssr: false` is load-bearing: `StudioRoot` imports `sanity.config.ts`, which
 * throws at module scope if `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing. Deferring
 * the import keeps that failure out of the server render and lets the page's
 * `isSanityConfigured()` guard own the unconfigured case.
 *
 * The fixed layer is what lets `/studio` live inside the site shell without a
 * route group: it covers the sticky header, footer and scroll-to-top button
 * instead of being laid out between them. Above every site z-index (header 80,
 * mobile nav 90, search dialog 100).
 */
const StudioRoot = dynamic(() => import("./StudioRoot"), {
  ssr: false,
});

export function StudioClient() {
  return (
    <div className="fixed inset-0 z-100 bg-ink-950">
      <StudioRoot />
    </div>
  );
}
