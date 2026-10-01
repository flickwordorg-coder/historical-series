import { EpisodeList, SeasonTabs, seasonAnchorId } from "@/components/episodes/EpisodeList";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Badge";
import { ContentRail } from "@/components/ui/ContentCard";
import { Container } from "@/components/ui/Container";
import { MetaList, Stat } from "@/components/ui/MetaList";
import { Prose } from "@/components/ui/Prose";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getRelatedSeries,
  getSeriesEpisodeGroups,
  getSeriesPageData,
} from "@/lib/sanity";
import type { ContentCardData } from "@/lib/sanity/types";
import { resolveImage } from "@/lib/sanity/image";
import { rootPath } from "@/lib/site/routes";
import { formatCount, formatSeasonNumber } from "@/lib/utils";

/**
 * Series page — `/sultan-muhammad-fateh/`.
 *
 * Data shape: one `getSeriesPageData()` request plus one grouped-episode request
 * and one related-series request (React `cache()` dedupes them across the page).
 *
 * Season switching is server-rendered anchors — no client JS, no state, and each
 * season is still reachable on its own root-level URL when the editor gave it a
 * public slug.
 */
export async function SeriesTemplate({ slug }: { slug: string }) {
  const { series, seasons, latestEpisodes, seasonCount, episodeCount } =
    await getSeriesPageData(slug);

  if (!series) return null;

  const [groups, related] = await Promise.all([
    getSeriesEpisodeGroups(series._id),
    getRelatedSeries(series._id, series.genres ?? [], 8),
  ]);

  // `latestEpisodes` arrives newest-first, so index 0 is the newest published episode.
  const firstEpisode: ContentCardData | null = latestEpisodes[0] ?? null;
  const playHref = firstEpisode?.slug ? rootPath(firstEpisode.slug) : null;
  const totalEpisodes = episodeCount || groups.reduce((sum, group) => sum + group.episodes.length, 0);
  const heroImage = resolveImage(series.banner ?? series.poster, {
    width: 1920,
    alt: series.title,
  });

  return (
    <>
      <div className="relative h-[50svh] w-full overflow-hidden bg-ink-950">
        <ResponsiveImage
          src={heroImage?.src ?? null}
          alt={heroImage?.alt ?? series.title}
          blurDataURL={heroImage?.blurDataURL ?? null}
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <Section spacing="sm">
        <Container>
        <Breadcrumbs
          crumbs={[
            { name: "Series", path: rootPath("turkish-series") },
            { name: series.title, path: rootPath(series.slug) },
          ]}
        />
          <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
            Turkish historical series
          </p>
          <h1 className="mt-3 max-w-4xl text-display-2xl text-parchment-50">{series.title}</h1>
          {series.description?.length ? (
            <div className="mt-5 max-w-3xl text-sm leading-relaxed text-parchment-200 sm:text-base">
              <Prose value={series.description} narrow />
            </div>
          ) : null}
        </Container>
      </Section>

      <Section spacing="md" className="!py-10 sm:!py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <MetaList
            items={[
              { label: "Status", value: series.status },
              { label: "Released", value: series.releaseYear },
              { label: "Country", value: series.country },
              { label: "Language", value: series.language },
              {
                label: "Genres",
                value: series.genres?.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {series.genres.map((genre) => (
                      <Chip key={genre}>{genre}</Chip>
                    ))}
                  </span>
                ) : null,
              },
            ]}
          />

          <div className="flex gap-6">
            <Stat label="Seasons" value={formatCount(seasonCount)} />
            <Stat label="Episodes" value={formatCount(totalEpisodes)} />
          </div>
        </div>

        {playHref ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={playHref}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
            >
              <span aria-hidden="true">▶</span>
              Start watching
            </a>
            {seasons[0]?.hasPublicSlug && seasons[0].slug ? (
              <a
                href={rootPath(seasons[0].slug)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50"
              >
                {formatSeasonNumber(seasons[0].seasonNumber)} episode list
              </a>
            ) : null}
          </div>
        ) : null}
      </Section>

      {groups.length > 0 ? (
        <Section tone="raised" spacing="md" id="episodes">
          <SectionHeader
            eyebrow="Episodes"
            title="Complete episode list"
            description="Every published episode, grouped by season. Each title opens on its own page with the player, description and navigation."
          />

          <SeasonTabs seasons={seasons} className="mb-8" />

          <div className="space-y-12">
            {groups.map((group, index) => {
              const tab = seasons.find((season) => season.seasonNumber === group.seasonNumber);
              const headingId = seasonAnchorId(group.seasonNumber);
              const first = group.episodes[0];

              return (
                <section
                  key={headingId}
                  id={headingId}
                  aria-labelledby={`${headingId}-title`}
                  className="scroll-mt-32"
                >
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-white/8 pb-3">
                    <h3 id={`${headingId}-title`} className="text-display-md text-parchment-50">
                      {formatSeasonNumber(group.seasonNumber) || "Episodes"}
                      {tab && tab.seasonNumber !== group.seasonNumber ? (
                        <span className="ml-2 text-base font-normal text-parchment-400">
                          {tab.title}
                        </span>
                      ) : null}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-parchment-400">
                      <span>
                        {group.episodes.length} episode{group.episodes.length === 1 ? "" : "s"}
                      </span>
                      {tab?.hasPublicSlug && tab.slug ? (
                        <a
                          href={rootPath(tab.slug)}
                          className="font-semibold text-gold-300 underline-offset-4 hover:underline"
                        >
                          Season page →
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <EpisodeList
                    episodes={group.episodes}
                    maxHeight={group.episodes.length > 12 ? "36rem" : undefined}
                    emptyDescription={
                      index === 0
                        ? "No episodes have been published yet."
                        : undefined
                    }
                  />

                  {first ? (
                    <p className="mt-3 text-xs text-parchment-500">
                      <a href={rootPath(first.slug)} className="underline underline-offset-4">
                        Jump to {first.title}
                      </a>
                    </p>
                  ) : null}
                </section>
              );
            })}
          </div>
        </Section>
      ) : (
        <Section tone="raised" spacing="md">
          <SectionHeader
            eyebrow="Episodes"
            title="No episodes published yet"
            description="This series exists in the CMS but has no published episodes. Episodes appear here as soon as they are published."
          />
        </Section>
      )}

      {latestEpisodes.length > 0 ? (
        <Section spacing="md">
          <SectionHeader
            eyebrow="Recently added"
            title="Latest episodes"
            action={{ href: rootPath("turkish-series"), label: "All series" }}
          />
          <ContentRail
            items={latestEpisodes}
            ratio="tile"
            ariaLabel={`Latest episodes of ${series.title}`}
          />
        </Section>
      ) : null}

      <RelatedContent
        eyebrow="More to explore"
        title="Related series"
        description="Other historical dramas from the archive."
        items={related}
        layout="rail"
        ratio="poster"
        hideWhenEmpty
      />
    </>
  );
}
