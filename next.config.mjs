/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    // Static export on GitHub Pages: keep unoptimized and rely on pre-generated assets.
    unoptimized: true,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@fortawesome/react-fontawesome"],
  },
  compress: true, // Enable gzip compression for static exports
};

export default nextConfig;
