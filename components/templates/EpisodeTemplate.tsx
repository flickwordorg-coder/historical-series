import { EpisodeNavigation } from "@/components/episodes/EpisodeNavigation";
import { EpisodePlayer } from "@/components/episodes/EpisodePlayer";
import { EpisodeList } from "@/components/episodes/EpisodeList";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { MetaList } from "@/components/ui/MetaList";
import { Prose } from "@/components/ui/Prose";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { getEpisodeAuxData } from "@/lib/sanity";
import type { Episode } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";
import { parseEmbedUrl } from "@/lib/video";
import { formatDuration, formatSeasonNumber } from "@/lib/utils";

/**
 * Episode page — `/sultan-muhammad-fateh-episode-85-in-urdu-subtitles/`.
 *
 * This is the site's primary landing surface, so it is optimised for one tap to
 * play: the player sits above the fold on desktop, the description and facts sit
 * beside it, and previous/next are derived from Sanity relationships plus
 * `seasonNumber`/`episodeNumber` — never from the slug.
 */
export async function EpisodeTemplate({ episode }: { episode: Episode }) {
  const { previous, next, seasonEpisodes, seasonEpisodeTotal, related } =
    await getEpisodeAuxData(episode, { seasonPreview: 200, related: 8 });

  const seriesTitle = episode.series?.title ?? null;
  const seriesSlug = episode.series?.slug ?? null;
  const seasonTitle = episode.season?.title ?? null;
  const hasPlayableEmbed = parseEmbedUrl(episode.embedUrl).status === "ready";

  return (
    <>
      <Section spacing="sm" bleed className="!py-0">
        <Container className="pt-6 pb-8 sm:pt-8">
          <Breadcrumbs
            crumbs={[
              {
                name: seriesTitle ?? "Series",
                path: seriesSlug ? rootPath(seriesSlug) : rootPath("turkish-series"),
              },
              {
                name: seasonTitle ?? `Season ${episode.seasonNumber ?? "?"}`,
                ...(episode.season?.slug ? { path: episode.season.slug } : {}),
              },
              { name: episode.title, path: rootPath(episode.slug) },
            ]}
          />

          <h1 className="mt-4 max-w-4xl text-display-xl text-parchment-50">
            {episode.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {typeof episode.episodeNumber === "number" ? (
              <Chip>{`Episode ${episode.episodeNumber}`}</Chip>
            ) : null}
            {episode.seasonNumber ? <Chip>{formatSeasonNumber(episode.seasonNumber)}</Chip> : null}
            {formatDuration(episode.duration) ? (
              <Chip>{formatDuration(episode.duration)}</Chip>
            ) : null}
            {seriesTitle ? <Chip>{seriesTitle}</Chip> : null}
          </div>
        </Container>
      </Section>

      <Container className="pb-14 sm:pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <EpisodePlayer episode={episode} />

            <EpisodeNavigation previous={previous} next={next} className="mt-8" />

            {episode.description?.length ? (
              <section aria-labelledby="episode-overview" className="mt-12">
                <h2 id="episode-overview" className="text-display-md text-parchment-50">
                  Episode overview
                </h2>
                <Prose value={episode.description} className="mt-4" />
              </section>
            ) : null}

            {seasonEpisodes.length > 0 ? (
              <section aria-labelledby="episode-season" className="mt-14">
                <SectionHeader
                  eyebrow={seasonTitle ?? `Season ${episode.seasonNumber ?? ""}`.trim()}
                  title="All episodes in this season"
                  description={
                    seasonEpisodeTotal > seasonEpisodes.length
                      ? `Showing ${seasonEpisodes.length} of ${seasonEpisodeTotal} published episodes.`
                      : undefined
                  }
                  as="h2"
                  action={
                    seriesSlug ? { href: rootPath(seriesSlug), label: "Full series" } : undefined
                  }
                />
                <EpisodeList
                  episodes={seasonEpisodes}
                  activeEpisodeId={episode._id}
                  maxHeight={seasonEpisodes.length > 12 ? "40rem" : undefined}
                />
              </section>
            ) : null}
          </div>

          {/* Facts column — the second grid cell on large screens. */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-panel)] bg-ink-900 p-6 ring-1 ring-inset ring-white/8">
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-parchment-400">
                Episode information
              </h2>

              <MetaList
                columns={1}
                className="mt-4"
                items={[
                  { label: "Episode", value: episode.episodeNumber ?? null },
                  { label: "Season", value: formatSeasonNumber(episode.seasonNumber) },
                  { label: "Series", value: seriesTitle },
                  { label: "Runtime", value: formatDuration(episode.duration) },
                  { label: "Published", value: episode.publishedAt ? new Date(episode.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) : null },
                ]}
              />

              {seriesSlug ? (
                <a
                  href={rootPath(seriesSlug)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
                >
                  All {seriesTitle ?? "series"} episodes
                </a>
              ) : null}
            </div>

            {/*
              External episodes already render in the main player above, so the
              sidebar only needs an escape hatch for when that source refuses to
              play. Two iframes of the same video on one page means double the
              third-party requests for no benefit.
            */}
            {episode.videoType === "external" && !hasPlayableEmbed ? (
              <div className="mt-4">
                <VideoPlayer
                  embedUrl={episode.embedUrl}
                  title={episode.title}
                  variant="external"
                  compact
                />
              </div>
            ) : null}
          </aside>
        </div>
      </Container>

      <RelatedContent
        eyebrow="More to watch"
        title="Related episodes"
        description={seriesTitle ? `More episodes from ${seriesTitle} and similar series.` : undefined}
        items={related}
        layout="rail"
        ratio="tile"
        hideWhenEmpty
      />
    </>
  );
}
