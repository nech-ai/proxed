import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["next-mdx-remote"],
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

export default nextConfig;
