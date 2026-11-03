import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger: Turbopack PostCSS sockets are blocked, and shared hosting can't spawn ~58
  // page-data workers ("Resource temporarily unavailable"). Build with webpack + 1 CPU.
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 50,
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Hostinger hCDN ignores Vary: rsc / next-router-prefetch and will reuse a
          // cached HTML or partial prefetch Flight body for soft navigations, which
          // crashes the App Router ("This page couldn't load"). Keep pages off the
          // shared CDN; Next.js ISR still caches at the Node layer.
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
