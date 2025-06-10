import type { Database } from "../index";
import { deviceChecks } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getDeviceCheckById(db: Database, deviceCheckId: string) {
	try {
		const [result] = await db
			.select()
			.from(deviceChecks)
			.where(eq(deviceChecks.id, deviceCheckId))
			.limit(1);

		return result || null;
	} catch (error) {
		console.error("Failed to fetch device check:", error);
		throw new Error("Failed to fetch device check configuration");
	}
}

export async function getDeviceCheckByTeamAndAppleId(
	db: Database,
	teamId: string,
	appleTeamId: string,
) {
	try {
		const [result] = await db
			.select()
			.from(deviceChecks)
			.where(
				and(
					eq(deviceChecks.teamId, teamId),
					eq(deviceChecks.appleTeamId, appleTeamId),
				),
			)
			.limit(1);

		return result || null;
	} catch (error) {
		console.error("Failed to fetch device check by team:", error);
		throw new Error("Failed to fetch device check configuration");
	}
}
