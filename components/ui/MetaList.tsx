import { cn } from "@/lib/utils";

/**
 * Definition-list row for the "episode information" and series/movie facts
 * tables. Using `<dl>` keeps the markup semantically correct instead of faking a
 * table with divs.
 */
export function MetaList({
  items,
  columns = 2,
  className,
}: {
  items: ReadonlyArray<{ label: string; value: React.ReactNode }>;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const visible = items.filter((item) => item.value !== null && item.value !== undefined && item.value !== "");
  if (visible.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4 sm:grid-cols-2",
        columns === 1 ? "sm:grid-cols-1" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
    >
      {visible.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-parchment-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm break-words text-parchment-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Compact horizontal stat, e.g. "86 episodes". */
export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="font-display text-2xl text-gold-300 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-parchment-400">{label}</p>
    </div>
  );
}