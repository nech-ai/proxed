import type { HonoRequest } from "hono";

export interface GeoContext {
	ip: string | null;
	country: string | null;
	countryCode: string | null;
	region: string | null;
	regionCode: string | null;
	city: string | null;
	latitude: number | null;
	longitude: number | null;
	timezone: string | null;
	locale: string | null;
	continent: string | null;
	postalCode: string | null;
}

export function getGeoContext(req: HonoRequest): GeoContext {
	const headers = req.header();

	// Extract IP - try multiple headers in order of preference
	const ip =
		headers["cf-connecting-ip"] ??
		headers["x-vercel-forwarded-for"] ??
		headers["x-real-ip"] ??
		headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
		headers["x-client-ip"] ??
		null;

	// Country - Cloudflare and Vercel headers
	const country =
		headers["cf-ipcountry"] ??
		headers["x-vercel-ip-country"] ??
		headers["x-user-country"] ??
		null;

	// Region - Cloudflare and Vercel headers
	const region =
		headers["cf-region"] ??
		headers["x-vercel-ip-country-region"] ??
		headers["x-user-region"] ??
		null;

	// City - Cloudflare and Vercel headers
	const city =
		headers["cf-ipcity"] ??
		headers["x-vercel-ip-city"] ??
		headers["x-user-city"] ??
		null;

	// Continent - Cloudflare and Vercel headers
	const continent =
		headers["cf-ipcontinent"] ?? headers["x-vercel-ip-continent"] ?? null;

	// Latitude - Cloudflare and Vercel headers
	const latitude = headers["cf-iplat"]
		? Number.parseFloat(headers["cf-iplat"])
		: headers["x-vercel-ip-latitude"]
			? Number.parseFloat(headers["x-vercel-ip-latitude"])
			: null;

	// Longitude - Cloudflare and Vercel headers
	const longitude = headers["cf-iplon"]
		? Number.parseFloat(headers["cf-iplon"])
		: headers["x-vercel-ip-longitude"]
			? Number.parseFloat(headers["x-vercel-ip-longitude"])
			: null;

	// Timezone - Cloudflare and Vercel headers
	const timezone =
		headers["cf-timezone"] ??
		headers["x-vercel-ip-timezone"] ??
		headers["x-user-timezone"] ??
		null;

	// Postal code - Cloudflare and Vercel headers
	const postalCode =
		headers["cf-postal-code"] ?? headers["x-vercel-ip-postal-code"] ?? null;

	// Additional headers
	const locale =
		headers["x-user-locale"] ??
		headers["accept-language"]?.split(",")[0] ??
		null;

	// Region code might come from different sources
	const regionCode =
		headers["cf-region-code"] ?? headers["x-user-region-code"] ?? null;

	return {
		ip: ip ?? "127.0.0.1",
		country: country?.toUpperCase() ?? null,
		countryCode: country?.toUpperCase() ?? null, // Often the same as country in CF
		region,
		regionCode,
		city,
		latitude,
		longitude,
		timezone,
		locale,
		continent,
		postalCode,
	};
}
