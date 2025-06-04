import type { Database } from "../index";
import { deviceChecks, projects, providerKeys, users } from "../schema";
import { eq } from "drizzle-orm";

export async function getProjectQuery(db: Database, projectId: string) {
	const [result] = await db
		.select({
			id: projects.id,
			name: projects.name,
			teamId: projects.teamId,
			createdAt: projects.createdAt,
			testMode: projects.testMode,
			testKey: projects.testKey,
			deviceCheckId: projects.deviceCheckId,
			keyId: projects.keyId,
			deviceCheck: deviceChecks,
			key: providerKeys,
		})
		.from(projects)
		.fullJoin(deviceChecks, eq(projects.deviceCheckId, deviceChecks.id))
		.fullJoin(providerKeys, eq(projects.keyId, providerKeys.id))
		.where(eq(projects.id, projectId))
		.limit(1);

	return result;
}
