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
		headers["x-real-ip"] ??
		headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
		headers["x-client-ip"] ??
		null;

	// Cloudflare specific headers
	const country = headers["cf-ipcountry"] ?? headers["x-user-country"] ?? null;
	const region = headers["cf-region"] ?? headers["x-user-region"] ?? null;
	const city = headers["cf-ipcity"] ?? headers["x-user-city"] ?? null;
	const continent = headers["cf-ipcontinent"] ?? null;
	const latitude = headers["cf-iplat"]
		? Number.parseFloat(headers["cf-iplat"])
		: null;
	const longitude = headers["cf-iplon"]
		? Number.parseFloat(headers["cf-iplon"])
		: null;
	const timezone = headers["cf-timezone"] ?? headers["x-user-timezone"] ?? null;
	const postalCode = headers["cf-postal-code"] ?? null;

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
