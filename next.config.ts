import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dev/build artifacts isolated when both commands are run in parallel.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Images configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // Webpack configuration for Prisma on serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma Client is properly resolved on serverless
      config.resolve.alias["@prisma/client"] = require.resolve("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
