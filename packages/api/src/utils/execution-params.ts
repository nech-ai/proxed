import { Headers } from "@proxed/location/constants";
import type { CommonExecutionParams } from "../types";

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
	c,
}: CommonExecutionParams) {
	return {
		team_id: teamId,
		project_id: projectId,
		device_check_id: deviceCheckId,
		key_id: keyId,
		ip,
		user_agent: userAgent ?? undefined,
		model,
		provider,
		country_code: c.req.header(Headers.CountryCode),
		region_code: c.req.header(Headers.RegionCode),
		city: c.req.header(Headers.City),
		longitude:
			Number.parseFloat(c.req.header(Headers.Longitude) ?? "0") || undefined,
		latitude:
			Number.parseFloat(c.req.header(Headers.Latitude) ?? "0") || undefined,
	};
}
