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

  // Handle Three.js as external to prevent build-time issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [...(config.externals || []), 'three'];
    }
    return config;
  },
}

module.exports = nextConfig
