import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site/config";

/**
 * robots.txt
 *
 * Everything public is crawlable; only infrastructure routes are excluded. The
 * Studio is disallowed because it is an authoring surface. Paginated archives
 * remain crawlable and self-canonical so deeper content can be discovered.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/studio", "/studio/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
