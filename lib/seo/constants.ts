import { siteConfig } from "@/lib/site/config";

/**
 * SEO constants.
 *
 * `title.template` is applied by Next.js to every child segment, so pages only
 * ever supply their own title. Centralised here so the suffix is never typed
 * twice.
 */
export const SEO = {
  titleTemplate: `%s | ${siteConfig.name}`,
  defaultTitle: `${siteConfig.name} — Historical Turkish Series & Movies`,
  defaultDescription: siteConfig.description,
  /** Hard ceiling for meta descriptions (Google truncates around 160 chars). */
  descriptionLength: 160,
  /** Hard ceiling for titles. */
  titleLength: 70,
  og: {
    type: "website" as const,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image" as const,
  },
  robots: {
    index: { index: true, follow: true } as const,
    noIndex: { index: false, follow: false } as const,
  },
  typeLabels: {
    episode: "Episode",
    series: "Series",
    season: "Season",
    movie: "Movie",
    blogPost: "Article",
    category: "Category",
    page: "Page",
  } as const,
} as const;