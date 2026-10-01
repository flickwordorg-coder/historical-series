import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLdSet } from "@/components/seo/JsonLd";
import { BlogPostTemplate } from "@/components/templates/BlogPostTemplate";
import { CategoryTemplate } from "@/components/templates/CategoryTemplate";
import { EpisodeTemplate } from "@/components/templates/EpisodeTemplate";
import { MovieTemplate } from "@/components/templates/MovieTemplate";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { SeasonTemplate } from "@/components/templates/SeasonTemplate";
import { SeriesTemplate } from "@/components/templates/SeriesTemplate";
import {
  articleJsonLd,
  canonicalForSlug,
  collectionPageJsonLd,
  generateArchiveMetadata,
  generateContentMetadata,
  videoObjectJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import {
  authorOf,
  embedUrlOf,
  getAllSlugs,
  getContentBySlug,
  getDefaultOgImageUrl,
  getSeriesPageData,
  isSanityConfigured,
  primaryImageOf,
  seoFieldsOf,
  type ContentDocument,
} from "@/lib/sanity";
import { resolveImage } from "@/lib/sanity/image";
import { plainTextFromPortableText, readPageParam } from "@/lib/utils";

/**
 * THE flat content route.
 *
 * `/[slug]/` is the single entry point for every CMS document. The slug is
 * resolved in a deterministic order (episode → series → season → movie →
 * blogPost → category → page) by `getContentBySlug`, and anything unclaimed is a
 * 404. The public URL never exposes the series/season/episode hierarchy — that
 * relationship only exists in Sanity.
 */

type Params = Promise<{ slug: string }>;
type Query = Promise<Record<string, string | string[] | undefined>>;

/** Shared page size for the two paginated templates. */
const PAGE_SIZE = 24;

/* -------------------------------------------------------------------------- */
/* Static params                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Pre-renders every publicly reachable document URL.
 *
 * Returns `[]` when Sanity is not configured, which leaves the route fully
 * dynamic instead of failing the build — exactly what a fresh clone without
 * credentials needs.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  if (!isSanityConfigured()) return [];

  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Query;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const page = readPageParam(query.page);

  const resolved = await getContentBySlug(slug);
  if (!resolved) notFound();

  switch (resolved.type) {
    case "series":
      return <SeriesRoute resolved={resolved} />;
    case "season":
      return <SeasonRoute resolved={resolved} page={page} />;
    case "episode":
      return <EpisodeRoute resolved={resolved} />;
    case "movie":
      return <MovieRoute resolved={resolved} />;
    case "blogPost":
      return <ArticleRoute resolved={resolved} />;
    case "category":
      return <CategoryRoute resolved={resolved} page={page} />;
    case "page":
      return <StaticPageRoute resolved={resolved} />;
  }
}

/* -------------------------------------------------------------------------- */
/* Per-type route bodies                                                      */
/* -------------------------------------------------------------------------- */

type Typed<K extends ContentDocument["type"]> = Extract<ContentDocument, { type: K }>;

async function SeriesRoute({ resolved }: { resolved: Typed<"series"> }) {
  const { series } = await getSeriesPageData(resolved.document.slug ?? "");

  // The slug resolved a moment ago but the composite query came back empty —
  // treat it as gone rather than rendering a broken page.
  if (!series) notFound();

  const poster = resolveImage(series.poster, { width: 1200, alt: series.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: series.title,
            slug: series.slug,
            description: series.seoDescription ?? plainTextFromPortableText(series.description),
            image: poster?.src,
            itemCount: series.episodeCount ?? null,
          }),
        ]}
      />
      <SeriesTemplate slug={series.slug ?? ""} />
    </>
  );
}

function SeasonRoute({ resolved, page }: { resolved: Typed<"season">; page: number }) {
  const season = resolved.document;
  const poster = resolveImage(season.poster, { width: 1200, alt: season.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: season.title,
            slug: season.slug,
            description: season.seoDescription ?? plainTextFromPortableText(season.description),
            image: poster?.src,
            page,
          }),
        ]}
      />
      <SeasonTemplate slug={season.slug ?? ""} page={page} pageSize={PAGE_SIZE} />
    </>
  );
}

function EpisodeRoute({ resolved }: { resolved: Typed<"episode"> }) {
  const episode = resolved.document;
  const thumbnail = resolveImage(episode.thumbnail, { width: 1200, alt: episode.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          videoObjectJsonLd({
            title: episode.title,
            slug: episode.slug,
            description: episode.seoDescription ?? plainTextFromPortableText(episode.description),
            thumbnail: thumbnail?.src,
            thumbnailAlt: thumbnail?.alt ?? episode.title,
            embedUrl: episode.embedUrl,
            duration: episode.duration,
            uploadDate: episode.publishedAt,
            seriesTitle: episode.series?.title ?? null,
          }),
        ]}
      />
      <EpisodeTemplate episode={episode} />
    </>
  );
}

