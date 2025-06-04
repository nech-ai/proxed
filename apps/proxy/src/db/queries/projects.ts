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
			model: projects.model,
			systemPrompt: projects.systemPrompt,
			defaultUserPrompt: projects.defaultUserPrompt,
			schemaConfig: projects.schemaConfig,
			isActive: projects.isActive,
			description: projects.description,
			bundleId: projects.bundleId,
			iconUrl: projects.iconUrl,
			deviceCheck: deviceChecks,
			key: providerKeys,
		})
		.from(projects)
		.leftJoin(deviceChecks, eq(projects.deviceCheckId, deviceChecks.id))
		.leftJoin(providerKeys, eq(projects.keyId, providerKeys.id))
		.where(eq(projects.id, projectId))
		.limit(1);

	return result;
}
