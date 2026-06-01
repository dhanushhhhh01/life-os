/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Image optimisation
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [],
  },

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Use Turbopack (Next.js 16 default) - required for compatibility
  turbopack: {},
}

module.exports = nextConfig
