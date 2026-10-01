import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ContentRail } from "@/components/ui/ContentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Prose } from "@/components/ui/Prose";
import { generateHomeMetadata } from "@/lib/seo";
import { getHomePageData, isSanityConfigured } from "@/lib/sanity";
import { resolveImage } from "@/lib/sanity/image";
import { siteConfig } from "@/lib/site/config";
import { rootPath } from "@/lib/site/routes";

/**
 * Homepage — `/`.
 *
 * The whole page is ONE Content Lake request (`GET_HOME_PAGE`). Sections render
 * only when they have content, so a partially populated CMS produces a shorter
 * page instead of a grid of empty states.
 */
export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomePageData();
  const defaultImage = resolveImage(home.settings?.defaultOgImage, { width: 1200 })?.src;
  const heroImage = resolveImage(home.hero?.image, { width: 1200 })?.src;

  return generateHomeMetadata({
    title: home.settings?.homepageSeoTitle,
    description: home.settings?.homepageSeoDescription ?? home.settings?.siteDescription,
    image: defaultImage ?? heroImage,
  });
}

export default async function HomePage() {
  const home = await getHomePageData();
  const configured = isSanityConfigured();
  const heroImage = resolveImage(home.hero?.image, {
    width: 1920,
    alt: home.hero?.title,
  });

  return (
    <>
      {home.hero ? (
        <section className="relative isolate h-screen w-full overflow-hidden bg-ink-950">
          <div className="absolute inset-0">
            <ResponsiveImage
              src={heroImage?.src ?? null}
              alt=""
              blurDataURL={heroImage?.blurDataURL ?? null}
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/45 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-ink-950/10"
            />
          </div>
          <Container className="relative z-10 flex h-full flex-col justify-end pt-28 pb-14 sm:pb-20">
            <Link
              href={rootPath("search")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-parchment-200 transition hover:text-gold-200"
            >
              <span aria-hidden="true" className="rule-gold h-px w-8" />
              {home.hero.badge} · {home.hero.meta ?? "Historical drama"}
            </Link>
            <h1 className="mt-3 max-w-4xl text-display-2xl text-parchment-50">
              {home.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-parchment-100 sm:text-base">
              {home.settings?.siteDescription ?? siteConfig.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={rootPath(home.hero.slug)}
                className="inline-flex items-center justify-center rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
              >
                Watch now
              </Link>
              <Link
                href={rootPath("turkish-series")}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50 hover:bg-white/10"
              >
                Browse all series
              </Link>
            </div>
          </Container>
        </section>
      ) : (
        <HomeHeroFallback configured={configured} />
      )}

      {home.featuredSeries.length > 0 ? (
        <Section tone="sunken" spacing="md">
          <SectionHeader
            eyebrow="Editor's selection"
            title="Featured series"
            action={{ href: rootPath("turkish-series"), label: "All series" }}
          />
          <ContentRail
            items={home.featuredSeries}
            rank
            ariaLabel="Featured series"
          />
        </Section>
      ) : null}

      {home.latestEpisodes.length > 0 ? (
        <Section spacing="md">
          <SectionHeader
            eyebrow="Just added"
            title="Latest episodes"
            description="The newest episodes added to the archive."
            action={{ href: rootPath("turkish-series"), label: "Browse series" }}
          />
          <ContentRail
            items={home.latestEpisodes}
            ratio="tile"
            ariaLabel="Latest episodes"
          />
        </Section>
      ) : null}

      {home.popularSeries.length > 0 ? (
        <Section tone="raised" spacing="md">
          <SectionHeader
            eyebrow="Most watched"
            title="Popular series"
            action={{ href: rootPath("turkish-series"), label: "All series" }}
          />
          <ContentRail items={home.popularSeries} ariaLabel="Popular series" />
        </Section>
      ) : null}

      {home.movies.length > 0 ? (
        <Section spacing="md">
          <SectionHeader
            eyebrow="Feature films"
            title="Turkish historical movies"
            action={{ href: rootPath("turkish-movies"), label: "All movies" }}
          />
          <ContentRail items={home.movies} ariaLabel="Turkish historical movies" />
        </Section>
      ) : null}

      {home.categories.length > 0 ? (
        <Section tone="raised" spacing="md">
          <SectionHeader
            eyebrow="Explore"
            title="Browse by category"
            action={{ href: rootPath("categories"), label: "All categories" }}
          />
          <ContentRail
            items={home.categories}
            ratio="tile"
            ariaLabel="Content categories"
          />
        </Section>
      ) : null}

      {home.articles.length > 0 ? (
        <Section spacing="md">
          <SectionHeader
            eyebrow="From the archive"
            title="History articles"
            description="Long-form context on the people, battles and centuries behind the screen."
            action={{ href: rootPath("blog"), label: "All articles" }}
          />
          <ContentRail items={home.articles} ratio="tile" ariaLabel="History articles" />
        </Section>
      ) : null}

      {home.isEmpty ? (
        <Section spacing="lg">
          <EmptyState
            icon="archive"
            title={configured ? "The archive is empty" : "Connect Sanity to get started"}
            description={
              configured
                ? "No published series, episodes, movies or articles were found. Publish content in the Studio and it appears here immediately."
                : "This deployment has no Sanity project configured, so it is rendering the empty state. Add your project ID and dataset to .env.local to load real content."
            }
            action={
              configured
                ? { href: rootPath("studio"), label: "Open the Studio" }
                : undefined
            }
          />
        </Section>
      ) : null}

      {home.settings?.homepageSeoContent?.length ? (
        <Section spacing="md">
          <div className="max-w-3xl">
            <Prose value={home.settings.homepageSeoContent} />
          </div>
        </Section>
      ) : null}
    </>
  );
}

/**
 * Shown when no hero series exists. Deliberately quiet: it introduces the site
 * and points at the two main archives rather than inventing content.
 */
function HomeHeroFallback({ configured }: { configured: boolean }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/5 bg-ink-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_20%_0%,var(--color-ink-800),var(--color-ink-950))]"
      />
      <div aria-hidden="true" className="scrim-vignette absolute inset-0 -z-10" />

      <Container className="py-20 sm:py-28 lg:py-32">
        <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
          <span aria-hidden="true" className="rule-gold h-px w-6" />
          Historical Series
        </p>

        <h1 className="mt-4 max-w-3xl text-display-2xl text-parchment-50">
          History on screen, and off it
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-parchment-300">
          {configured
            ? siteConfig.description
            : "This site is running without a CMS connection. Configure Sanity to publish historical Turkish series, episodes, movies and history articles."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={rootPath("turkish-series")}
            className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-300"
          >
            Browse series
          </Link>
          <Link
            href={rootPath("blog")}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-parchment-100 transition hover:border-gold-400/50"
          >
            Read the history
          </Link>
        </div>
      </Container>
    </header>
  );
}
