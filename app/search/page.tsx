import type { Metadata } from "next";

import { SearchForm } from "@/components/search/SearchForm";
import { ContentGrid } from "@/components/ui/ContentCard";
import { ArchiveHero } from "@/components/ui/ContentHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { Section } from "@/components/ui/Section";
import { searchContent } from "@/lib/sanity";
import { generateArchiveMetadata } from "@/lib/seo";

/**
 * Full search page — `/search/`.
 *
 * Server-rendered and works without JavaScript: the form is a plain GET to the
 * same path, so results are crawlable, shareable and fast. The header dialog
 * (`SearchDialog`) calls the same underlying query through `/api/search`.
 */
export const metadata: Metadata = generateArchiveMetadata({
  title: "Search",
  description: "Search every series, episode, movie and history article in the archive.",
  canonical: "/search/",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = Array.isArray(query.q) ? query.q[0] : query.q;
  const term = (raw ?? "").trim();

  const results = term.length >= 2 ? await searchContent(term, 24) : [];

  return (
    <>
      <ArchiveHero eyebrow="Search" title="Search the archive">
        <SearchForm defaultValue={term} />
      </ArchiveHero>

      <Section spacing="md">
        {term.length < 2 ? (
          <EmptyState
            icon="search"
            title="What are you looking for?"
            description="Search for a series name, an episode title or number, a movie, or a history article. Two characters are enough."
          />
        ) : results.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-parchment-400" aria-live="polite">
              {results.length} result{results.length === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-parchment-100">“{term}”</span>
            </p>

            <ContentGrid items={results} ratio="tile" columns={4} />
          </>
        ) : (
          <EmptyState
            icon="search"
            title={`No results for “${term}”`}
            description="Try a shorter or different term, or browse the archives instead."
            action={{ href: "/turkish-series/", label: "Browse all series" }}
          />
        )}
      </Section>
    </>
  );
}
