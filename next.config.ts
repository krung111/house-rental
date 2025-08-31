import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Optional: keep this if you don’t want Vercel’s image optimization
  },
};

export default nextConfig;
