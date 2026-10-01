# Historical Streaming Site — Implementation Plan

Production-ready historical Turkish series / movies / history content website built with
**Next.js (App Router) · TypeScript · Tailwind CSS v4 · Sanity CMS · GROQ**.

Reference product: `historicalpoint.com` (flat, WordPress-style, SEO-driven content hub for
Turkish historical dramas with Urdu subtitles). We build an **original design** with the same
*content architecture* — not a copy of its markup or visual identity.

---

## 0. Non-negotiable architecture decisions

### 0.1 Flat URL architecture (CORE REQUIREMENT)

Public URLs are **always a single root-level slug**. The Sanity relational hierarchy
(`Series → Season → Episode`) exists **only internally**.

| Internal Sanity relation | Public URL |
| --- | --- |
| `series { title: "Sultan Muhammad Fateh", slug: "sultan-muhammad-fateh" }` | `/sultan-muhammad-fateh/` |
| `series { slug: "sultan-muhammad-fateh-blog" }` | `/sultan-muhammad-fateh-blog/` |
| `episode { series: →, season: → season 4, episodeNumber: 85 }` | `/sultan-muhammad-fateh-episode-85-in-urdu-subtitles/` |
| `episode { … episodeNumber: 181 }` | `/teskilat-episode-181-with-urdu-subtitles/` |
| `movie { slug: "tomris" }` | `/tomris/` |
| `blogPost { slug: "history-of-mughal" }` | `/history-of-mughal/` |
| `page { slug: "about-us" }` | `/about-us/` |

Explicitly **forbidden**:

- `/series/[slug]/season/[slug]/episode/[slug]`
- `/series/sultan-muhammad-fateh/season-4/episode-85`
- `/movies/<name>/`
- `/pages/about-us/`
- `/blog/<article>/`

Rule: **every document owns one unique root slug.** Slugs are authored in the Sanity Studio
(`slug.current`) and are the single source of truth for routing. No slug is derived from the
relationship tree.

### 0.2 Single dynamic resolver

`app/[slug]/page.tsx` is the **only** route that renders content documents. It resolves the
requested slug against content types in a **fixed, deterministic priority order**, using **one**
Sanity round-trip per call:

1. `episode`
2. `series`
3. `season`
4. `movie`
5. `blogPost`
6. `category`
7. `page`
8. → `notFound()`

Resolution is deterministic because (a) the GROQ query returns one typed slot per content type
in a single request and (b) the selection order is a hard-coded constant array, not an
"any doc that happens to match" scan. Duplicate slugs across types are therefore **impossible to
mis-route** — and the Studio gets a custom slug-uniqueness validation action to keep them
impossible to *create*.

**Zero per-item route files.** Thousands of flat URLs from one source file.

### 0.3 Reserved route slugs

A small, centralized set of slugs is owned by Next.js route segments and therefore excluded from
Sanity slug assignment (enforced by a Studio validation rule):

| Slug | Route | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Homepage |
| `/turkish-series/` | `app/turkish-series/page.tsx` | Series index |
| `/turkish-movies/` | `app/turkish-movies/page.tsx` | Movie index |
| `/blog/` | `app/blog/page.tsx` | Blog index (articles themselves stay flat) |
| `/categories/` | `app/categories/page.tsx` | Category index |
| `/search` | `app/search/page.tsx` | Server-rendered search (`?q=`) |
| `/studio/…` | `app/studio/[[...tool]]` | Embedded Sanity Studio (opt-in) |
| `/api/search` | `app/api/search/route.ts` | Client-dialog search endpoint |

### 0.4 Season URLs

Seasons have **no public hierarchy** by default. A season only becomes publicly reachable when it
carries its own unique landing-page slug (e.g. `/sultan-muhammad-fateh-season-4/`, authored as
`season-4` suffix on the season slug). Individual episodes always stay flat.

### 0.5 Graceful degradation

The Sanity client is created lazily and all reads go through one `sanityFetch()` wrapper that
returns a typed `fallback` when the project is unconfigured or unreachable. Consequences:

- `npm run build` succeeds on a fresh clone with no `.env.local` (empty states render).
- A content-type outage degrades one page instead of 500-ing the site.
- Strict mode (`SANITY_STRICT_MODE=true`) turns errors into build failures for CI.

---

## 1. Quality rules encoded in the codebase

