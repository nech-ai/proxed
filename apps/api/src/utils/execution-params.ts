import type { CommonExecutionParams } from "../rest/types";
import type { GeoContext } from "./geo";

/**
 * Formats common execution parameters for tracking model usage
 */
export function getCommonExecutionParams({
	teamId,
	projectId,
	deviceCheckId,
	keyId,
	ip,
	userAgent,
	model,
	provider,
	geo,
}: Omit<
	CommonExecutionParams,
	"countryCode" | "regionCode" | "city" | "longitude" | "latitude"
> & {
	geo?: GeoContext | null;
}): CommonExecutionParams {
	return {
		teamId,
		projectId,
		deviceCheckId,
		keyId,
		ip: ip ?? geo?.ip ?? undefined,
		userAgent: userAgent ?? undefined,
		model,
		provider,
		countryCode: geo?.countryCode ?? null,
		regionCode: geo?.regionCode ?? null,
		city: geo?.city ?? null,
		longitude: geo?.longitude ?? null,
		latitude: geo?.latitude ?? null,
	};
}
