import type { Database } from "../index";
import { executions } from "../schema";

// Define types based on the schema
type FinishReason =
	| "stop"
	| "length"
	| "content-filter"
	| "tool-calls"
	| "error"
	| "other"
	| "unknown";
type ProviderType = "OPENAI" | "ANTHROPIC";

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
) {
	const totalTokens =
		params.totalTokens || params.promptTokens + params.completionTokens;

	const [execution] = await db
		.insert(executions)
		.values({
			teamId: params.teamId,
			projectId: params.projectId,
			deviceCheckId: params.deviceCheckId,
			keyId: params.keyId,
			ip: params.ip,
			userAgent: params.userAgent,
			model: params.model,
			provider: params.provider,
			promptTokens: params.promptTokens,
			completionTokens: params.completionTokens,
			totalTokens,
			finishReason: params.finishReason,
			latency: params.latency,
			responseCode: params.responseCode,
			promptCost: params.promptCost || "0",
			completionCost: params.completionCost || "0",
			totalCost: params.totalCost || "0",
			prompt: params.prompt,
			response: params.response,
			errorMessage: params.errorMessage,
			errorCode: params.errorCode,
			countryCode: params.countryCode,
			regionCode: params.regionCode,
			city: params.city,
			longitude: params.longitude,
			latitude: params.latitude,
		})
		.returning();

	return execution;
}