1. Server Components by default; `"use client"` only on: mobile nav, search dialog, pagination
   links (actually server links — no JS), copy-to-clipboard, video consent gate.
2. All data fetching lives in `lib/sanity/`. **No GROQ inside components.**
3. All GROQ strings live in `lib/sanity/queries.ts`. **No duplicated queries.**
4. All shared types live in `lib/sanity/types.ts` (`SanityImageSource`, `Slugs`, `ContentRef`…).
5. All metadata generation in `lib/seo/metadata.ts`. **No duplicated metadata logic.**
6. All JSON-LD builders in `lib/seo/json-ld.ts`. **No duplicated JSON-LD logic.**
7. All constants (site config, nav, routes, video providers) in `lib/site/` and `lib/video/`.
8. All helpers in `lib/utils/`.
9. One `<VideoPlayer embedUrl …/>`. Provider behaviour is **configuration**, not new components.
10. Zero duplicated JSX: `ContentCard` / `ContentGrid` / `ContentHero` / `SectionHeader` /
    `Breadcrumbs` / `RelatedContent` / `EmptyState` / `Skeleton` are used by every template.
11. No `any`. Strict TS. No `!` non-null assertions on CMS data.
12. Structured data contains **only** fields backed by real CMS values. No invented ratings,
    review counts, view counts, actors, upload dates or durations.

---

## 2. Phases

### Phase 0 — Foundation & design system
**Goal:** a compiling shell with the visual language locked in.

- Install `next-sanity`, `sanity`, `@portabletext/react`, `@sanity/vision`.
- `next.config.ts` — image remote patterns for `cdn.sanity.io`, security headers, typed routes.
- `.env.example` + `.env.local` with `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_VERSION`, `NEXT_PUBLIC_SITE_URL`.
- `lib/site/config.ts` — single source for name/description/url/OG image/socials.
- `lib/site/navigation.ts` — nav model (label + href + optional children).
- `lib/site/routes.ts` — `ROOT_ROUTES`, `RESERVED_SLUGS`, `STATIC_PAGE_SLUGS`, `isReservedSlug()`.
- `lib/utils/*` — `cn()`, `formatDate()`, `formatRelativeTime()`, `formatDuration()`,
  `truncate()`, `plainTextFromPortableText()`, `absoluteUrl()`, `slugify()`.
- Design tokens in `app/globals.css` via Tailwind v4 `@theme`: ink/charcoal surfaces, antique
  gold accent, Ottoman crimson secondary, warm parchment text, cinematic gradient utilities,
  focus rings, scrollbar, `prefers-reduced-motion` guard.
- Fonts via `next/font`: display serif for headings, geometric sans for UI.
- `app/layout.tsx` — metadata base, `WebSite` + `Organization` JSON-LD, skip-link, header,
  `<main id="main">`, footer.
- `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`.

**Exit criteria:** `npm run dev` renders a branded shell; `lint` + `tsc` clean.

---

### Phase 1 — Sanity layer
**Goal:** typed, validated content model and one hardened client.

**Schemas** (`sanity/schemas/`) — shared building blocks first:

- `sanity/schemas/objects/seo.ts` — `seo` object (seoTitle, seoDescription, keywords, noIndex)
- `sanity/schemas/objects/media.ts` — image fields with alt-text enforcement + hotspot metadata
- `sanity/schemas/objects/richText.ts` — Portable Text (h2/h3/blockquote/lists/link/marks only)
- `sanity/schemas/objects/videoSource.ts` — `embedUrl` (url validation + provider sniff),
  `videoType` enum (`embed` | `external`), `durationSeconds`
- `sanity/schemas/documents/series.ts`, `season.ts`, `episode.ts`, `movie.ts`, `blogPost.ts`,
  `category.ts`, `page.ts`, `siteSettings.ts`
