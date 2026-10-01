import { EpisodeList } from "@/components/episodes/EpisodeList";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { MetaList, Stat } from "@/components/ui/MetaList";
import { Pagination } from "@/components/ui/Pagination";
import { Prose } from "@/components/ui/Prose";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSeasonPageData, getSeriesPageData } from "@/lib/sanity";
import { resolveImage } from "@/lib/sanity/image";
import { rootPath } from "@/lib/site/routes";
import { formatCount, formatSeasonNumber } from "@/lib/utils";

/**
 * Season page — `/sultan-muhammad-fateh-season-4/`.
 *
 * Only seasons the editor gave a public slug are routable, so this template is
 * exclusively for the "season has its own URL" case. Episodes paginate with plain
 * query-string links, which keeps the URLs crawlable and the component stateless.
 */
export async function SeasonTemplate({
  slug,
  page,
  pageSize = 24,
}: {
  slug: string;
  page: number;
  pageSize?: number;
}) {
  const { season, episodes, total } = await getSeasonPageData(slug, page, pageSize);

  if (!season) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const seriesTitle = season.series?.title ?? null;
  const heroImage = resolveImage(season.banner ?? season.poster, {
    width: 1920,
    alt: season.title,
  });

  // One extra request gives the rail real series context instead of repeating
  // the episodes already listed above.
  const seriesLatest =
    season.series?.slug ? (await getSeriesPageData(season.series.slug, 12)).latestEpisodes : [];

  return (
    <>
      <div className="relative h-[50svh] w-full overflow-hidden bg-ink-950">
        <ResponsiveImage
          src={heroImage?.src ?? null}
          alt={heroImage?.alt ?? season.title}
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
              ...(seriesTitle && season.series?.slug
                ? [{ name: seriesTitle, path: season.series.slug }]
                : [{ name: "Series", path: rootPath("turkish-series") }]),
              { name: season.title, path: `${rootPath(slug)}${page > 1 ? `?page=${page}` : ""}` },
            ]}
          />
          <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
            {seriesTitle ? `${seriesTitle} · Season` : "Season"}
          </p>
          <h1 className="mt-3 max-w-4xl text-display-2xl text-parchment-50">
            {formatSeasonNumber(season.seasonNumber) || season.title}
          </h1>
          {season.description?.length ? (
            <div className="mt-5 max-w-3xl text-sm leading-relaxed text-parchment-200 sm:text-base">
              <Prose value={season.description} narrow />
            </div>
          ) : null}
        </Container>
      </Section>

      <Section spacing="md" className="!py-10 sm:!py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <MetaList
            items={[
              { label: "Season", value: formatSeasonNumber(season.seasonNumber) },
              { label: "Series", value: seriesTitle },
              {
                label: "Released",
                value: season.publishedAt ? new Date(season.publishedAt).getFullYear() : null,
              },
            ]}
          />
          <Stat label="Episodes" value={formatCount(total)} />
        </div>
      </Section>

      <Section tone="raised" spacing="md" id="episodes">
        <SectionHeader
          eyebrow="Episodes"
          title={formatSeasonNumber(season.seasonNumber) || season.title}
          description={
            total > pageSize
              ? `Showing ${pageSize} of ${formatCount(total)} episodes.`
              : `All ${formatCount(total)} episodes in this season.`
          }
          action={
            seriesTitle && season.series?.slug
              ? { href: rootPath(season.series.slug), label: `Back to ${seriesTitle}` }
              : undefined
          }
        />

        <EpisodeList
          episodes={episodes}
          emptyDescription="This season has no published episodes yet."
        />

        <Pagination
          page={page}
          pageCount={pageCount}
          basePath={rootPath(slug)}
          label={`${season.title} pagination`}
        />
      </Section>

      {seriesLatest.length > 0 ? (
        <RelatedContent
          eyebrow="Keep watching"
          title={seriesTitle ? `More from ${seriesTitle}` : "More episodes"}
          items={seriesLatest}
          layout="rail"
          ratio="tile"
          action={
            season.series?.slug
              ? { href: rootPath(season.series.slug), label: "All episodes" }
              : undefined
          }
        />
      ) : null}
    </>
  );
}
