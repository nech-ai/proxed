import { Headers } from "@proxed/location/constants";
import type { CommonExecutionParams } from "../rest/types";

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
	};
}
