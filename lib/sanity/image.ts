import imageUrlBuilder from "@sanity/image-url";
import type { SanityImage } from "./types";

/**
 * Sanity image pipeline helpers.
 *
 * Everything the app renders through `next/image` comes from here, so:
 *  - only CDN-served assets are ever passed to the Image component
 *  - a low-quality-image-placeholder (LQIP) is generated once, not per call site
 *  - a deterministic intrinsic size is always available (prevents layout shift)
 */

const BUILDER_FALLBACK_DATASET = "production";

let builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder(): ReturnType<typeof imageUrlBuilder> {
  if (builder) return builder;

  builder = imageUrlBuilder({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "placeholder",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || BUILDER_FALLBACK_DATASET,
  });

  return builder;
}

/** Ready-to-use `next/image` source, or `undefined` when there is no asset. */
export interface ResolvedImage {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
  alt: string;
}

/** Builds a CDN URL at an explicit width. Returns "" for missing/invalid assets. */
export function sanityImageUrl(
  image: SanityImage | null | undefined,
  width: number,
  options: { height?: number; fit?: "clip" | "crop" | "fill" | "fillmax" | "max" } = {},
): string {
  const ref = image?.asset?._ref;
  if (!ref) return "";

  let url = getBuilder().image(ref).auto("format").fit(options.fit ?? "max").width(width);
  if (options.height) url = url.height(options.height);
  return url.url();
}

/**
 * The single entry point components use. Returns `undefined` so the caller can
 * render its own placeholder instead of an `<img>` with a broken `src`.
 */
export function resolveImage(
  image: SanityImage | null | undefined,
  options: { width?: number; height?: number; alt?: string } = {},
): ResolvedImage | undefined {
  const width = options.width ?? 640;
  const src = sanityImageUrl(image, width, { height: options.height });
  if (!src) return undefined;

  const dimensions = image?.asset?.metadata?.dimensions;

  return {
    src,
    width: options.width ?? dimensions?.width ?? width,
    height:
      options.height ??
      dimensions?.height ??
      Math.round(width * 1.5),
    blurDataURL: image?.asset?.metadata?.lqip ?? undefined,
    alt: options.alt ?? image?.alt ?? "",
  };
}

/**
 * `srcSet` candidates so `next/image` (or a raw `<img>` fallback) can pick the
 * smallest asset that fits. Widths are the breakpoints we actually render at.
 */
export function sanityImageSrcSet(image: SanityImage | null | undefined): string {
  if (!image?.asset?._ref) return "";
  const widths = [320, 480, 640, 768, 1024, 1280, 1600, 1920];
  return widths
    .map((width) => `${sanityImageUrl(image, width)} ${width}w`)
    .join(", ");
}

/** Intrinsic aspect ratio (width / height) when Sanity reports one. */
export function imageAspectRatio(image: SanityImage | null | undefined): number | undefined {
  const dimensions = image?.asset?.metadata?.dimensions;
  if (!dimensions?.width || !dimensions?.height) return undefined;
  return dimensions.width / dimensions.height;
}

/** Tiny blurred data URI for background placeholders (hero scrims, rails). */
export function imageBlurDataUrl(image: SanityImage | null | undefined): string | undefined {
  return image?.asset?.metadata?.lqip ?? undefined;
}