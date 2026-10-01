import Link from "next/link";

import { resolveImage } from "@/lib/sanity/image";
import type { ContentCardData } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";
import { cn } from "@/lib/utils";

import { ResponsiveImage } from "./ResponsiveImage";

/**
 * THE card. Every grid, rail, search result and related-content block on the
 * site renders this component — series, seasons, episodes, movies, articles and
 * categories all share it.
 *
 * It is a pure presentational component: data comes in through props, nothing is
 * fetched, and the link is always the document's root-level slug.
 */

export interface ContentCardProps {
  item: ContentCardData;
  /** `square` for series, `poster` for portraits, `tile` for landscape cards. */
  ratio?: "square" | "poster" | "tile" | "wide";
  /** Show the rank ribbon (numbered rails). */
  rank?: boolean;
  /** Larger type for hero-adjacent cards. */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  className?: string;
  /** Renders a heading for each card, keeping document outlines meaningful. */
  headingLevel?: "h2" | "h3" | "h4";
}

const RATIO: Record<NonNullable<ContentCardProps["ratio"]>, string> = {
  square: "aspect-square",
  poster: "aspect-[2/3]",
  tile: "aspect-video",
  wide: "aspect-[21/9]",
};

const WIDTH: Record<NonNullable<ContentCardProps["ratio"]>, number> = {
  square: 640,
  poster: 420,
  tile: 640,
  wide: 960,
};

const SIZES: Record<NonNullable<ContentCardProps["ratio"]>, string> = {
  square: "(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw",
  poster: "(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw",
  tile: "(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw",
  wide: "(max-width: 1024px) 92vw, 60vw",
};

const TITLE_SIZE: Record<NonNullable<ContentCardProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-sm sm:text-[0.9375rem]",
  lg: "text-base sm:text-lg",
};

export function ContentCard({
  item,
  ratio,
  rank = false,
  size = "md",
  priority = false,
  className,
  headingLevel: Tag = "h3",
}: ContentCardProps) {
  const cardRatio = ratio ?? (item._type === "series" ? "square" : "poster");
  const href = item.slug ? rootPath(item.slug) : null;
  const image = resolveImage(item.image, {
    width: WIDTH[cardRatio],
    alt: item.title,
  });

  const card = (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-card)] bg-ink-800 shadow-[var(--shadow-card)]",
          "ring-1 ring-inset ring-white/5 transition duration-300",
          "group-hover:-translate-y-1 group-hover:ring-gold-400/40 group-hover:shadow-[var(--shadow-card-hover)]",
          "motion-reduce:transform-none motion-reduce:transition-none",
          RATIO[cardRatio],
        )}
      >
        <ResponsiveImage
          src={image?.src ?? null}
          alt={image?.alt ?? item.title}
          blurDataURL={image?.blurDataURL ?? null}
          sizes={SIZES[cardRatio]}
          priority={priority}
          className="transition-transform duration-500 motion-reduce:transform-none group-hover:scale-[1.04]"
          imgClassName="transition-transform duration-500 motion-reduce:transform-none group-hover:scale-[1.04]"
        />

        {/* Bottom scrim keeps text legible over any artwork. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/15 to-transparent"
        />

        {item.badge ? (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 rounded-full bg-ink-950/75 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-parchment-100 backdrop-blur-sm",
              cardRatio === "poster" && "text-[0.625rem]",
            )}
          >
            {item.badge}
          </span>
        ) : null}

        {rank && item.rank ? (
          <span
            aria-hidden="true"
            className="absolute right-2.5 bottom-2 font-display text-4xl leading-none text-gold-400/25"
          >
            {String(item.rank).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <Tag
        className={cn(
          "mt-3 line-clamp-2 font-medium text-parchment-100 transition-colors group-hover:text-gold-200",
          TITLE_SIZE[size],
        )}
      >
        {item.title}
      </Tag>

      {item.meta || item.subtitle ? (
        <p className="mt-1 line-clamp-1 text-xs text-parchment-400">
          {[item.meta, item.subtitle].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </>
  );

  const shared = cn("group block h-full focus-visible:outline-none", className);

  if (!href) {
    return <div className={shared} aria-disabled="true">{card}</div>;
  }

  return (
    <Link href={href} className={shared}>
      {/* Stretches the link over the whole card so the entire surface is clickable. */}
      <span className="absolute inset-0" aria-hidden="true" />
      {card}
    </Link>
  );
}

/**
 * A grid of cards. Responsive column counts live here so no page re-declares the
 * same breakpoints.
 */
export interface ContentGridProps {
  items: readonly ContentCardData[];
  ratio?: ContentCardProps["ratio"];
  rank?: boolean;
  size?: ContentCardProps["size"];
  priorityCount?: number;
  className?: string;
  /** `<ul>` semantics; each card renders as a list item. */
  as?: "ul" | "div";
  columns?: 2 | 3 | 4 | 5 | 6;
}

const COLUMNS: Record<NonNullable<ContentGridProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

export function ContentGrid({
  items,
  ratio,
  rank = false,
  size = "md",
  priorityCount = 0,
  className,
  as = "ul",
  columns = 5,
}: ContentGridProps) {
  if (items.length === 0) return null;

  const ListTag = as;

  return (
    <ListTag
      className={cn(
        "grid gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8",
        COLUMNS[columns],
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={item._id} className="relative">
          <ContentCard
            item={item}
            ratio={ratio}
            rank={rank}
            size={size}
            priority={index < priorityCount}
          />
        </li>
      ))}
    </ListTag>
  );
}

/**
 * Horizontally scrollable rail. Built on CSS `scroll-snap`, so it works with
 * zero JavaScript and stays keyboard accessible.
 */
export function ContentRail({
  items,
  ratio,
  rank = false,
  size = "md",
  className,
  ariaLabel,
}: {
  items: readonly ContentCardData[];
  ratio?: ContentCardProps["ratio"];
  rank?: boolean;
  size?: ContentCardProps["size"];
  className?: string;
  ariaLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn("rail -mx-4 px-4 sm:-mx-6 sm:px-6", className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item._id}>
          <ContentCard item={item} ratio={ratio} rank={rank} size={size} />
        </li>
      ))}
    </ul>
  );
}