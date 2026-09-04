/** @type {import('next').NextConfig} */

// NOTE ON BASE PATH — deliberately NOT set here.
//
// This project already handles the /Portfolio sub-path MANUALLY, via
// normalizePublicHref() in app/core/config/portfolio.ts:
//
//   process.env.NEXT_PUBLIC_BASE_PATH ??
//     (process.env.NODE_ENV === "production" ? "/Portfolio" : "")
//
// Adding Next's own `basePath` on top of that double-prefixes every asset
// (/Portfolio/Portfolio/Assets/...) in production and breaks them in dev,
// where the manual helper resolves to "" but the framework still serves from
// /Portfolio. One base-path mechanism at a time — this project uses the
// manual one, which is already deployed and working.

const nextConfig = {
  reactStrictMode: true,
  output: "export",

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
    // كانت فيها ٣ إدخالات لحزم @fortawesome. الحزم دي مبقتش تتستورد من
    // app/ خالص — الأيقونات اتحوّلت لجدول SVG داخلي (core/icons/icon-data.ts)
    // والحزم فضلت مستخدمة في سكربت التوليد بس. فالإدخالات كانت بتشاور على
    // حاجة مش في الـ bundle أصلاً ومكانتش بتعمل أي حاجة.
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
