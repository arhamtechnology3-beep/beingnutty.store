import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostinger (and some other hosts) block Turbopack's PostCSS child-process sockets.
  // Production builds use `next build --webpack`; this keeps local `next dev` working.
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
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
        ],
      },
    ];
  },
};

export default nextConfig;
