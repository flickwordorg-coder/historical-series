import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { getNavigationPages } from "@/lib/sanity";
import { siteConfig } from "@/lib/site/config";
import { FOOTER_SECTIONS, PRIMARY_NAV } from "@/lib/site/navigation";
import { rootPath } from "@/lib/site/routes";

import { SiteLogo } from "./SiteLogo";

/**
 * Site footer.
 *
 * Static links come from the nav model; CMS-driven "Pages" links are fetched
 * once here (React `cache()` means the sitemap and header pay nothing extra).
 * Pages flagged `hideFromNavigation` are filtered out but stay reachable.
 */
export async function SiteFooter() {
  const pages = await getNavigationPages();
  const visiblePages = pages.filter((page) => !page.hideFromNavigation && page.slug);

  const browseLinks = FOOTER_SECTIONS[0]?.items ?? [];
  const pageLinks = visiblePages.map((page) => ({
    label: page.title,
    href: rootPath(page.slug),
  }));

  return (
    <footer className="mt-auto border-t border-white/5 bg-ink-950">
      <Container className="py-10 sm:py-14 lg:py-16">
        <div className="grid min-w-0 gap-9 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="min-w-0 lg:col-span-2">
            <SiteLogo />
            <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-parchment-400">
              {siteConfig.description}
            </p>
            <p className="mt-6 text-xs text-parchment-500">
              © {siteConfig.foundedYear}–{new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
          </div>

          <FooterColumn title="Browse" links={browseLinks} />
          <FooterColumn
            title="Pages"
            links={pageLinks.length > 0 ? pageLinks : FOOTER_SECTIONS[1]?.items ?? []}
          />
        </div>

        <nav aria-label="Footer" className="sr-only">
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  if (links.length === 0) return null;

  return (
    <div className="min-w-0">
      <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-parchment-500">
        {title}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="wrap-break-word text-sm text-parchment-300 underline-offset-4 transition hover:text-gold-200 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}