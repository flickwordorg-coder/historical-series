import { cn } from "@/lib/utils";

/** Small tonal chip used for status, genre and metadata labels. */
export type BadgeTone = "neutral" | "gold" | "outline" | "danger" | "success";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-ink-700/80 text-parchment-200 ring-white/10",
  gold: "bg-gold-400/15 text-gold-200 ring-gold-400/30",
  outline: "bg-transparent text-parchment-300 ring-white/20",
  danger: "bg-crimson-500/15 text-crimson-300 ring-crimson-400/30",
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ring-1 ring-inset",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Genre / tag pill used on detail pages and in category lists. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-ink-800 px-3 py-1.5 text-xs font-medium text-parchment-200 ring-1 ring-inset ring-white/10",
        className,
      )}
    >
      {children}
    </span>
  );
}