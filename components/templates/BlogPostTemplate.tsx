import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { getBlogPostPageData } from "@/lib/sanity";
import { resolveImage } from "@/lib/sanity/image";
import type { BlogPost } from "@/lib/sanity/types";
import { rootPath } from "@/lib/site/routes";
import { formatDate } from "@/lib/utils";

/**
 * Article page — `/kurtuluş-savaşı-nasıl-kazanıldı/`.
 *
 * A reading-first layout: full-bleed featured image, a narrow measure for the
 * body, and a sticky category rail. Zero client JavaScript.
 */
export async function BlogPostTemplate({ post }: { post: BlogPost }) {
  const { related, latest } = await getBlogPostPageData(post, 6);
  const image = resolveImage(post.featuredImage, { width: 1920, alt: post.title });

  const category =
    post.categories?.length === 1 && post.categories[0].slug
      ? { name: post.categories[0].title, href: rootPath(post.categories[0].slug) }
      : null;

  return (
    <article>
      <div className="relative h-[50svh] w-full overflow-hidden bg-ink-950">
        <ResponsiveImage
          src={image?.src ?? null}
          alt={image?.alt ?? post.title}
          blurDataURL={image?.blurDataURL ?? null}
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <Container className="pt-8 sm:pt-10">
        <Breadcrumbs
          crumbs={[
            { name: "Blog", path: rootPath("blog") },
            ...(category ? [{ name: category.name, path: category.href }] : []),
            { name: post.title, path: rootPath(post.slug) },
          ]}
        />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-display-xl text-parchment-50">{post.title}</h1>

          {post.excerpt ? (
            <p className="mt-5 text-pretty text-base leading-relaxed text-parchment-200 sm:text-lg">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-parchment-400">
            {post.author ? <span className="text-parchment-200">{post.author}</span> : null}
            {post.publishedAt ? (
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            ) : null}
            {post.updatedAt && post.updatedAt !== post.publishedAt ? (
              <span>Updated {formatDate(post.updatedAt)}</span>
            ) : null}
          </div>

          {post.tags?.length || post.categories?.length ? (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {post.categories?.map((item) => (
                <li key={`category-${item.id}`}>
                  {item.slug ? (
                    <Link
                      href={rootPath(item.slug)}
                      className="inline-flex"
                      aria-label={`Category: ${item.title}`}
                    >
                      <Chip>{item.title}</Chip>
                    </Link>
                  ) : (
                    <Chip>{item.title}</Chip>
                  )}
                </li>
              ))}
              {post.tags?.map((tag) => (
                <li key={`tag-${tag}`}>
                  <Chip>{tag}</Chip>
                </li>
              ))}
            </ul>
          ) : null}
        </header>
      </Container>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
          <div className="min-w-0">
            <Prose value={post.body} />
          </div>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-panel)] bg-ink-900 p-6 ring-1 ring-inset ring-white/8">
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-parchment-400">
                Keep reading
              </h2>
              <p className="mt-3 text-sm text-parchment-200">
                More essays on the history behind the screen.
              </p>
              <Link
                href={rootPath("blog")}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
              >
                All articles
              </Link>
            </div>
          </aside>
        </div>
      </Container>

      <RelatedContent
        eyebrow="Related reading"
        title="More from the archive"
        items={related.length > 0 ? related : latest}
        layout="rail"
        ratio="tile"
        action={{ href: rootPath("blog"), label: "All articles" }}
        hideWhenEmpty
      />
    </article>
  );
}
