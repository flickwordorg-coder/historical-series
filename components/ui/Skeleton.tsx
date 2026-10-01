import { cn } from "@/lib/utils";

/**
 * Skeleton primitives. All loading UI funnels through these so every route's
 * pending state shares one look, and `prefers-reduced-motion` is respected by
 * the global CSS animation guard.
 */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-ink-700/70", className)}
    />
  );
}

export function CardGridSkeleton({
  count = 10,
  ratio = "poster",
  className,
}: {
  count?: number;
  ratio?: "poster" | "tile";
  className?: string;
}) {
  return (
    <ul
      aria-hidden="true"
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Skeleton className={cn("w-full", ratio === "poster" ? "aspect-[2/3]" : "aspect-video")} />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </li>
      ))}
    </ul>
  );
}

export function HeroSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative min-h-[68vh] overflow-hidden bg-ink-900"
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="container-page relative flex min-h-[68vh] flex-col justify-end gap-4 pb-16">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-4 w-2/3 max-w-xl" />
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EpisodeListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <ul aria-hidden="true" className="divide-y divide-white/5">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex items-center gap-3 py-3 sm:gap-4">
          <Skeleton className="aspect-video w-28 shrink-0 rounded-lg sm:w-40" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ArticleSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-4/5" />
      <Skeleton className="aspect-video w-full rounded-[var(--radius-panel)]" />
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}