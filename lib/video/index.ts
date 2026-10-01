import {
  BLOCKED_HOSTS,
  DEFAULT_ALLOW,
  DEFAULT_REFERRER_POLICY,
  DISABLED_PROVIDER,
  findProvider,
  type VideoProvider,
} from "./providers";

/**
 * Embed URL validation.
 *
 * This is the single gate between CMS data and an `<iframe src>`. It refuses
 * anything that is not HTTPS, anything on the deny-list, and anything whose host
 * is not an approved embeddable provider. The result drives the one and only
 * `<VideoPlayer>` component.
 */

export type EmbedStatus = "ready" | "missing" | "invalid" | "blocked";

export interface ParsedEmbed {
  status: EmbedStatus;
  /** Sanitised URL that is safe to place in `src`, or `null` when not usable. */
  embedUrl: string | null;
  provider: VideoProvider;
  /** Human explanation shown when `status !== "ready"`. */
  message: string | null;
}

function result(
  status: EmbedStatus,
  embedUrl: string | null,
  provider: VideoProvider,
  message: string | null,
): ParsedEmbed {
  return { status, embedUrl, provider, message };
}

export function parseEmbedUrl(value?: string | null): ParsedEmbed {
  if (!value || !value.trim()) {
    return result("missing", null, DISABLED_PROVIDER, "No video source has been added yet.");
  }

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return result("invalid", null, DISABLED_PROVIDER, "The video URL stored for this title is not valid.");
  }

  if (url.protocol !== "https:") {
    return result("invalid", null, DISABLED_PROVIDER, "Video sources must use HTTPS.");
  }

  const host = url.hostname.toLowerCase();
  const blocked = BLOCKED_HOSTS.some(
    (entry) => host === entry.toLowerCase() || host.endsWith(`.${entry.toLowerCase()}`),
  );

  if (blocked) {
    return result(
      "blocked",
      null,
      DISABLED_PROVIDER,
      "This video host is not permitted to be embedded.",
    );
  }

  const provider = findProvider(url);
  if (!provider) {
    return result(
      "blocked",
      null,
      DISABLED_PROVIDER,
      "This video provider is not on the embed allow-list.",
    );
  }

  return result("ready", url.toString(), provider, null);
}

/** Convenience wrapper: the URL to place in `src`, or `undefined`. */
export function getSafeEmbedUrl(value?: string | null): string | undefined {
  const parsed = parseEmbedUrl(value);
  return parsed.status === "ready" && parsed.embedUrl ? parsed.embedUrl : undefined;
}

/** Effective `allow` attribute for a provider. */
export function getAllowAttribute(provider: VideoProvider): string {
  return provider.allow || DEFAULT_ALLOW;
}

/** Effective `referrerPolicy` for a provider. */
export function getReferrerPolicy(provider: VideoProvider): React.HTMLAttributeReferrerPolicy {
  return provider.referrerPolicy ?? DEFAULT_REFERRER_POLICY;
}

export type { VideoProvider };