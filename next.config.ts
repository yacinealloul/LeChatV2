import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
};

export default nextConfig;
