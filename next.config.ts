import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily disable ESLint during next build to avoid rushstack patch issues.
    // Lint via `npm run lint` instead.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
