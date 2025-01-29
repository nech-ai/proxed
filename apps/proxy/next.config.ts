import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@proxed/supabase"],
};

export default withSentryConfig(nextConfig, {
	org: "vahaah",
	project: "proxed-api",
	silent: true,
});
