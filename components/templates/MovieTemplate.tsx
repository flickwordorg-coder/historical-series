import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Chip } from "@/components/ui/Badge";
import { ContentHero } from "@/components/ui/ContentHero";
import { MetaList } from "@/components/ui/MetaList";
import { Prose } from "@/components/ui/Prose";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { Section } from "@/components/ui/Section";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { getRelatedMovies } from "@/lib/sanity";
import type { Movie } from "@/lib/sanity/types";
import { resolveImage } from "@/lib/sanity/image";
import { rootPath } from "@/lib/site/routes";
import { formatDuration, plainTextFromPortableText } from "@/lib/utils";

/**
 * Movie page — `/dirilis-eglesti/`.
 *
 * Structurally identical to the series page minus episodes: same hero, same
 * facts panel, same player, same related rail. Keeping them parallel is what lets
 * both templates share `ContentHero`, `MetaList` and `VideoPlayer` verbatim.
 */
export async function MovieTemplate({ movie }: { movie: Movie }) {
  const related = await getRelatedMovies(movie._id, movie.genres ?? [], 6);
  const poster = resolveImage(movie.poster, { width: 640, alt: movie.title });

  // The hero carries a short standfirst; the Story section carries the full
  // synopsis. Both come from the same `description` field, so the standfirst is
  // a clamped plain-text excerpt rather than a second render of the same blocks.
  const synopsis = movie.description;
  const standfirst = plainTextFromPortableText(synopsis, 220);

  return (
    <>
      <ContentHero
        eyebrow="Turkish historical movie"
        title={movie.title}
        description={standfirst ? <p className="max-w-prose text-sm">{standfirst}</p> : undefined}
        image={movie.banner ?? movie.poster}
        poster={movie.poster}
        imageAlt={movie.title}
      >
        <Breadcrumbs
          crumbs={[
            { name: "Movies", path: rootPath("turkish-movies") },
            { name: movie.title, path: rootPath(movie.slug) },
          ]}
        />
      </ContentHero>

      <Section spacing="md" className="!py-10 sm:!py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <VideoPlayer
              embedUrl={movie.embedUrl}
              title={movie.title}
              poster={poster?.src ?? null}
              variant={movie.videoType === "external" ? "external" : "embed"}
              note={
                formatDuration(movie.duration)
                  ? `Runtime ${formatDuration(movie.duration)}.`
                  : undefined
              }
            />

            {synopsis?.length ? (
              <section aria-labelledby="movie-overview" className="mt-12">
                <h2 id="movie-overview" className="text-display-md text-parchment-50">
                  Story
                </h2>
                <Prose value={synopsis} className="mt-4" />
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[var(--radius-panel)] bg-ink-900 p-6 ring-1 ring-inset ring-white/8">
              <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-parchment-400">
                Film information
              </h2>

              <MetaList
                columns={1}
                className="mt-4"
                items={[
                  { label: "Released", value: movie.releaseYear },
                  { label: "Runtime", value: formatDuration(movie.duration) },
                  { label: "Country", value: movie.country },
                  { label: "Language", value: movie.language },
                  {
                    label: "Genres",
                    value: movie.genres?.length ? movie.genres.join(", ") : null,
                  },
                ]}
              />

              {movie.genres?.length ? (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {movie.genres.map((genre) => (
                    <Chip key={genre}>{genre}</Chip>
                  ))}
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </Section>

      <RelatedContent
        eyebrow="More to watch"
        title="Related movies"
        items={related}
        layout="rail"
        ratio="poster"
        action={{ href: rootPath("turkish-movies"), label: "All movies" }}
        hideWhenEmpty
      />
    </>
  );
}
