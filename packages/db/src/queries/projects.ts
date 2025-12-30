import type { Database } from "../client";
import { deviceChecks, projects, providerKeys } from "../schema";
import { eq, and } from "drizzle-orm";

export interface ProjectWithRelations {
	id: string;
	name: string;
	teamId: string;
	createdAt: string;
	testMode: boolean | null;
	testKey: string | null;
	deviceCheckId: string | null;
	keyId: string | null;
	model: string | null;
	systemPrompt: string | null;
	defaultUserPrompt: string | null;
	schemaConfig: unknown;
	isActive: boolean;
	description: string;
	bundleId: string;
	iconUrl: string | null;
	deviceCheck: typeof deviceChecks.$inferSelect | null;
	key: typeof providerKeys.$inferSelect | null;
	lastRateLimitNotifiedAt: string | null;
	notificationIntervalSeconds: number | null;
	notificationThreshold: number | null;
	saveImagesToVault: boolean;
}

export async function getProjectQuery(
	db: Database,
	projectId: string,
): Promise<ProjectWithRelations | null> {
	try {
		// Validate projectId format
		if (!projectId || typeof projectId !== "string") {
			console.warn(
				`Invalid project ID provided to getProjectQuery: projectId=${projectId}`,
			);
			return null;
		}

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
				lastRateLimitNotifiedAt: projects.lastRateLimitNotifiedAt,
				notificationIntervalSeconds: projects.notificationIntervalSeconds,
				notificationThreshold: projects.notificationThreshold,
				saveImagesToVault: projects.saveImagesToVault,
				deviceCheck: deviceChecks,
				key: providerKeys,
			})
			.from(projects)
			.leftJoin(deviceChecks, eq(projects.deviceCheckId, deviceChecks.id))
			.leftJoin(providerKeys, eq(projects.keyId, providerKeys.id))
			.where(eq(projects.id, projectId))
			.limit(1);

		return result || null;
	} catch (error) {
		console.error(
			`Failed to fetch project: ${error instanceof Error ? error.message : error}, projectId=${projectId}`,
		);
		throw new Error("Failed to fetch project configuration");
	}
}

export async function getActiveProjectWithProvider(
	db: Database,
	projectId: string,
): Promise<ProjectWithRelations | null> {
	try {
		const project = await getProjectQuery(db, projectId);

		if (!project) {
			return null;
		}

		// Validate project is active and has required configuration
		if (!project.isActive) {
			console.warn(
				`Attempted to access inactive project: projectId=${projectId}`,
			);
			return null;
		}

		if (!project.key || !project.keyId) {
			console.error(
				`Project missing provider key configuration: projectId=${projectId}`,
			);
			return null;
		}

		return project;
	} catch (error) {
		console.error(
			`Failed to fetch active project with provider: ${error instanceof Error ? error.message : error}, projectId=${projectId}`,
		);
		throw error;
	}
}
