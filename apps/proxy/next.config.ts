import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@proxed/supabase"],
};

module.exports = nextConfig;
