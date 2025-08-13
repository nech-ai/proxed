import type { NextConfig } from "next";

const cspDirectives = () => {
	const isDev = process.env.NODE_ENV !== "production";
	const connectSrc: string[] = ["'self'"];
	const imgSrc: string[] = ["'self'", "data:", "blob:"];
	const scriptSrc: string[] = ["'self'", "'unsafe-inline'"];

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	if (supabaseUrl) {
		try {
			const origin = new URL(supabaseUrl).origin;
			connectSrc.push(origin);
			imgSrc.push(origin);
		} catch {}
	}

	// Public API base used in UI (with fallback used in code)
	const proxyApiUrl =
		process.env.NEXT_PUBLIC_PROXY_API_URL || "https://api.proxed.ai";
	try {
		const origin = new URL(proxyApiUrl).origin;
		connectSrc.push(origin);
		imgSrc.push(origin);
	} catch {}

	// Optional Sentry ingestion endpoints if enabled
	connectSrc.push("https://*.sentry.io");

	// Dev: allow websocket connections for HMR/dev overlay
	if (isDev) {
		connectSrc.push("ws:", "wss:");
		// Dev: allow eval only in development to support tooling/source maps
		scriptSrc.push("'unsafe-eval'");
	}

	return [
		"default-src 'self'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"form-action 'self'",
		"object-src 'none'",
		// Allow minimal inline scripts for Next hydration
		`script-src ${scriptSrc.join(" ")}`,
		"script-src-attr 'none'",
		"style-src 'self' 'unsafe-inline'",
		"frame-src 'none'",
		"media-src 'self' blob:",
		"manifest-src 'self'",
		"prefetch-src 'self'",
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
			{
				key: "Permissions-Policy",
				value:
					"camera=(), microphone=(), geolocation=(), browsing-topics=(), usb=(), payment=()",
			},
			{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
			{ key: "Cross-Origin-Resource-Policy", value: "same-origin" },
			{ key: "X-Permitted-Cross-Domain-Policies", value: "none" },
			{
				key: "Strict-Transport-Security",
				value: "max-age=63072000; includeSubDomains; preload",
			},
		];

		return [{ source: "/:path*", headers: securityHeaders }];
	},

	async redirects() {
		return [
			{ source: "/", destination: "/metrics", permanent: true },
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

export default nextConfig;
