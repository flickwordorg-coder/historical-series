import type { Episode } from "@/lib/sanity";
import { resolveImage } from "@/lib/sanity/image";
import { formatDuration } from "@/lib/utils";

import { VideoPlayer } from "@/components/ui/VideoPlayer";

/**
 * Episode player composition.
 *
 * Thin by design: it supplies the poster and the accessibility note to the one
 * `<VideoPlayer>` implementation. There is no iframe markup here, and no video
 * URL is ever hard-coded — it always comes from the CMS document.
 */
export function EpisodePlayer({
  episode,
  className,
  note,
}: {
  episode: Episode;
  className?: string;
  note?: string;
}) {
  const poster = resolveImage(episode.thumbnail, { width: 1600, alt: episode.title });
  const runtime = formatDuration(episode.duration);

  return (
    <VideoPlayer
      embedUrl={episode.embedUrl}
      title={episode.title}
      poster={poster?.src ?? null}
      variant={episode.videoType === "external" ? "external" : "embed"}
      className={className}
      note={
        note ??
        (runtime
          ? `Runtime ${runtime}. Subtitles are provided by the source player.`
          : "Subtitles are provided by the source player.")
      }
    />
  );
}