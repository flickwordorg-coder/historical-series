import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLdSet } from "@/components/seo/JsonLd";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ArchiveHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Section } from "@/components/ui/Section";
import { getAllBlogPostIndex, getDefaultOgImageUrl } from "@/lib/sanity";
import { collectionPageJsonLd, generateArchiveMetadata } from "@/lib/seo";
import { formatCount, readPageParam } from "@/lib/utils";

/** Article archive — `/blog/`. Tile-ratio cards, newest first. */

const PAGE_SIZE = 12;
const TITLE = "History articles";
const DESCRIPTION =
  "Long-form articles on the sultans, battles and centuries behind Turkish historical drama — written from the archive, not the press release.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  return generateArchiveMetadata({
    title: TITLE,
    description: DESCRIPTION,
    canonical: "/blog/",
    keywords: ["history articles", "ottoman history", "turkish history", "historical drama explained"],
    image: await getDefaultOgImageUrl(),
    page: readPageParam(query.page),
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = readPageParam(query.page);

  const { items, total, pageCount } = await getAllBlogPostIndex(page, PAGE_SIZE);

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: TITLE,
            slug: "blog",
            description: DESCRIPTION,
            itemCount: total,
            page,
          }),
        ]}
      />

      <ArchiveHero eyebrow="The archive" title={TITLE} description="The real history behind the screen — context, correction and detail.">
        <Breadcrumbs crumbs={[{ name: TITLE, path: `/blog/${page > 1 ? `?page=${page}` : ""}` }]} />
      </ArchiveHero>

      <Section spacing="md">
        {items.length > 0 ? (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-parchment-400">
              {formatCount(total)} articles
            </p>

            <ContentGrid items={items} ratio="tile" columns={3} priorityCount={3} />

            <Pagination
              page={page}
              pageCount={pageCount}
              basePath="/blog/"
              label="Article pagination"
            />
          </>
        ) : (
          <EmptyState
            icon="compass"
            title="No articles yet"
            description="History articles appear here as soon as they are published in the Studio."
          />
        )}
      </Section>
    </>
  );
}
