/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@fortawesome/react-fontawesome"],
  },
  compress: true, // Enable gzip compression for static exports
};

export default nextConfig;
