import { getAllowAttribute, getReferrerPolicy, parseEmbedUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

/**
 * THE video player.
 *
 * A single component renders every piece of video on the site. It is driven by
 * the CMS `embedUrl` plus the declarative provider registry in
 * `lib/video/providers.ts` — adding a provider never means adding a component.
 *
 * Behaviour:
 *  - responsive `aspect-video` box, no layout shift
 *  - lazy iframe so third-party scripts never block rendering
 *  - provider-driven `allow` / `referrerPolicy` / `sandbox`
 *  - nothing is rendered for a missing, non-HTTPS, or non-allow-listed URL
 *  - accessible: the iframe title mirrors the media title
 *
 * Legal: only embed sources the provider permits and that the site owner is
 * licensed to redistribute.
 */
export interface VideoPlayerProps {
  /** Raw CMS value — never hard-coded anywhere in the codebase. */
  embedUrl?: string | null;
  /** Accessible name for the player. */
  title: string;
  poster?: string | null;
  /** `embed` renders the iframe; `external` shows a link-out panel. */
  variant?: "embed" | "external";
  className?: string;
  /** Compact padding for players embedded inside cards or lists. */
  compact?: boolean;
  /** Extra note rendered under the player (e.g. subtitle availability). */
  note?: string;
}

export function VideoPlayer({
  embedUrl,
  title,
  poster,
  variant = "embed",
  className,
  compact = false,
  note,
}: VideoPlayerProps) {
  const parsed = parseEmbedUrl(embedUrl);

  if (variant === "external" || parsed.status === "missing") {
    return (
      <PlayerShell className={className} compact={compact} poster={poster}>
        <UnavailablePanel
          title={variant === "external" ? "Watch on the provider's site" : parsed.message}
          embedUrl={embedUrl}
          compact={compact}
        />
      </PlayerShell>
    );
  }

  if (parsed.status !== "ready" || !parsed.embedUrl) {
    return (
      <PlayerShell className={className} compact={compact} poster={poster}>
        <UnavailablePanel title={parsed.message} compact={compact} />
      </PlayerShell>
    );
  }

  return (
    <figure className={className}>
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-[var(--radius-panel)] bg-ink-900 ring-1 ring-inset ring-white/10",
          compact && "rounded-[var(--radius-card)]",
        )}
      >
        <iframe
          src={parsed.embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          frameBorder={0}
          allow={getAllowAttribute(parsed.provider)}
          allowFullScreen
          loading="lazy"
          referrerPolicy={getReferrerPolicy(parsed.provider)}
          {...(parsed.provider.sandbox ? { sandbox: parsed.provider.sandbox } : {})}
        />
      </div>

      {note ? (
        <figcaption className="mt-3 text-xs text-parchment-400">{note}</figcaption>
      ) : null}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Internals                                                                  */
/* -------------------------------------------------------------------------- */

function PlayerShell({
  className,
  compact,
  poster,
  children,
}: {
  className?: string;
  compact: boolean;
  poster?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          "relative grid aspect-video w-full place-items-center overflow-hidden rounded-[var(--radius-panel)] bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 bg-cover bg-center ring-1 ring-inset ring-white/10",
          compact && "rounded-[var(--radius-card)]",
        )}
        {...(poster
          ? {
              style: {
                backgroundImage: `linear-gradient(to top, rgba(6,7,10,0.92), rgba(6,7,10,0.55)), url("${poster}")`,
              },
            }
          : {})}
      >
{/* Decorative poster layer: the accessible name comes from the iframe. */}
        <span aria-hidden="true" className="absolute inset-0" />
        <div className="relative px-6 text-center">{children}</div>
      </div>
    </div>
  );
}

function UnavailablePanel({
  title,
  embedUrl,
  compact,
}: {
  title: string | null;
  embedUrl?: string | null;
  compact: boolean;
}) {
  const href = embedUrl?.trim() || null;

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "grid place-items-center rounded-full bg-ink-700/80 text-gold-300 ring-1 ring-white/10",
          compact ? "size-10" : "size-14",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} className="size-1/2">
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="m16 10.5 5-3v9l-5-3z" />
        </svg>
      </span>

      <p className={cn("max-w-sm text-pretty text-parchment-200", compact ? "text-xs" : "text-sm")}>
        {title ?? "The player is unavailable for this title right now."}
      </p>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="rounded-full bg-gold-400 px-4 py-2 text-xs font-semibold text-ink-950 transition hover:bg-gold-300"
        >
          Open video source
        </a>
      ) : null}
    </div>
  );
}