import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Responsive image for Sanity assets.
 *
 * One component, so `sizes`, the blur placeholder and the fallback treatment are
 * defined once. `fill` is the default because almost every image in this design
 * is a cropped card/hero slot rather than an intrinsic-size asset.
 */
export interface ResponsiveImageProps {
  /** Output width for the `sizes` hint and the Sanity CDN request. */
  width?: number;
  height?: number;
  alt: string;
  src?: string | null;
  blurDataURL?: string | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** Fill the nearest positioned ancestor. */
  fill?: boolean;
  quality?: number;
}

export function ResponsiveImage({
  width = 640,
  height,
  alt,
  src,
  blurDataURL,
  sizes,
  priority = false,
  className,
  imgClassName,
  fill = true,
  quality,
}: ResponsiveImageProps) {
  if (!src) {
    return <ImageFallback className={className} label={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill
        ? { fill: true }
        : { width, ...(height ? { height } : {}) })}
      {...(sizes ? { sizes } : fill ? { sizes: "(max-width: 640px) 90vw, 640px" } : {})}
      {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
      priority={priority}
      {...(quality ? { quality } : {})}
      className={cn("object-cover", imgClassName, className)}
    />
  );
}

export function ImageFallback({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      role="presentation"
      aria-label={label}
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-ink-700 via-ink-800 to-ink-900",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-1/3 max-h-12 max-w-12 text-ink-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13Z" />
        <path d="m3.5 16 4.2-4.2a1.5 1.5 0 0 1 2.1 0L14 16m0 0 2.2-2.2a1.5 1.5 0 0 1 2.1 0l2.2 2.2M14 16v3.5" />
        <circle cx="14.8" cy="8.4" r="1.6" />
      </svg>
    </div>
  );
}