import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.unsplash.com', // 🚀 Wildcard allows images.unsplash, plus.unsplash, etc.
      }
    ]
  }
};

export default nextConfig;