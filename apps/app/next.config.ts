import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@proxed/supabase"],

  async redirects() {
    return [
      {
        source: "/",
        destination: "/metrics",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/settings/team/general",
        permanent: true,
      },
      {
        source: "/settings/team",
        destination: "/settings/team/general",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
