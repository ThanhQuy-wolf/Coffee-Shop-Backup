import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * Currently uses all defaults — no custom rewrites, redirects, or image domains needed.
 * Add options here as the project grows (e.g. `images.remotePatterns` when using
 * external image URLs, `experimental.serverActions` for form handling, etc.)
 *
 * Docs: https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
