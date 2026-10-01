import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLdSet } from "@/components/seo/JsonLd";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ArchiveHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Section } from "@/components/ui/Section";
import { getAllCategoryIndex, getDefaultOgImageUrl } from "@/lib/sanity";
import { collectionPageJsonLd, generateArchiveMetadata } from "@/lib/seo";
import { formatCount, readPageParam } from "@/lib/utils";

/**
 * Category directory — `/categories/`.
 *
 * Categories are cross-cutting (periods, regions, themes), so this page is the
 * main discovery surface for grouped content.
 */

const PAGE_SIZE = 24;
const TITLE = "Browse by category";
const DESCRIPTION =
  "Explore the archive by category — Ottoman periods, dynasties, regions and themes, each collecting the series, episodes, movies and articles that belong to it.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  return generateArchiveMetadata({
    title: TITLE,
    description: DESCRIPTION,
    canonical: "/categories/",
    keywords: ["categories", "ottoman empire", "by period", "browse history"],
    image: await getDefaultOgImageUrl(),
    page: readPageParam(query.page),
  });
}

export default async function CategoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = readPageParam(query.page);

  const { items, total, pageCount } = await getAllCategoryIndex(page, PAGE_SIZE);

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: TITLE,
            slug: "categories",
            description: DESCRIPTION,
            itemCount: total,
            page,
          }),
        ]}
      />

      <ArchiveHero eyebrow="Explore" title={TITLE} description="Periods, dynasties, regions and themes — each one collecting everything in the archive that belongs to it.">
        <Breadcrumbs crumbs={[{ name: TITLE, path: `/categories/${page > 1 ? `?page=${page}` : ""}` }]} />
      </ArchiveHero>

      <Section spacing="md">
        {items.length > 0 ? (
          <>
            <p className="mb-6 text-xs uppercase tracking-[0.16em] text-parchment-400">
              {formatCount(total)} categories
            </p>

            <ContentGrid items={items} ratio="tile" columns={4} priorityCount={4} />

            <Pagination
              page={page}
              pageCount={pageCount}
              basePath="/categories/"
              label="Category pagination"
            />
          </>
        ) : (
          <EmptyState
            icon="compass"
            title="No categories yet"
            description="Categories are created in the Studio and appear here automatically."
          />
        )}
      </Section>
    </>
  );
}
