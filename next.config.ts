import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dev/build artifacts isolated when both commands are run in parallel.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
