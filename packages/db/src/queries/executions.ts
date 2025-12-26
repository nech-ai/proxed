import type { Database } from "../client";
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
