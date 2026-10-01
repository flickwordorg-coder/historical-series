import Link from "next/link";

import { resolveImage } from "@/lib/sanity";
import { cn } from "@/lib/utils";

import { Container } from "./Container";
import { ResponsiveImage } from "./ResponsiveImage";

const ACTION_VARIANT = {
  primary: "bg-gold-400 text-ink-950 hover:bg-gold-300",
  ghost:
    "border border-white/20 bg-white/5 text-parchment-100 hover:border-gold-400/50 hover:bg-white/10",
} as const;

/**
 * Cinematic page header shared by every detail template (series, season, movie,
 * category, article, page).
 *
 * It is a layout primitive: it renders artwork, a scrim, an eyebrow, the title,
 * meta and actions. It never fetches anything — the template passes props.
 */
export interface ContentHeroProps {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Small facts rendered under the title: country · language · year. */
  meta?: React.ReactNode;
  /** Primary/secondary CTAs. */
  actions?: Array<{ href: string; label: string; variant?: "primary" | "ghost" }>;
  /** 16:9 backdrop. Falls back to the poster when no banner exists. */
  image?: Parameters<typeof resolveImage>[0];
  imageAlt?: string;
  /** Optional portrait poster shown on the right on large screens. */
  poster?: Parameters<typeof resolveImage>[0];
  /** Rendered above the title, e.g. `<Breadcrumbs />`. */
  children?: React.ReactNode;
  /** Adds a bottom fade into the page background. */
  bleed?: boolean;
  size?: "default" | "tall";
  className?: string;
}

export function ContentHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  image,
  imageAlt,
  poster,
  children,
  bleed = true,
  size = "default",
  className,
}: ContentHeroProps) {
  const backdrop = resolveImage(image, { width: 1920, alt: imageAlt ?? title });
  const portrait = resolveImage(poster, { width: 480, alt: imageAlt ?? title });

  return (
    <header
      className={cn(
        "relative isolate overflow-hidden bg-ink-950",
        size === "tall" ? "min-h-[64vh] sm:min-h-[78vh]" : "min-h-[46vh] sm:min-h-[60vh]",
        className,
      )}
    >
      {/* Backdrop */}
      {backdrop?.src ? (
        <>
          <div className="absolute inset-0 -z-20">
            <ResponsiveImage
              src={backdrop.src}
              alt=""
              blurDataURL={backdrop.blurDataURL ?? null}
              sizes="100vw"
              priority
              className="scale-105"
            />
          </div>
          <div aria-hidden="true" className="scrim-left absolute inset-0 -z-10" />
          <div aria-hidden="true" className="scrim-bottom absolute inset-0 -z-10" />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-[radial-gradient(120%_100%_at_20%_0%,var(--color-ink-800),var(--color-ink-950))]"
          />
          <div aria-hidden="true" className="scrim-vignette absolute inset-0 -z-10" />
        </>
      )}

      <Container className="relative flex min-h-[inherit] flex-col justify-end pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pb-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-3xl">
            {children ? <div className="mb-5">{children}</div> : null}

            {eyebrow ? (
              <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
                <span aria-hidden="true" className="rule-gold h-px w-6" />
                {eyebrow}
              </p>
            ) : null}

            <h1 className="mt-3 text-display-2xl text-parchment-50">{title}</h1>

            {description ? (
              <div className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-parchment-200 sm:text-base">
                {description}
              </div>
            ) : null}

            {meta ? <div className="mt-5">{meta}</div> : null}

            {actions?.length ? (
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
                      ACTION_VARIANT[action.variant ?? "primary"],
                    )}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {portrait?.src ? (
            <div className="hidden w-40 shrink-0 overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-panel)] ring-1 ring-white/10 lg:block xl:w-48">
              <ResponsiveImage
                src={portrait.src}
                alt={portrait.alt ?? title}
                blurDataURL={portrait.blurDataURL ?? null}
                sizes="12rem"
                className="aspect-[2/3]"
              />
            </div>
          ) : null}
        </div>
      </Container>

      {bleed ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent"
        />
      ) : null}
    </header>
  );
}

/** Compact header used by index/archive pages. */
export function ArchiveHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border-subtle bg-ink-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_10%_0%,var(--color-ink-800),transparent_70%)]"
      />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        {eyebrow ? (
          <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
            <span aria-hidden="true" className="rule-gold h-px w-6" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-display-xl text-parchment-50">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-parchment-300 sm:text-base">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </header>
  );
}