/** @type {import('next').NextConfig} */

/* The site lives under /Portfolio on GitHub Pages. basePath prefixes Next's
   own files and links; normalizePublicHref() (lib/shared.ts) prefixes plain
   asset paths with the same value. */
const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio" : "");

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: BASE_PATH,
  /* Static export: no image optimizer; thumbnails are pre-generated (npm run thumbs) */
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ["framer-motion"] },
};

export default nextConfig;
