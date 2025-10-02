import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    workerThreads: false,
  },
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      minimize: false,
    }
    return config
  },
};

export default nextConfig;
