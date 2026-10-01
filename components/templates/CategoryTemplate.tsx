import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ContentHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategoryPageData } from "@/lib/sanity";
import type { Category } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";
import { formatCount } from "@/lib/utils";

/**
 * Category page — `/ottoman-empire/`.
 *
 * Categories mix series, seasons, episodes, movies and articles, so the grid is
 * mixed-ratio and every card still resolves to its own root-level slug.
 */
export async function CategoryTemplate({
  category,
  page,
  pageSize = 24,
}: {
  category: Category;
  page: number;
  pageSize?: number;
}) {
  const { items, total } = await getCategoryPageData(category, page, pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <ContentHero
        eyebrow="Category"
        title={category.title}
        description={<Prose value={category.description} narrow className="text-sm" />}
        image={category.image}
        bleed
      >
        <Breadcrumbs
          crumbs={[
            { name: "Categories", path: rootPath("categories") },
            { name: category.title, path: `${rootPath(category.slug)}${page > 1 ? `?page=${page}` : ""}` },
          ]}
        />
      </ContentHero>

      <Section spacing="md">
        <SectionHeader
          eyebrow={`${formatCount(total)} item${total === 1 ? "" : "s"}`}
          title="Browse this category"
          description="Series, seasons, episodes, movies and articles, newest first."
          action={
            category.series?.slug
              ? { href: rootPath(category.series.slug), label: `All of ${category.series.title}` }
              : undefined
          }
        />

        {items.length > 0 ? (
          <>
            <ContentGrid items={items} ratio="tile" size="md" columns={4} />
            <Pagination
              page={page}
              pageCount={pageCount}
              basePath={rootPath(category.slug)}
              label={`${category.title} pagination`}
            />
          </>
        ) : (
          <EmptyState
            icon="archive"
            title="Nothing here yet"
            description={`No published content has been tagged to ${category.title} so far. New items appear here automatically as they are published.`}
            action={{ href: rootPath("categories"), label: "Browse all categories" }}
          />
        )}
      </Section>
    </>
  );
}
