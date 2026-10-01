import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ArchiveHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Section } from "@/components/ui/Section";
import { JsonLdSet } from "@/components/seo/JsonLd";
import { getAllSeriesIndex, getDefaultOgImageUrl } from "@/lib/sanity";
import { collectionPageJsonLd, generateArchiveMetadata } from "@/lib/seo";
import { formatCount, readPageParam } from "@/lib/utils";

/**
 * Series archive — `/turkish-series/`.
 *
 * Paginated with plain `?page=` links so every page is crawlable and linkable
 * without JavaScript. Page 1 is the canonical URL.
 */

const PAGE_SIZE = 24;
const TITLE = "Turkish historical series";
const DESCRIPTION =
  "Browse every Turkish historical drama in the archive — Ottoman sultans, conquests and court intrigue, with a complete episode index for each series.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  return generateArchiveMetadata({
    title: TITLE,
    description: DESCRIPTION,
    canonical: "/turkish-series/",
    keywords: ["turkish series", "historical dramas", "ottoman series", "episode list"],
    image: await getDefaultOgImageUrl(),
    page: readPageParam(query.page),
  });
}

export default async function SeriesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = readPageParam(query.page);

  const { items, total, pageCount } = await getAllSeriesIndex(page, PAGE_SIZE);

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: TITLE,
            slug: "turkish-series",
            description: DESCRIPTION,
            itemCount: total,
            page,
          }),
        ]}
      />

      <ArchiveHero eyebrow="Archive" title={TITLE} description="Dramas spanning the Ottoman centuries and beyond — every one indexed down to the episode.">
        <Breadcrumbs crumbs={[{ name: TITLE, path: `/turkish-series/${page > 1 ? `?page=${page}` : ""}` }]} />
      </ArchiveHero>

      <Section spacing="md">
        {items.length > 0 ? (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-parchment-400">
              {formatCount(total)} series
            </p>

            <ContentGrid items={items} ratio="square" columns={5} priorityCount={5} />

            <Pagination
              page={page}
              pageCount={pageCount}
              basePath="/turkish-series/"
              label="Series pagination"
            />
          </>
        ) : (
          <EmptyState
            icon="archive"
            title="No series published yet"
            description="Series appear here as soon as they are published in the Studio."
          />
        )}
      </Section>
    </>
  );
}
