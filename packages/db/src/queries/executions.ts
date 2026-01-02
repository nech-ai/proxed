import type { Database } from "../client";
import { eq } from "drizzle-orm";
import { executions } from "../schema";
import type {
	ProviderValue as ProviderType,
	FinishReason,
} from "@proxed/utils/lib/providers";

export interface CreateExecutionParams {
	teamId: string;
	projectId: string;
	deviceCheckId?: string | null;
	keyId?: string | null;
	ip: string;
	userAgent?: string | null;
	model: string;
	provider: ProviderType;
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	finishReason: FinishReason;
	latency: number;
	responseCode: number;
	promptCost?: string;
	completionCost?: string;
	totalCost?: string;
	prompt?: string | null;
	response?: string | null;
	errorMessage?: string | null;
	errorCode?: string | null;
	countryCode?: string | null;
	regionCode?: string | null;
	city?: string | null;
	longitude?: number | null;
	latitude?: number | null;
}

export interface UpdateExecutionParams {
	id: string;
	model?: string;
	promptTokens?: number;
	completionTokens?: number;
	totalTokens?: number;
	finishReason?: FinishReason;
	response?: string | null;
	errorMessage?: string | null;
	errorCode?: string | null;
	promptCost?: string;
	completionCost?: string;
	totalCost?: string;
}

export async function createExecution(
	db: Database,
	params: CreateExecutionParams,
): Promise<typeof executions.$inferSelect> {
	try {
		// Validate required parameters
		if (!params.teamId || !params.projectId) {
			throw new Error(
				"teamId and projectId are required for execution tracking",
			);
		}

		// Validate numeric values
		const promptTokens = Math.max(0, params.promptTokens || 0);
		const completionTokens = Math.max(0, params.completionTokens || 0);
		const totalTokens = params.totalTokens || promptTokens + completionTokens;
		const latency = Math.max(0, params.latency || 0);

		// Truncate long strings to prevent database errors
		const truncateString = (
			str: string | null | undefined,
			maxLength: number,
		) => {
			if (!str) return str;
			return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
		};

		const [execution] = await db
			.insert(executions)
			.values({
				teamId: params.teamId,
				projectId: params.projectId,
				deviceCheckId: params.deviceCheckId,
				keyId: params.keyId,
				ip: params.ip || "unknown",
				userAgent: truncateString(params.userAgent, 500),
				model: params.model || "unknown",
				provider: params.provider,
				promptTokens,
				completionTokens,
				totalTokens,
				finishReason: params.finishReason,
				latency,
				responseCode: params.responseCode,
				promptCost: params.promptCost || "0",
				completionCost: params.completionCost || "0",
				totalCost: params.totalCost || "0",
				prompt: truncateString(params.prompt, 10000),
				response: truncateString(params.response, 10000),
				errorMessage: truncateString(params.errorMessage, 1000),
				errorCode: truncateString(params.errorCode, 100),
				countryCode: params.countryCode,
				regionCode: params.regionCode,
				city: truncateString(params.city, 100),
				longitude: params.longitude,
				latitude: params.latitude,
			})
			.returning();

		if (!execution) {
			throw new Error("Failed to create execution record");
		}

		return execution;
	} catch (error) {
		console.error("Failed to create execution:", {
			error: error instanceof Error ? error.message : error,
			teamId: params.teamId,
			projectId: params.projectId,
		});
		// Re-throw to let the caller handle it
		throw error;
	}
}

export async function updateExecution(
	db: Database,
	params: UpdateExecutionParams,
): Promise<typeof executions.$inferSelect | null> {
	try {
		const updates: Partial<typeof executions.$inferInsert> = {};

		const truncateString = (
			str: string | null | undefined,
			maxLength: number,
		) => {
			if (str === null || str === undefined) return str;
			return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
		};

		if (params.model) updates.model = params.model;
		if (params.finishReason) updates.finishReason = params.finishReason;

		const promptTokens =
			params.promptTokens !== undefined
				? Math.max(0, params.promptTokens || 0)
				: undefined;
		const completionTokens =
			params.completionTokens !== undefined
				? Math.max(0, params.completionTokens || 0)
				: undefined;
		const totalTokens =
			params.totalTokens !== undefined
				? Math.max(0, params.totalTokens || 0)
				: promptTokens !== undefined || completionTokens !== undefined
					? (promptTokens ?? 0) + (completionTokens ?? 0)
					: undefined;

		if (promptTokens !== undefined) updates.promptTokens = promptTokens;
		if (completionTokens !== undefined)
			updates.completionTokens = completionTokens;
		if (totalTokens !== undefined) updates.totalTokens = totalTokens;

		if (params.promptCost !== undefined) updates.promptCost = params.promptCost;
		if (params.completionCost !== undefined)
			updates.completionCost = params.completionCost;
		if (params.totalCost !== undefined) updates.totalCost = params.totalCost;

		if ("response" in params) {
			updates.response = truncateString(params.response, 10000);
		}
		if ("errorMessage" in params) {
			updates.errorMessage = truncateString(params.errorMessage, 1000);
		}
		if ("errorCode" in params) {
			updates.errorCode = truncateString(params.errorCode, 100);
		}

		if (Object.keys(updates).length === 0) {
			return null;
		}

		const [execution] = await db
			.update(executions)
			.set(updates)
			.where(eq(executions.id, params.id))
			.returning();

		return execution ?? null;
	} catch (error) {
		console.error("Failed to update execution:", {
			error: error instanceof Error ? error.message : error,
			id: params.id,
		});
		throw error;
	}
}
