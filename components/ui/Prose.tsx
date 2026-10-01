import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { sanityImageUrl } from "@/lib/sanity/image";
import type { PortableTextBlock } from "@/lib/sanity/types";
import { cn } from "@/lib/utils";

/**
 * Portable Text renderer.
 *
 * Typography-first and completely server-rendered — no client JS. Heading levels
 * can be shifted so a document that starts at h2 still produces a correct
 * document outline inside a page whose h1 is the title.
 */
export interface ProseProps {
  value?: PortableTextBlock[] | null;
  className?: string;
  /** 0 = render h2 as h2, 1 = render h2 as h3, … */
  headingOffset?: number;
  /** Constrain measure; defaults to a comfortable reading width. */
  narrow?: boolean;
}

function buildComponents(headingOffset: number): PortableTextComponents {
  return {
    block: {
      h2: ({ children }) => (
        <Heading level={2 + headingOffset} className="mt-10 text-display-md text-parchment-50">
          {children}
        </Heading>
      ),
      h3: ({ children }) => (
        <Heading level={3 + headingOffset} className="mt-8 text-xl font-semibold text-parchment-50">
          {children}
        </Heading>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-8 border-l-2 border-gold-400/60 pl-5 font-display text-lg italic text-parchment-200 sm:text-xl">
          {children}
        </blockquote>
      ),
      normal: ({ children }) => (
        <p className="my-4 text-pretty leading-[1.75] text-parchment-200">{children}</p>
      ),
    },

    list: {
      bullet: ({ children }) => (
        <ul className="my-5 list-disc space-y-2 pl-6 text-parchment-200 marker:text-gold-400">
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className="my-5 list-decimal space-y-2 pl-6 text-parchment-200 marker:text-gold-400">
          {children}
        </ol>
      ),
    },

    marks: {
      link: ({ children, value }) => {
        const href = typeof value?.href === "string" ? value.href : "";
        if (!href) return <>{children}</>;

        const isExternal = /^https?:\/\//i.test(href);

        return (
          <a
            href={href}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
            className="font-medium text-gold-300 underline decoration-gold-400/40 underline-offset-4 transition hover:text-gold-200 hover:decoration-gold-300"
          >
            {children}
            {isExternal ? (
              <span aria-hidden="true" className="ml-1 align-super text-[0.7em]">
                ↗
              </span>
            ) : null}
          </a>
        );
      },
      strong: ({ children }) => <strong className="font-semibold text-parchment-50">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <u className="underline underline-offset-4">{children}</u>,
    },

    types: {
      image: ({ value }) => <ProseImage value={value as ProseImageValue} />,
    },
  };
}

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

/** Renders a clamped heading level while keeping the shared typography classes. */
function Heading({
  level,
  className,
  children,
}: {
  level: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = `h${Math.min(6, Math.max(2, Math.trunc(level)))}` as HeadingTag;
  return <Tag className={className}>{children}</Tag>;
}

export function Prose({ value, className, headingOffset = 0, narrow = true }: ProseProps) {
  if (!value?.length) return null;

  return (
    <div
      className={cn(
        "[&_>:first-child]:mt-0 [&_>:last-child]:mb-0",
        narrow && "max-w-2xl",
        className,
      )}
    >
      <PortableText value={value} components={buildComponents(headingOffset)} />
    </div>
  );
}

interface ProseImageValue {
  asset?: { _ref?: string };
  alt?: string;
  caption?: string;
}

function ProseImage({ value }: { value: ProseImageValue }) {
  const ref = value?.asset?._ref;
  if (!ref) return null;

  const src = sanityImageUrl(
    { asset: { _ref: ref, url: null, metadata: null }, alt: value.alt ?? null, hotspot: null },
    1200,
  );

  return (
    <figure className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-[var(--radius-panel)] bg-ink-800">
        <Image src={src} alt={value.alt ?? ""} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
      </div>
      {value.caption ? (
        <figcaption className="mt-3 text-center text-xs text-parchment-400">{value.caption}</figcaption>
      ) : null}
    </figure>
  );
}