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
  output: "export", // Bắt buộc để tạo ra thư mục /out
  images: {
    unoptimized: true, // Thường cần thiết cho static export
  },
};

export default nextConfig;
