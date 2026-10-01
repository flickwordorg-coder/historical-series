import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { Section } from "@/components/ui/Section";
import { rootPath } from "@/lib/site/routes";
import { resolveImage } from "@/lib/sanity/image";
import type { Page } from "@/lib/sanity/types";
import { formatDate } from "@/lib/utils";

/**
 * CMS page template — `/about-us/`, `/privacy-policy/`, `/dmca/`, …
 *
 * One template covers every editorial/static page, which is why the legal footer
 * can link to documents that do not exist in code: publish a page in the Studio
 * with the matching slug and it is live immediately.
 */
export function PageTemplate({ page }: { page: Page }) {
  const image = resolveImage(page.image, { width: 1600, alt: page.title });

  return (
    <article>
      <Container className="pt-8 sm:pt-10">
        <Breadcrumbs crumbs={[{ name: page.title, path: rootPath(page.slug) }]} />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-display-xl text-parchment-50">{page.title}</h1>
          {page.updatedAt ? (
            <p className="mt-4 text-xs text-parchment-400">
              Last updated {formatDate(page.updatedAt)}
            </p>
          ) : null}
        </header>
      </Container>

      {image?.src ? (
        <Container className="mt-10">
          <ResponsiveImage
            src={image.src}
            alt={image.alt ?? page.title}
            blurDataURL={image.blurDataURL ?? null}
            sizes="(max-width: 1440px) 92vw, 1320px"
            priority
            className="aspect-[21/9] rounded-[var(--radius-panel)]"
          />
        </Container>
      ) : null}

      <Section spacing="md" className="!pt-10 sm:!pt-12">
        <div className="max-w-3xl">
          <Prose value={page.body ?? page.description} />
        </div>
      </Section>
    </article>
  );
}
