import Link from "next/link";

import { breadcrumbJsonLd } from "@/lib/seo";
import { HOME_CRUMB_LABEL } from "@/lib/site/config";
import { rootPath } from "@/lib/site/routes";
import { cn } from "@/lib/utils";

import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Breadcrumbs.
 *
 * One component produces both the visible trail and the `BreadcrumbList`
 * JSON-LD, so the structured data can never drift from what users see.
 */
export interface Crumb {
  name: string;
  /** Root-level slug or static path; include the current page for JSON-LD. */
  path?: string | null;
}

export function Breadcrumbs({
  crumbs,
  className,
  showJsonLd = true,
}: {
  crumbs: Crumb[];
  className?: string;
  showJsonLd?: boolean;
}) {
  if (crumbs.length === 0) return null;

  const trail: Crumb[] = [{ name: HOME_CRUMB_LABEL, path: "/" }, ...crumbs];

  return (
    <>
      {showJsonLd ? <JsonLd data={breadcrumbJsonLd(trail)} /> : null}

      <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-parchment-400 sm:text-sm">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            const href = crumb.path ? (crumb.path.startsWith("/") ? crumb.path : rootPath(crumb.path)) : null;

            return (
              <li key={`${crumb.name}-${index}`} className="flex min-w-0 items-center gap-1.5">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-ink-400">
                    /
                  </span>
                ) : null}

                {href && !isLast ? (
                  <Link
                    href={href}
                    className="truncate underline-offset-4 transition hover:text-gold-200 hover:underline"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn("truncate", isLast && "text-parchment-100")}
                  >
                    {crumb.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}