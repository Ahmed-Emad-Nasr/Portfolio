/** @type {import('next').NextConfig} */

// GitHub Pages serves this repo from a sub-path: /Portfolio
// Without basePath + assetPrefix every /_next/* asset and /Assets/* image 404s.
// Set to "" if you move to a custom domain or a user-root page.
const REPO_BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/Portfolio";

const nextConfig = {
  reactStrictMode: true,
  output: "export",

  basePath: REPO_BASE,
  assetPrefix: REPO_BASE || undefined,

  // GitHub Pages has no rewrite engine. Without this, /blog returns 404
  // because only /blog/index.html exists on disk.
  trailingSlash: true,

  images: {
    // Static export cannot run the Next image optimizer at request time,
    // so next/image is a plain <img>. Pre-generate AVIF/WebP + srcset yourself.
    unoptimized: true,
    // NOTE: deviceSizes / imageSizes / formats / remotePatterns are ALL ignored
    // while unoptimized is true. Removed to avoid the illusion of optimization.
  },

  experimental: {
    // Trimming icon packages is the single biggest bundle win here.
    // react-fontawesome alone was not enough - the icon packs are the heavy part.
    optimizePackageImports: [
      "@fortawesome/react-fontawesome",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-brands-svg-icons",
      "react-bootstrap-icons",
      "framer-motion",
    ],
    // optimizeCss was REMOVED: it requires the `beasties` package (Next 15+),
    // which is not in your lockfile. Re-enable only after:
    //   npm i -D beasties
  },

  // `compress` was REMOVED: it only affects the Next.js Node server.
  // With output: "export" there is no server - GitHub Pages handles gzip/brotli.

  // Fail the build on real errors instead of shipping broken pages.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
