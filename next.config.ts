import type { NextConfig } from "next";

/**
 * Only allow remote images from hosts we control or trust.
 * `cdn.sanity.io` is the Sanity image pipeline; everything else is opt-in.
 */
const remoteImagePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Sanity serves responsive AVIF/WebP at the same URL — always re-encode.
    formats: ["image/avif", "image/webp"],
    remotePatterns: remoteImagePatterns,
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320, 384],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Never let a third party frame the Studio or the app shell.
      {
        source: "/studio/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },

  experimental: {
    optimizePackageImports: ["@portabletext/react"],
  },

  async redirects() {
    // Tolerate the legacy hierarchical + WordPress style URLs by pointing them at
    // the canonical flat slug instead of 404-ing (keeps inbound links alive).
    return [
      {
        source: "/series/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/movies/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/pages/:slug",
        destination: "/:slug",
        permanent: true,
      },
      {
        source: "/category/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;