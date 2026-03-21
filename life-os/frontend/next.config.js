/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routing handled by Vercel configuration (vercel.json)
  // No rewrites needed - Vercel routes /api/* to the Python serverless function

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

  // Output standalone for Docker / Railway (uncomment if deploying frontend on Railway)
  // output: "standalone",

  // Reduce bundle size
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },

  // HTTP response headers for frontend pages
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Cache Next.js static chunks forever (content-hashed filenames)
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
