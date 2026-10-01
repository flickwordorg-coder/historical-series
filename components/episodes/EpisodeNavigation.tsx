import Link from "next/link";

import type { ContentCardData } from "@/lib/sanity";
import { rootPath } from "@/lib/site/routes";
import { cn } from "@/lib/utils";

/**
 * Previous / next episode navigation.
 *
 * Both sides are optional: the relationship-driven lookup returns `null` for the
 * first and last episode of a series, and this component then renders nothing on
 * that side — which is exactly the required behaviour.
 */
export function EpisodeNavigation({
  previous,
  next,
  className,
}: {
  previous: ContentCardData | null;
  next: ContentCardData | null;
  className?: string;
}) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Episode navigation"
      className={cn("grid gap-3 sm:grid-cols-2", className)}
    >
      {previous ? (
        <NavCard episode={previous} direction="previous" />
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      {next ? <NavCard episode={next} direction="next" /> : null}
    </nav>
  );
}

function NavCard({
  episode,
  direction,
}: {
  episode: ContentCardData;
  direction: "previous" | "next";
}) {
  const href = episode.slug ? rootPath(episode.slug) : null;
  const isNext = direction === "next";

  return (
    <Link
      href={href ?? "/"}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-panel)] bg-ink-900 p-4 ring-1 ring-inset ring-white/8 transition hover:bg-ink-800 hover:ring-gold-400/40",
        isNext && "sm:flex-row-reverse sm:text-right",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full bg-ink-800 text-gold-300 ring-1 ring-inset ring-white/10 transition group-hover:bg-gold-400 group-hover:text-ink-950",
          isNext && "sm:rotate-180",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
          <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <span className="min-w-0">
        <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-parchment-400">
          {isNext ? "Next episode" : "Previous episode"}
        </span>
        <span className="mt-1 block line-clamp-2 text-sm font-medium text-parchment-50 transition group-hover:text-gold-200">
          {episode.title}
        </span>
      </span>
    </Link>
  );
}