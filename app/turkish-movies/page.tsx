import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLdSet } from "@/components/seo/JsonLd";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ArchiveHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Section } from "@/components/ui/Section";
import { getAllMovieIndex, getDefaultOgImageUrl } from "@/lib/sanity";
import { collectionPageJsonLd, generateArchiveMetadata } from "@/lib/seo";
import { formatCount, readPageParam } from "@/lib/utils";

/** Movie archive — `/turkish-movies/`. Mirrors the series archive exactly. */

const PAGE_SIZE = 24;
const TITLE = "Turkish historical movies";
const DESCRIPTION =
  "Feature-length Turkish historical films — Ottoman epics, war dramas and period pieces, all collected in one place.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  return generateArchiveMetadata({
    title: TITLE,
    description: DESCRIPTION,
    canonical: "/turkish-movies/",
    keywords: ["turkish movies", "historical films", "ottoman movies", "turkish cinema"],
    image: await getDefaultOgImageUrl(),
    page: readPageParam(query.page),
  });
}

export default async function MovieIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = readPageParam(query.page);

  const { items, total, pageCount } = await getAllMovieIndex(page, PAGE_SIZE);

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: TITLE,
            slug: "turkish-movies",
            description: DESCRIPTION,
            itemCount: total,
            page,
          }),
        ]}
      />

      <ArchiveHero eyebrow="Archive" title={TITLE} description="Feature-length period dramas, ordered newest first.">
        <Breadcrumbs crumbs={[{ name: TITLE, path: `/turkish-movies/${page > 1 ? `?page=${page}` : ""}` }]} />
      </ArchiveHero>

      <Section spacing="md">
        {items.length > 0 ? (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-parchment-400">
              {formatCount(total)} movies
            </p>

            <ContentGrid items={items} ratio="poster" columns={5} priorityCount={5} />

            <Pagination
              page={page}
              pageCount={pageCount}
              basePath="/turkish-movies/"
              label="Movie pagination"
            />
          </>
        ) : (
          <EmptyState
            icon="video"
            title="No movies published yet"
            description="Movies appear here as soon as they are published in the Studio."
          />
        )}
      </Section>
    </>
  );
}
