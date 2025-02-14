import countries from "./country-info";
import regions from "./regions.json";

export function getLocationInfo(
	countryCode: string | null,
	regionCode: string | null,
) {
	const countryInfo = countries[countryCode as keyof typeof countries] || {
		name: "Unknown",
		code: "UNK",
		emoji: "🌍",
	};
	const regionInfo =
		(regions as Record<string, Record<string, string>>)[countryCode]?.[
			regionCode
		] || "Unknown";

	return {
		country: countryInfo.name,
		flag: countryInfo.emoji,
		countryCode: countryCode,
		regionCode: regionCode,
		region: regionInfo,
	};
}
