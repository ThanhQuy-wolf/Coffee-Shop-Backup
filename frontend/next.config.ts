import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * - output "standalone": used by the Docker image (see dockerfile).
 * - rewrites: in development, /api/* is proxied to the backend. Set
 *   API_PROXY_URL to point at another backend (default: the backend on the
 *   Docker host, port 32080).
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
  async rewrites() {
    const rewrites = [];

    if (process.env.NODE_ENV !== "production") {
      rewrites.push({
        source: "/api/:path*",
        destination: `${process.env.API_PROXY_URL ?? "http://host.docker.internal:32080"}/api/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
