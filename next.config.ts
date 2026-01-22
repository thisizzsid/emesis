import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily disable ESLint during next build to avoid rushstack patch issues.
    // Lint via `npm run lint` instead.
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
