import Link from "next/link";

import { resolveImage } from "@/lib/sanity/image";
import type { ContentCardData, SeasonTab } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";
import { cn, formatSeasonNumber } from "@/lib/utils";

/**
 * Complete-season episode list.
 *
 * Reused by the series page, the season page, the episode page and the category
 * page — the only differences are the props. Rows are links to each episode's
 * ROOT-LEVEL slug; ordering always comes from `episodeNumber`/`seasonNumber`,
 * never from the slug.
 */
export function EpisodeList({
  episodes,
  activeEpisodeId,
  showSeries = false,
  maxHeight,
  className,
  emptyDescription,
}: {
  episodes: readonly ContentCardData[];
  /** Highlights the current episode when the list appears on an episode page. */
  activeEpisodeId?: string;
  /** Show the owning series name (useful on category/search pages). */
  showSeries?: boolean;
  /** Collapse into a scrollable panel on long seasons. */
  maxHeight?: string;
  className?: string;
  emptyDescription?: string;
}) {
  if (episodes.length === 0) {
    return (
      <p className="rounded-[var(--radius-panel)] border border-dashed border-white/10 bg-ink-900/60 px-5 py-8 text-center text-sm text-parchment-400">
        {emptyDescription ?? "No episodes have been published for this collection yet."}
      </p>
    );
  }

  return (
    <ol
      className={cn("divide-y divide-white/5 overflow-y-auto", className)}
      {...(maxHeight ? { style: { maxHeight } } : {})}
    >
      {episodes.map((episode) => (
        <EpisodeRow
          key={episode._id}
          episode={episode}
          active={episode._id === activeEpisodeId}
          showSeries={showSeries}
        />
      ))}
    </ol>
  );
}

function EpisodeRow({
  episode,
  active,
  showSeries,
}: {
  episode: ContentCardData;
  active: boolean;
  showSeries: boolean;
}) {
  const href = episode.slug ? rootPath(episode.slug) : null;
  const thumbnail = resolveImage(episode.image, { width: 320, alt: episode.title });

  const content = (
    <>
      <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-ink-800 sm:w-36">
        {thumbnail?.src ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${thumbnail.src}")` }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-ink-950/35"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-parchment-100/90">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm font-medium sm:text-[0.9375rem]",
            active ? "text-gold-200" : "text-parchment-50",
          )}
        >
          {episode.title}
        </span>

        <span className="mt-1 block text-xs text-parchment-400">
          {[episode.badge, episode.meta, showSeries ? episode.subtitle : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>

      {active ? (
        <span className="sr-only">(currently playing this episode)</span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <li className="flex items-center gap-3 py-3 sm:gap-4">
        <span className="opacity-60">{content}</span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 px-2 py-3 transition hover:bg-ink-800/70 sm:gap-4 sm:px-3",
          active && "bg-ink-800/80 ring-1 ring-inset ring-gold-400/30",
        )}
      >
        {content}
      </Link>
    </li>
  );
}

/**
 * Season switcher.
 *
 * Renders plain `<a>` elements (in-page anchors on the series page, real links to
 * the season's own page when it has a public slug) so season switching needs no
 * client JavaScript at all.
 */
export function SeasonTabs({
  seasons,
  activeSeasonNumber,
  className,
}: {
  seasons: readonly SeasonTab[];
  /** Highlights the season whose section is currently in view / being viewed. */
  activeSeasonNumber?: number | null;
  className?: string;
}) {
  if (seasons.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {seasons.map((season) => {
        const isActive = season.seasonNumber === activeSeasonNumber;
        const ownPage = season.hasPublicSlug && season.slug;
        const anchorId = seasonAnchorId(season.seasonNumber);
        const href = ownPage ? rootPath(season.slug) : `#${anchorId}`;

        const content = (
          <>
            {formatSeasonNumber(season.seasonNumber) || season.title}
            {typeof season.episodeCount === "number" ? (
              <span className={isActive ? "text-ink-950/70" : "text-parchment-500"}>
                {season.episodeCount}
              </span>
            ) : null}
            {!ownPage ? (
              <span aria-hidden="true" className="text-[0.6rem] uppercase tracking-wider opacity-60">
                in page
              </span>
            ) : null}
          </>
        );

        return (
          <li key={season._id}>
            <a
              href={href}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition",
                isActive
                  ? "bg-gold-400 text-ink-950 ring-gold-400"
                  : "bg-ink-800 text-parchment-200 ring-white/10 hover:bg-ink-700 hover:text-parchment-50",
              )}
            >
              {content}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Stable in-page anchor for a season section on the series page. */
export function seasonAnchorId(seasonNumber: number | null | undefined): string {
  return seasonNumber ? `season-${seasonNumber}` : "season-episodes";
}