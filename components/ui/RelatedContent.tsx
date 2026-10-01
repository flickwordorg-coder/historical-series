import type { ContentCardData } from "@/lib/sanity";

import { ContentGrid, ContentRail } from "./ContentCard";
import { EmptyState } from "./EmptyState";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";

/**
 * Related / recommended content block.
 *
 * Reused by series, season, episode, movie, blog and category pages, which is why
 * the section copy, the ratio and the layout are all props instead of being
 * re-implemented per template.
 */
export interface RelatedContentProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: readonly ContentCardData[];
  layout?: "grid" | "rail";
  ratio?: "poster" | "tile";
  size?: "sm" | "md" | "lg";
  rank?: boolean;
  action?: { href: string; label: string };
  headingLevel?: "h2" | "h3";
  className?: string;
  /** Collapses the whole section when there is nothing to show. */
  hideWhenEmpty?: boolean;
  emptyDescription?: string;
}

export function RelatedContent({
  eyebrow = "You may also like",
  title,
  description,
  items,
  layout = "rail",
  ratio = "poster",
  size = "md",
  rank = false,
  action,
  headingLevel = "h2",
  className,
  hideWhenEmpty = false,
  emptyDescription,
}: RelatedContentProps) {
  if (items.length === 0) {
    if (hideWhenEmpty) return null;
    return (
      <Section tone="sunken" spacing="sm" className={className}>
        <SectionHeader eyebrow={eyebrow} title={title} as={headingLevel} />
        <EmptyState
          compact
          icon="compass"
          title="No recommendations yet"
          description={emptyDescription ?? "We are adding more titles to this collection soon."}
        />
      </Section>
    );
  }

  return (
    <Section tone="sunken" spacing="md" className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={action}
        as={headingLevel}
      />
      {layout === "rail" ? (
        <ContentRail items={items} ratio={ratio} size={size} rank={rank} ariaLabel={title} />
      ) : (
        <ContentGrid items={items} ratio={ratio} size={size} rank={rank} columns={ratio === "tile" ? 3 : 5} />
      )}
    </Section>
  );
}