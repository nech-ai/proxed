import { headers } from "next/headers";
import { EU_COUNTRY_CODES } from "./eu-countries";
import regions from "./regions.json";

export async function getCountryCode() {
	const headersList = await headers();
	return headersList.get("x-vercel-ip-country") || "GB";
}

export async function getRegionCode() {
	const headersList = await headers();
	return headersList.get("x-vercel-ip-country-region") || "UNK";
}

export async function getCity() {
	const headersList = await headers();
	return headersList.get("x-vercel-ip-city") || "Unknown";
}

export async function getRegion() {
	const countryCode = await getCountryCode();
	const regionCode = await getRegionCode();
	const region = (regions as any)[countryCode]?.[regionCode] || "Unknown";
	return region || "Unknown";
}

export async function getTimezone() {
	const headersList = await headers();
	return headersList.get("x-vercel-ip-timezone") || "Europe/London";
}

export async function getLocale() {
	const headersList = await headers();
	return headersList.get("x-vercel-ip-locale") || "en-US";
}

export async function isEU() {
	const countryCode = await getCountryCode();

	if (countryCode && EU_COUNTRY_CODES.includes(countryCode)) {
		return true;
	}
	return false;
}
