import { cn } from "@/lib/utils";

import { Container } from "./Container";

/**
 * Vertical rhythm wrapper. `tone` controls the surface so sections can alternate
 * without each one re-implementing backgrounds and borders.
 */
export type SectionTone = "base" | "raised" | "sunken" | "bordered";

const TONE: Record<SectionTone, string> = {
  base: "",
  raised: "bg-ink-900",
  sunken: "bg-ink-950",
  bordered: "border-y border-border-subtle bg-ink-950",
};

const SPACING = {
  sm: "py-10 sm:py-12",
  md: "py-12 sm:py-16 lg:py-20",
  lg: "py-16 sm:py-20 lg:py-28",
} as const;

export function Section({
  tone = "base",
  spacing = "md",
  bleed = false,
  className,
  containerClassName,
  id,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  spacing?: keyof typeof SPACING;
  /** `false` renders children full-bleed (used by rails and heroes). */
  bleed?: boolean;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={cn(TONE[tone], SPACING[spacing], className)} {...props}>
      {bleed ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}