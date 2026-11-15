import type { NextConfig } from "next";

/**
 * Next.js configuration.
 *
 * - output "standalone": used by the Docker image (see dockerfile).
 * - rewrites: /api/* is proxied to the Spring Boot backend. Rewrites are
 *   fixed at build time, so set API_PROXY_URL before `next build` when the
 *   backend is not on http://localhost:8080 (e.g. http://backend:8080 in
 *   Docker).
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
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_PROXY_URL ?? "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
