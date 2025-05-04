export function getBaseUrl() {
	if (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) {
		return process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
	}
	if (process.env.NEXT_PUBLIC_SITE_URL) {
		return process.env.NEXT_PUBLIC_SITE_URL;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return `http://localhost:${process.env.PORT ?? 3000}`;
}