- Relationships: `episode.series` (required ref) + `episode.season` (required ref, validation =
  that the season's `series` matches), `season.series` (required ref).
- `seasonNumber` / `episodeNumber` are integers used for ordering — **never parsed from slugs**.
- Slug fields use `isUniqueSlug()` (custom) which checks (a) uniqueness across **all** documents
  and (b) the reserved-route list.
- `sanity/schemas/index.ts` + `sanity.config.ts` + `sanity.cli.ts`.

**Runtime:**

- `lib/sanity/client.ts` — lazily created `createClient`, CDN reads, `apiVersion` from env,
  `useCdn: true`, `perspective: 'published'`, tagged cache, optional server token.
- `lib/sanity/image.ts` — `urlFor()`, `imageUrl()`, `blurDataUrl()`, `aspectRatio()` helper
  returning a `next/image`-compatible `{ src, width, height, blurDataURL }`.
- `lib/sanity/types.ts` — `Series`, `Season`, `Episode`, `Movie`, `BlogPost`, `Category`,
  `Page`, `SearchResult`, `SitemapEntry`, `HomePageData`, `ContentType`, unions, `ContentCardData`.
- `lib/sanity/queries.ts` — **all** GROQ as named constants with co-located projection fragments
  (`CARD_PROJECTION`, `SEO_PROJECTION`, `IMAGE_PROJECTION`) reused via string interpolation so no
  projection is written twice.
- `lib/sanity/fetch.ts` — `sanityFetch<T>()`: config guard, try/catch → fallback, `next.revalidate`
  + `next.tags`, `unstable_cache`-friendly signature.
- `lib/sanity/content.ts` — the public data API (see Phase 2).

**Exit criteria:** `sanity dev` opens with all 7 + settings schemas; types compile.

---

### Phase 2 — Centralized data access
**Goal:** every read in the app goes through one typed module.

Required functions (all in `lib/sanity/content.ts`, re-exported from `lib/sanity/index.ts`):

| Function | Purpose |
| --- | --- |
| `getContentBySlug(slug)` | Deterministic flat resolution → discriminated union |
| `getSeriesBySlug` / `getSeasonBySlug` / `getEpisodeBySlug` | single-type lookups |
| `getMovieBySlug` / `getBlogPostBySlug` / `getCategoryBySlug` / `getPageBySlug` | single-type lookups |
| `getAllSeriesIndex` / `getAllMovieIndex` / `getAllBlogPostIndex` / `getAllCategoryIndex` | paginated index pages |
| `getFeaturedSeries` / `getPopularSeries` / `getLatestSeries` | homepage rails |
| `getLatestEpisodes(limit)` | homepage + category rails |
| `getEpisodesBySeason(seasonId, { limit, offset })` | episode list w/ pagination |
| `getPreviousEpisode(episode)` / `getNextEpisode(episode)` | ordered by `episodeNumber`, scoped to season → series fallback |
| `getRelatedSeries(series)` | same-genre/country series |
| `getRelatedContent(ref)` | genre/tag/series-aware, type-mixed |
| `getSeasonWithEpisodes(seriesId, seasonId?)` | current + all seasons w/ episode counts |
| `getCategoryOverview` / `getPopularCategories` | category pages + homepage |
| `searchContent(term, limit)` | multi-type search (title + keywords) |
| `getAllSlugs()` | `generateStaticParams` source |
| `getSitemapEntries()` | `app/sitemap.ts` source |
| `getHomePageData()` | one batched homepage query |

Rules: one query per render path wherever possible, tagged revalidation, no duplicate fetches
(React `cache()` dedupe within a request), and every GROQ string reused from `queries.ts`.

**Exit criteria:** no GROQ outside `queries.ts`; no fetch call outside `lib/sanity/`.

---

### Phase 3 — UI primitives & SEO engine
**Goal:** the reusable vocabulary every page is composed from.

**`components/ui/`** (server, zero client JS unless noted):

- `Container` — max-width + responsive gutters (single source of page rhythm)
- `Section` — vertical rhythm wrapper with `tone` variants
- `SectionHeader` — eyebrow / title / description / optional "View all" link
- `ContentCard` — the **one** card used by every grid: poster/banner/thumbnail via `next/image`,
  gradient scrim, type badge, title, meta line (season/episode/year/duration), optional rank
  ribbon. Pure props, no fetching.
- `ContentGrid` + `ContentRail` — responsive grid and horizontal-scroll rail over `ContentCard`
- `ContentHero` — cinematic hero (backdrop image + scrim + title + meta + actions + optional
  player). Shared by Series / Season / Movie / Category / Blog / Page headers via props.
- `Breadcrumbs` — visual crumbs + emits `BreadcrumbList` JSON-LD (single source for both)
- `Prose` — Portable Text renderer (`@portabletext/react`), typography-first, external links
  hardened
- `Badge`, `MetaList`, `Chip`, `Stat`
- `EmptyState` — one component for "no content" across every section
- `Skeleton` primitives + `CardGridSkeleton`, `EpisodeListSkeleton`, `HeroSkeleton`
- `Pagination` — accessible prev/next + numbered pages (server links, no client JS)
- `ErrorState` — reusable error panel with retry affordance
- `ScrollTopButton` (client, tiny)
- `ShareButtons` (client, tiny) — copy-link + native share

**`components/seo/`**
- `JsonLd` — safe `<script type="application/ld+json">` serializer
- `JsonLdSet` — multi-graph wrapper

**`lib/seo/`**
- `metadata.ts` — `generateContentMetadata({ type, doc })` → full `Metadata`
  (title template, description clamp, keywords, canonical, OG, Twitter, robots
  `index`/`noindex` from `seo.noIndex` + `publishedAt > now`).
- `urls.ts` — `SITE_URL`, `absoluteUrl()`, `generateCanonicalUrl(slug)` — **no query params, ever**
- `json-ld.ts` — `websiteJsonLd`, `organizationJsonLd`, `breadcrumbJsonLd`, `videoObjectJsonLd`,
  `articleJsonLd`, `collectionPageJsonLd`. Every field conditional on real data.
- `site-jsonld.ts` — app-wide `WebSite` + `Organization` graph

**Exit criteria:** no page file contains inline metadata or JSON-LD logic.

---

### Phase 4 — Flat routing + page templates
**Goal:** all 7 content types rendering from one route.

- `app/[slug]/page.tsx`
  - `generateStaticParams` → `getAllSlugs()` (first N, ISR-capped; rest on demand)
  - `dynamicParams = true` (on-demand ISR for the long tail)
  - `generateMetadata` → `generateContentMetadata(...)` for the resolved type
  - body → `resolveContent(slug)` switch → **one** template per type
- `app/[slug]/loading.tsx` → type-agnostic skeleton
- Templates (composed from primitives; zero bespoke page code):
  - `components/series/SeriesTemplate.tsx` — hero, description, meta (country/language/status/
    genres), season switcher w/ episode counts, latest episodes, full episode list (paginated),
    related series, SEO prose.
  - `components/seasons/SeasonTemplate.tsx` — hero, description, paginated episode list,
    related episodes. Only reachable with its own slug.
  - `components/episodes/EpisodeTemplate.tsx` — breadcrumbs, H1, **player**, description,
    episode info table, previous/next nav, complete-season list, related episodes, related
    series, SEO prose.
  - `components/movies/MovieTemplate.tsx` — hero + player, description, meta, related movies.
  - `components/blog/BlogPostTemplate.tsx` — `Article` JSON-LD, Portable Text body, author,
    categories/tags, related posts.
  - `components/categories/CategoryTemplate.tsx` — hero, description, mixed-type paginated grid.
  - `components/pages/PageTemplate.tsx` — prose-only legal/static layout.
- Every page emits: `BreadcrumbList`, plus `Article` (blog), `VideoObject` (episode/movie) or
  `CollectionPage` — only with CMS-backed fields.

**Exit criteria:** `/sultan-muhammad-fateh/`, `/…-episode-85-in-urdu-subtitles/`,
`/about-us/`, `/history-of-mughal/`, `/tomris/`, `/sultan-muhammad-fateh-season-4/`,
`/category-name/` all render from the same route file. Deleting a doc ⇒ 404.

---

### Phase 5 — Video architecture
**Goal:** one player, many providers, no hard-coded URLs.

- `lib/video/providers.ts` — declarative provider registry: host → `{ id, label, allow,
  sandbox, referrerPolicy, aspect, blockedPatterns }`. Ships with a safe default entry for
  `play.niazitv.pk` and a permissive fallback. Adding a provider = one config object.
- `lib/video/url.ts` — `parseEmbedUrl(url)` → `{ provider, embedUrl, isAllowed }`;
  **rejects** anything not `https://` and any host on the denylist.
- `components/ui/VideoPlayer.tsx` (server) — the single iframe renderer:
  responsive `aspect-video` container, `loading="lazy"`, `allowFullScreen`,
  provider-driven `allow`/`sandbox`/`referrerPolicy`, `title` for a11y, consent/placeholder
  state when the URL is not allowed, and a poster-then-click overlay so third-party requests are
  deferred until interaction.
- `components/episodes/EpisodePlayer.tsx` — thin composition (episode meta + player + quality
  notes). No iframe markup of its own.
- `components/episodes/EpisodeNavigation.tsx` — prev/next from relationship queries, hides
  prev on the first episode and next on the last.
- `components/episodes/EpisodeList.tsx` — table-like, responsive, season-scoped, reused by
  Series/Season/Category/Episode pages and by `EpisodeListSkeleton`.

Enforcement: `embedUrl` comes only from Sanity; providers must permit embedding and the owner
must hold distribution rights. Unknown/blocked hosts render a fallback panel, never a raw iframe.

---

### Phase 6 — Homepage
**Goal:** premium, original, dark-cinematic landing page.

`components/home/`:

1. `SiteHero` — featured series/episode, backdrop, gradient, CTAs, autoplay-free
2. `FeaturedSeriesSection` — `SectionHeader` + `ContentRail`
3. `LatestEpisodesSection`
4. `PopularSeriesSection` — grid
5. `TurkishMoviesSection`
6. `HistoricalArticlesSection`
7. `BrowseCategoriesSection` — `CategoryCard` grid with episode counts
8. `SeoContentSection` — editorial prose from `siteSettings.homepageSeoContent`
9. Site-wide `SiteFooter`

Data: a **single** `getHomePageData()` query (all sections in one request). Sections self-hide
when their slice is empty. Every section is a prop-driven server component.

---

### Phase 7 — Index pages & search
**Goal:** browsable hub pages + working site search.

- `app/turkish-series/page.tsx`, `app/turkish-movies/page.tsx`, `app/blog/page.tsx`,
  `app/categories/page.tsx` — each: hero, filters/chips (client, URL-driven), paginated
  `ContentGrid`, canonical + `CollectionPage` JSON-LD. Built from **one** reusable
  `ArchivePage` component (`components/archive/ArchivePage.tsx`) driven by a config object →
  no duplicated listing page implementations.
- `app/search/page.tsx` — server-rendered `?q=` results (SEO + no-JS friendly), grouped by
  type, each result linking to its **root-level** slug.
- `app/api/search/route.ts` — small JSON endpoint for the header dialog
  (`components/search/SearchDialog.tsx`, client; debounced, keyboard accessible, ARIA combobox).
- `lib/search.ts` — shared normalization/query-building helpers for both search surfaces.

---

### Phase 8 — SEO plumbing & states
**Goal:** crawlable, indexable, correctly prioritized.

- `app/sitemap.ts` — `MetadataRoute.Sitemap` built from `getSitemapEntries()`:
  homepage, static pages, series, seasons **that own a public slug**, episodes, movies, blog
  posts, categories. `lastModified = updatedAt ?? publishedAt` (never invented).
  `generateSitemaps()` splits at 50 000 URLs.
- `app/robots.ts` — allow all, disallow `/api/`, `/studio/`, `noIndex` docs, sitemap URL,
  `host`/`cleanParam` hints.
- `app/icon.tsx`, `app/apple-icon.tsx` — generated OG/icon assets (no binary assets required).
- `not-found.tsx` (with search box), `error.tsx` (client, retry), `loading.tsx`, `[slug]/loading.tsx`,
  `api/search` error shape.
- `opengraph-image` fallbacks via `lib/seo/opengraph.tsx` (`ImageResponse`) for pages without art.

---

### Phase 9 — Quality audit & hardening
**Goal:** the "final quality requirement" checklist, item by item.

1. Grep-audit: duplicated components, JSX blocks, GROQ strings, TS types, SEO logic,
   constants, client components.
2. Verify **zero** `"use client"` outside the allow-list.
3. Verify **zero** GROQ outside `lib/sanity/queries.ts`.
4. Verify **zero** `any`, zero inline `<script type="application/ld+json">` outside `JsonLd`.
5. Accessibility pass: landmarks, heading order, focus-visible rings, keyboard nav for nav &
   dialog, `aria-*` on tabs/accordion/pagination, alt text enforcement, contrast ratios for the
   gold-on-ink palette, `prefers-reduced-motion`.
6. Responsive pass: 320 / 375 / 768 / 1024 / 1440 — grids collapse 2→3→4/6 cols, rails scroll,
   nav becomes a drawer, tables become cards.
7. Performance pass: `next/image` everywhere with `sizes`, priority only on the hero LCP image,
   lazy iframes, no waterfalls, `revalidate` + tags on every query, streaming + skeletons.
8. `npm run lint` + `npm run build` (type-check) + a production `next start` smoke test on a
   sample of URL shapes.
9. `README.md` — setup, env vars, Studio workflow, authoring rules (unique flat slug,
   relationship-based episodes), deployment + webhook revalidation snippet.
10. Final checklist table in this file ticked off.

---

## 3. Target folder structure

```
app/
├── page.tsx                     # homepage (sections from Phase 6)
├── layout.tsx                   # shell + site-wide JSON-LD
├── globals.css                  # Tailwind v4 @theme design tokens
├── [slug]/
│   ├── page.tsx                 # THE flat content resolver (all 7 types)
│   └── loading.tsx
├── turkish-series/page.tsx
├── turkish-movies/page.tsx
├── blog/page.tsx
├── categories/page.tsx
├── search/page.tsx
├── api/search/route.ts
├── studio/[[...tool]]/page.tsx  # optional embedded Sanity Studio
├── sitemap.ts
├── robots.ts
├── icon.tsx  apple-icon.tsx  opengraph-image.tsx
├── not-found.tsx  error.tsx  global-error.tsx  loading.tsx

components/
├── layout/      SiteHeader SiteFooter DesktopNav MobileNav SearchTrigger
├── home/        SiteHero + 7 homepage sections
├── archive/     ArchivePage ArchiveFilters ArchiveGrid
├── search/      SearchDialog SearchField SearchResults SearchResultItem
├── series/      SeriesTemplate SeriesSeasonTabs SeriesFacts
├── seasons/     SeasonTemplate
├── episodes/    EpisodeTemplate EpisodePlayer EpisodeNavigation EpisodeList EpisodeListSkeleton
├── movies/      MovieTemplate
├── blog/        BlogPostTemplate BlogArticleHeader
├── categories/  CategoryTemplate CategoryCard
├── pages/       PageTemplate ProsePage
├── seo/         JsonLd JsonLdSet
├── ui/          Container Section SectionHeader ContentCard ContentGrid ContentRail
│                ContentHero Breadcrumbs Prose Pagination EmptyState ErrorState
│                Skeletons Badge MetaList Chip Stat ScrollTopButton ShareButtons
│                VideoPlayer ResponsiveImage
└── home/…

lib/
├── sanity/       client.ts fetch.ts queries.ts content.ts types.ts image.ts index.ts
├── seo/          config.ts metadata.ts urls.ts json-ld.ts opengraph.tsx
├── site/         config.ts navigation.ts routes.ts
├── video/        providers.ts url.ts
├── utils/        index.ts cn.ts date.ts number.ts text.ts url.ts array.ts
└── search.ts

sanity/
├── schemas/      index.ts seo.ts media.ts richText.ts videoSource.ts
│                 documents/{series,season,episode,movie,blogPost,category,page,siteSettings}.ts
│                 validation/isUniqueSlug.ts validation/seoLength.ts
├── structure.ts  desk structure (grouped, flat-URL aware)
└── lib/          (studio-only helpers)

types/            sanity-env.d.ts
```

---

## 4. Slug authoring contract (enforced in Studio)

| Document | Slug convention | Example |
| --- | --- | --- |
| Series | series name / marketing name | `sultan-muhammad-fateh-blog` |
| Season | optional, only when a landing page is wanted | `sultan-muhammad-fateh-season-4` |
| Episode | `<series-slug>-episode-<n>-<suffix>` | `sultan-muhammad-fateh-episode-85-in-urdu-subtitles` |
| Movie | movie title slug | `tomris` |
| BlogPost | article slug | `history-of-mughal` |
| Category | category name slug | `sultan-muhammad-fateh` ⚠ conflicts with Series — prefer `sultan-muhammad-fateh-category` |
| Page | fixed set or custom | `about-us` |

Suffix variants for episodes (cosmetic, editor's choice): `-in-urdu-subtitles`,
`-with-urdu-subtitles`, `-with-urdu-subtitles-full`, or bare `-episode-85`.

Slug is **authored, not derived**. Two validation guards:
1. `isUniqueSlug` — rejects duplicates across all 7 types and reserved routes.
2. A structural desk structure that hides hierarchical paths, so editors never expect
   `/series/x/season/y/episode/z`.

---

## 5. Non-goals

- No user accounts, comments, ratings or watch-history (no backend to back them honestly).
- No invented structured data (no `aggregateRating`, no `interactionStatistic` without real data).
- No hierarchical public URLs, ever.
- No hard-coded content lists, no per-document route files, no duplicated 