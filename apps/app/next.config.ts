import type { NextConfig } from "next";

const cspDirectives = () => {
	const connectSrc: string[] = ["'self'"];
	const imgSrc: string[] = ["'self'", "data:", "blob:"];

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (supabaseUrl) {
		try {
			const origin = new URL(supabaseUrl).origin;
			connectSrc.push(origin);
			imgSrc.push(origin);
		} catch {}
	}

	// Public API base used in UI (with fallback used in code)
	const proxyApiUrl = process.env.NEXT_PUBLIC_PROXY_API_URL || "https://api.proxed.dev";
	try {
		const origin = new URL(proxyApiUrl).origin;
		connectSrc.push(origin);
		imgSrc.push(origin);
	} catch {}

	// Optional Sentry ingestion endpoints if enabled
	connectSrc.push("https://*.sentry.io");

	return [
		"default-src 'self'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"form-action 'self'",
		"object-src 'none'",
		// Allow minimal inline scripts for Next hydration
		"script-src 'self' 'unsafe-inline'",
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline'",
		`img-src ${imgSrc.join(" ")}`,
		"font-src 'self' data:",
		`connect-src ${connectSrc.join(" ")}`,
		"worker-src 'self' blob:",
		"upgrade-insecure-requests",
	];
};

const nextConfig: NextConfig = {
	transpilePackages: ["@proxed/supabase"],
	poweredByHeader: false,

	async headers() {
		const securityHeaders = [
			{ key: "Content-Security-Policy", value: cspDirectives().join("; ") },
			{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
			{ key: "X-Content-Type-Options", value: "nosniff" },
			{ key: "X-Frame-Options", value: "DENY" },
			{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=(), usb=(), payment=()" },
			{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
			{ key: "Cross-Origin-Resource-Policy", value: "same-origin" },
			{ key: "X-DNS-Prefetch-Control", value: "off" },
			{ key: "X-Permitted-Cross-Domain-Policies", value: "none" },
			{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
		];

		return [
			{ source: "/:path*", headers: securityHeaders },
		];
	},

	async redirects() {
		return [
			{ source: "/", destination: "/metrics", permanent: true },
			{ source: "/settings", destination: "/settings/team/general", permanent: true },
			{ source: "/settings/team", destination: "/settings/team/general", permanent: true },
		];
	},
};

export default nextConfig;
