/** @type {import('next').NextConfig} */

// BASE PATH — one value, used by both mechanisms.
//
// The site lives at https://ahmed-emad-nasr.github.io/Portfolio/, so every
// URL needs the /Portfolio prefix in production:
//   • Next's own `basePath` prefixes _next/ chunks, CSS, fonts and next/link.
//   • normalizePublicHref() (core/config/shared.ts) prefixes plain <a>/<img>
//     asset paths, which `basePath` does not touch (images are unoptimized).
// Both read the same expression, so they can never disagree. Before, basePath
// was only injected by actions/configure-pages in CI, which meant a local
// `npm run build` produced a site whose CSS and JS 404'd under /Portfolio.
const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/Portfolio" : "");

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: BASE_PATH,

  images: {
    // Static export cannot run the optimizer at request time, so next/image is
    // effectively a plain <img>. Pre-generate AVIF/WebP with your Python script.
    unoptimized: true,
    // REMOVED: deviceSizes / imageSizes / formats / remotePatterns. All four are
    // ignored while `unoptimized` is true — keeping them implied an optimization
    // pipeline that does not exist.
  },

  experimental: {
    // Trimming the icon packages is the biggest single bundle win here. The old
    // config listed only react-fontawesome, which is the thin wrapper — the
    // multi-megabyte icon PACKS were left untreated.
    // This used to have 3 entries for the @fortawesome packages. Those packages are no longer imported from
    // app/ at all — the icons were converted into an internal SVG table (core/icons/icon-data.ts)
    // and the packages are only used by the generator script. So the entries pointed at
    // something that isn't in the bundle and did nothing.
    optimizePackageImports: ["framer-motion"],
    // REMOVED optimizeCss: it requires the `beasties` package (Next 15+), which
    // is NOT in your lockfile — the build fails. Re-enable after: npm i -D beasties
  },

  // REMOVED `compress`: it only affects the Next.js Node server. With
  // output: "export" there is no server — GitHub Pages handles gzip/brotli.

  // NOTE: the `eslint` key was REMOVED — Next 16 dropped built-in lint
  // integration (next lint is gone). Linting now runs only via `npm run lint`,
  // which the `verify` script already chains.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
