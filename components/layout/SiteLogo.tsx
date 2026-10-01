import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/lib/site/config";
import { cn } from "@/lib/utils";

/**
 * Shared brand mark used in the site header, footer, and error pages.
 */
export function SiteLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "group inline-flex shrink-0 items-center",
        className,
      )}
    >
      <Image
        src={siteConfig.logo}
        alt=""
        width={1805}
        height={386}
        loading="eager"
        className="h-5 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-9"
      />
    </Link>
  );
}