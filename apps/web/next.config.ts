import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "pbs.twimg.com",
      },
    ],
  },
};

module.exports = nextConfig;
