import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The one empty state. Used by every rail, grid, list and search view so a
 * missing collection always looks intentional rather than broken.
 */
export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
  icon = "compass",
  className,
  compact = false,
}: {
  title?: string;
  description?: string;
  action?: { href: string; label: string };
  icon?: "compass" | "search" | "video" | "archive";
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-panel)] border border-dashed border-white/10 bg-ink-900/60 text-center",
        compact ? "gap-2 px-5 py-8" : "gap-3 px-6 py-14",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid place-items-center rounded-full bg-ink-800 text-ink-400 ring-1 ring-white/10",
          compact ? "size-9" : "size-12",
        )}
      >
        <EmptyIcon name={icon} />
      </span>

      <p className={cn("font-medium text-parchment-100", compact ? "text-sm" : "text-base")}>
        {title}
      </p>

      {description ? (
        <p className="max-w-sm text-pretty text-sm leading-relaxed text-parchment-400">
          {description}
        </p>
      ) : null}

      {action ? (
        <Link
          href={action.href}
          className={cn(
            "mt-2 inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-gold-300",
          )}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyIcon({ name }: { name: "compass" | "search" | "video" | "archive" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-1/2",
  };

  switch (name) {
    case "search":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "video":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10.5 5-3v9l-5-3z" />
        </svg>
      );
    case "archive":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="4" rx="1" />
          <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4" />
        </svg>
      );
    case "compass":
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5z" />
        </svg>
      );
  }
}