/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Image optimisation
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [],
  },

  // Compiler optimisations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
}

module.exports = nextConfig
