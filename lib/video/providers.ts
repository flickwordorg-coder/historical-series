/**
 * Video provider registry — configuration, not components.
 *
 * Adding support for another embeddable provider is one entry in
 * `VIDEO_PROVIDERS`. No new component, no new JSX, no new props.
 *
 * SECURITY / LEGAL CONTRACT
 * Only providers listed here may be embedded. The site owner is responsible for
 * embedding sources they are licensed to redistribute and that permit
 * embedding. `BLOCKED_HOSTS` is a hard deny-list applied before anything renders.
 */

export interface VideoProvider {
  id: string;
  label: string;
  /** Exact hosts (`hostname` + optional `pathname` prefix) this entry matches. */
  hosts: Array<{ hostname: string; pathnamePrefix?: string }>;
  /** `iframe` `allow` attribute. */
  allow: string;
  /** Restrictive sandbox flags; omit for providers that need scripts/storage. */
  sandbox?: string;
  /**
   * `iframe` referrer policy. Typed against the DOM's `ReferrerPolicy` union so
   * an unsupported value is a compile error rather than a silent no-op.
   */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  /** Panel is shown instead of the iframe when the host is not allowed. */
  blocked?: boolean;
}

export const DEFAULT_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

/** Fallback when a provider entry does not declare its own policy. */
export const DEFAULT_REFERRER_POLICY: React.HTMLAttributeReferrerPolicy =
  "strict-origin-when-cross-origin";

/**
 * Deny-list: hosts that must never be embedded (script-sharing / sketchy mirrors).
 * Matching is on the registrable host suffix, so subdomains are covered too.
 */
export const BLOCKED_HOSTS: readonly string[] = [
  "videodelivery.net", // hotlinking-protected
  "filebin.net",
];

export const VIDEO_PROVIDERS: readonly VideoProvider[] = [
  {
    id: "niazitv",
    label: "Niazi TV",
    hosts: [{ hostname: "play.niazitv.pk" }, { hostname: "niazitv.pk" }],
    allow: DEFAULT_ALLOW,
    referrerPolicy: "origin",
  },
  {
    id: "dailymotion",
    label: "Dailymotion",
    hosts: [{ hostname: "dailymotion.com" }, { hostname: "dai.ly" }],
    allow: DEFAULT_ALLOW,
    referrerPolicy: "origin",
  },
  {
    id: "youtube",
    label: "YouTube",
    hosts: [{ hostname: "www.youtube.com" }, { hostname: "youtube.com" }, { hostname: "www.youtube-nocookie.com" }],
    allow: DEFAULT_ALLOW,
    referrerPolicy: "strict-origin-when-cross-origin",
  },
  {
    id: "vimeo",
    label: "Vimeo",
    hosts: [{ hostname: "player.vimeo.com" }],
    allow: DEFAULT_ALLOW,
    referrerPolicy: "origin",
  },
  {
    id: "okru",
    label: "OK.ru",
    hosts: [{ hostname: "ok.ru" }, { hostname: "odnoklassniki.ru" }],
    allow: DEFAULT_ALLOW,
    referrerPolicy: "origin",
  },
];

/** Providers that are intentionally not embedded; the UI shows a fallback panel. */
export const DISABLED_PROVIDER: VideoProvider = {
  id: "disabled",
  label: "Unavailable",
  hosts: [],
  allow: "",
  blocked: true,
};

export function findProvider(url: URL): VideoProvider | null {
  const host = url.hostname.toLowerCase();

  const match = VIDEO_PROVIDERS.find((provider) =>
    provider.hosts.some(
      (entry) =>
        host === entry.hostname.toLowerCase() ||
        host.endsWith(`.${entry.hostname.toLowerCase()}`),
    ),
  );

  if (!match) return null;

  // Path-level restriction, when the provider entry declares one.
  const entry = match.hosts.find(
    (candidate) =>
      url.hostname.toLowerCase() === candidate.hostname.toLowerCase() ||
      url.hostname.toLowerCase().endsWith(`.${candidate.hostname.toLowerCase()}`),
  );

  if (entry?.pathnamePrefix && !url.pathname.startsWith(entry.pathnamePrefix)) {
    return null;
  }

  return match;
}