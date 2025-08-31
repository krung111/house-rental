import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/house-rental",
  assetPrefix: "/house-rental/",
};

export default nextConfig;
