import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/EmptyState";
import { Container } from "@/components/ui/Container";
import { SiteLogo } from "@/components/layout/SiteLogo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * 404 page.
 *
 * Root-level URLs mean a mistyped slug lands here. The search hint and the
 * archive links are the two things a lost visitor actually needs.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col justify-center py-20">
      <SiteLogo />

      <div className="mt-10 max-w-2xl">
        <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
          <span aria-hidden="true" className="rule-gold h-px w-6" />
          Error 404
        </p>

        <h1 className="mt-3 text-display-2xl text-parchment-50">This page is not in the archive</h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-parchment-300">
          The address you followed does not match any published series, season, episode, movie,
          article or page. It may have been renamed, or the link may be mistyped.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
          >
            Back home
          </Link>
          <Link
            href="/search/"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50"
          >
            Search the archive
          </Link>
          <Link
            href="/turkish-series/"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50"
          >
            All series
          </Link>
        </div>
      </div>

      <div className="mt-12 max-w-3xl">
        <EmptyState
          compact
          icon="compass"
          title="Looking for a specific episode?"
          description="Every episode has its own root-level page. Try searching for the series name plus the episode number."
          action={{ href: "/turkish-series/", label: "Browse series" }}
        />
      </div>
    </Container>
  );
}
