import Link from "next/link";

import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** Small label above the title: "Featured", "Latest Episodes", … */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional "See all" affordance — a plain server link, no JS. */
  action?: { href: string; label: string };
  /** `center` for archive headers, `start` for rails. */
  align?: "start" | "center";
  /** Adds the thin gold rule above the eyebrow. */
  rule?: boolean;
  className?: string;
  /** Heading level — keeps document outline order correct per page. */
  as?: "h2" | "h3";
  id?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  rule = true,
  className,
  as: Tag = "h2",
  id,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8",
        isCentered
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className={cn(isCentered && "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400",
              isCentered && "justify-center",
            )}
          >
            {rule && <span aria-hidden="true" className="rule-gold h-px w-6" />}
            {eyebrow}
          </p>
        ) : null}

        <Tag
          id={id}
          className={cn(
            "mt-2 text-display-lg text-parchment-50",
            eyebrow && !isCentered && "sm:text-display-xl",
          )}
        >
          {title}
        </Tag>

        {description ? (
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-parchment-300 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-gold-300 underline-offset-4 transition hover:text-gold-200 hover:underline sm:self-auto"
        >
          {action.label}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}