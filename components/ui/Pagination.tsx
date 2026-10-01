import Link from "next/link";

import { cn, paginationRange } from "@/lib/utils";

/**
 * Accessible pagination built from plain `<a>` elements — no client JS, so it
 * works before hydration and is crawlable.
 *
 * Uses a "previous/next" list plus numbered links; the current page is marked
 * with `aria-current="page"`.
 */
export function Pagination({
  page,
  pageCount,
  /** Base path, e.g. `/blog/`. Page numbers are appended as `?page=n`. */
  basePath,
  className,
  label = "Pagination",
}: {
  page: number;
  pageCount: number;
  basePath: string;
  className?: string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => (target <= 1 ? basePath : `${basePath}?page=${target}`);
  const range = paginationRange(page, pageCount);

  return (
    <nav aria-label={label} className={cn("mt-10 flex justify-center", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {page > 1 ? (
            <PageLink href={href(page - 1)} rel="prev">
              <span aria-hidden="true">←</span>
              <span className="sr-only sm:not-sr-only">Previous</span>
            </PageLink>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-9 cursor-default items-center gap-1 rounded-lg px-3 text-sm text-ink-500 ring-1 ring-inset ring-white/5"
            >
              ← Previous
            </span>
          )}
        </li>

        {range.map((entry, index) =>
          entry === "start-ellipsis" || entry === "end-ellipsis" ? (
            <li key={`${entry}-${index}`} aria-hidden="true" className="px-1 text-parchment-500">
              …
            </li>
          ) : entry === page ? (
            <li key={entry}>
              <span
                aria-current="page"
                className="inline-flex size-9 items-center justify-center rounded-lg bg-gold-400 text-sm font-semibold text-ink-950"
              >
                {entry}
              </span>
            </li>
          ) : (
            <li key={entry}>
              <PageLink href={href(entry)}>{entry}</PageLink>
            </li>
          ),
        )}

        <li>
          {page < pageCount ? (
            <PageLink href={href(page + 1)} rel="next">
              <span className="sr-only sm:not-sr-only">Next</span>
              <span aria-hidden="true">→</span>
            </PageLink>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-9 cursor-default items-center gap-1 rounded-lg px-3 text-sm text-ink-500 ring-1 ring-inset ring-white/5"
            >
              Next →
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

function PageLink({
  href,
  children,
  rel,
}: {
  href: string;
  children: React.ReactNode;
  rel?: "prev" | "next";
}) {
  return (
    <Link
      href={href}
      rel={rel}
      className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-parchment-200 ring-1 ring-inset ring-white/10 transition hover:bg-ink-800 hover:text-gold-200"
    >
      {children}
    </Link>
  );
}