function MovieRoute({ resolved }: { resolved: Typed<"movie"> }) {
  const movie = resolved.document;
  const poster = resolveImage(movie.poster, { width: 1200, alt: movie.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          videoObjectJsonLd({
            title: movie.title,
            slug: movie.slug,
            description: movie.seoDescription ?? plainTextFromPortableText(movie.description),
            thumbnail: poster?.src,
            thumbnailAlt: poster?.alt ?? movie.title,
            embedUrl: movie.embedUrl,
            duration: movie.duration,
            uploadDate: movie.publishedAt,
          }),
        ]}
      />
      <MovieTemplate movie={movie} />
    </>
  );
}

function ArticleRoute({ resolved }: { resolved: Typed<"blogPost"> }) {
  const post = resolved.document;
  const image = resolveImage(post.featuredImage, { width: 1200, alt: post.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          articleJsonLd({
            title: post.title,
            slug: post.slug,
            description:
              post.seoDescription ?? post.excerpt ?? plainTextFromPortableText(post.body),
            image: image?.src,
            imageAlt: post.featuredImage?.alt ?? post.title,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            author: post.author,
            keywords: post.keywords,
            section: post.categories?.[0]?.title ?? null,
          }),
        ]}
      />
      <BlogPostTemplate post={post} />
    </>
  );
}

function CategoryRoute({ resolved, page }: { resolved: Typed<"category">; page: number }) {
  const category = resolved.document;
  const image = resolveImage(category.image, { width: 1200, alt: category.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          collectionPageJsonLd({
            name: category.title,
            slug: category.slug,
            description: category.seoDescription ?? plainTextFromPortableText(category.description),
            image: image?.src,
            itemCount: category.itemCount ?? null,
            page,
          }),
        ]}
      />
      <CategoryTemplate category={category} page={page} pageSize={PAGE_SIZE} />
    </>
  );
}

function StaticPageRoute({ resolved }: { resolved: Typed<"page"> }) {
  const page = resolved.document;
  const image = resolveImage(page.image, { width: 1200, alt: page.title });

  return (
    <>
      <JsonLdSet
        nodes={[
          webPageJsonLd({
            title: page.title,
            slug: page.slug,
            description: page.seoDescription ?? plainTextFromPortableText(page.description),
            image: image?.src,
            modifiedAt: page.updatedAt,
          }),
        ]}
      />
      <PageTemplate page={page} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One metadata factory for all seven document types. The CMS `seo` object wins,
 * the body/excerpt is the fallback, and the canonical is always the clean
 * root-level slug, with a page-specific canonical for paginated collections.
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Query;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const page = readPageParam(query.page);

  const resolved = await getContentBySlug(slug);

  if (!resolved) {
    return {
      title: "Not found",
      robots: { index: false, follow: false },
    };
  }

  const document = resolved.document;
  const image = resolveImage(primaryImageOf(document), { width: 1200, alt: document.title });
  const defaultImage = image ? undefined : await getDefaultOgImageUrl();
  const shareImage = image?.src ?? defaultImage;
  const seo = seoFieldsOf(document);

  /* Seasons and categories are paginated collections with self-canonical pages. */
  if (resolved.type === "season" || resolved.type === "category") {
    return generateArchiveMetadata({
      title: document.seoTitle?.trim() || document.title,
      description: resolved.document.seoDescription ?? resolved.document.description,
      canonical: canonicalForSlug(document.slug),
      image: shareImage,
      keywords: document.keywords,
      noIndex: seo.noIndex,
      publishedAt: document.publishedAt,
      page,
    });
  }

  /* Episodes get a series-prefixed title so the SERP entry is unambiguous. */
  const title =
    resolved.type === "episode" && resolved.document.series?.title
      ? `${resolved.document.series.title} — ${document.title}`
      : document.title;

  const fallbackDescription =
    resolved.type === "blogPost"
      ? resolved.document.excerpt ?? resolved.document.body
      : resolved.document.description;

  return generateContentMetadata({
    slug: document.slug,
    title,
    description: seo.seoDescription ?? fallbackDescription,
    seoTitle: seo.seoTitle,
    seoDescription: seo.seoDescription,
    keywords: seo.keywords,
    noIndex: seo.noIndex,
    image: shareImage,
    imageAlt: image?.alt ?? document.title,
    publishedAt: document.publishedAt,
    modifiedAt: document.updatedAt,
    author: authorOf(document),
    type:
      resolved.type === "blogPost"
        ? "article"
        : resolved.type === "episode" || resolved.type === "movie"
          ? "video.other"
          : "website",
    embedUrl: embedUrlOf(document),
  });
}
