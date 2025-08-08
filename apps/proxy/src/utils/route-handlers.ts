import type { Context } from "hono";
import type { Context as AppContext, FinishReason } from "../rest/types";
import { createError, ErrorCode } from "./errors";
import { getProjectQuery } from "../db/queries/projects";
import { createExecution } from "../db/queries/executions";
import { getServerKey } from "../db/queries/server-keys";
import { reassembleKey } from "@proxed/utils/lib/partial-keys";
import { logger } from "./logger";
import { getCommonExecutionParams } from "./execution-params";
import { checkAndNotifyRateLimit } from "./rate-limit";
import type { z } from "zod";
import { formatCostsForDB } from "@proxed/utils/lib/pricing";

export interface RouteHandlerConfig {
	requireApiKey?: boolean;
	validateProjectId?: boolean;
	maxRequestSize?: number;
}

export interface ExecutionMetrics {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
	finishReason: FinishReason;
	response?: any;
	error?: {
		message: string;
		code: string;
	};
}

/**
 * Validates and retrieves project configuration
 */
export async function validateAndGetProject(
	c: Context<AppContext>,
	config: RouteHandlerConfig = {},
) {
	const { projectId, teamId, apiKey } = c.get("session");
	const db = c.get("db");

	if (!db) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Database connection not available",
		);
	}

	if (!projectId) {
		throw createError(ErrorCode.MISSING_PROJECT_ID, "Project ID is required");
	}

	if (config.requireApiKey && !apiKey) {
		throw createError(ErrorCode.UNAUTHORIZED, "API key is required");
	}

	const project = await getProjectQuery(db, projectId);

	if (!project) {
		throw createError(
			ErrorCode.PROJECT_NOT_FOUND,
			`Project ${projectId} not found`,
		);
	}

	if (!project.isActive) {
		throw createError(ErrorCode.FORBIDDEN, "Project is not active");
	}

	if (!project.key) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Project has no associated API key",
		);
	}

	return { project, teamId, apiKey, db };
}

/**
 * Retrieves and assembles the full API key
 */
export async function getFullApiKey(
	db: any,
	keyId: string,
	partialApiKey: string,
): Promise<string> {
	const serverKey = await getServerKey(db, keyId);

	if (!serverKey) {
		throw createError(
			ErrorCode.INTERNAL_ERROR,
			"Failed to retrieve server key",
		);
	}

	const [fullApiKey] = reassembleKey(serverKey, partialApiKey).split(".");
	return fullApiKey;
}

/**
 * Validates request body with schema
 */
export async function validateRequestBody<T>(
	c: Context<AppContext>,
	schema: z.ZodSchema<T>,
): Promise<T> {
	const contentType = c.req.header("content-type");
	if (!contentType || !contentType.includes("application/json")) {
		throw createError(
			ErrorCode.BAD_REQUEST,
			"Content-Type must be application/json",
		);
	}

	let bodyData: unknown;
	try {
		bodyData = await c.req.json();
	} catch (err) {
		throw createError(ErrorCode.BAD_REQUEST, "Invalid JSON payload");
	}

	const result = schema.safeParse(bodyData);
	if (!result.success) {
		throw createError(ErrorCode.VALIDATION_ERROR, "Request validation failed", {
			details: result.error.flatten(),
		});
	}

	return result.data;
}

/**
 * Records execution with proper error handling
 */
export async function recordExecution(
	c: Context<AppContext>,
	startTime: number,
	metrics: ExecutionMetrics,
	projectData: {
		project: any;
		teamId: string;
	},
	options?: {
		overrideCosts?: {
			promptCost: string;
			completionCost: string;
			totalCost: string;
		};
		overrideModel?: string;
	},
) {
	const db = c.get("db");
	const geo = c.get("geo");
	const userAgent = c.req.header("user-agent");
	const latency = Date.now() - startTime;

	const modelForExecution = options?.overrideModel ?? projectData.project.model;

	const commonParams = getCommonExecutionParams({
		teamId: projectData.teamId,
		projectId: projectData.project.id,
		deviceCheckId: projectData.project.deviceCheckId,
		keyId: projectData.project.keyId,
		ip: geo.ip ?? undefined,
		userAgent,
		model: modelForExecution,
		provider: projectData.project.key.provider,
		geo,
	});

	// Calculate costs if we have a model
	let costs = options?.overrideCosts ?? {
		promptCost: "0",
		completionCost: "0",
		totalCost: "0",
	};

	if (
		!options?.overrideCosts &&
		modelForExecution &&
		projectData.project.key?.provider
	) {
		try {
			costs = formatCostsForDB({
				provider: projectData.project.key.provider,
				model: modelForExecution,
				promptTokens: metrics.promptTokens,
				completionTokens: metrics.completionTokens,
			});
		} catch (error) {
			logger.error("Failed to calculate costs:", {
				error: error instanceof Error ? error.message : error,
				model: modelForExecution,
				provider: projectData.project.key.provider,
				tokens: {
					prompt: metrics.promptTokens,
					completion: metrics.completionTokens,
				},
			});
		}
	}

	try {
		await createExecution(db, {
			...commonParams,
			promptTokens: metrics.promptTokens,
			completionTokens: metrics.completionTokens,
			totalTokens: metrics.totalTokens,
			finishReason: metrics.finishReason,
			latency,
			responseCode: metrics.error ? 500 : 200,
			response: metrics.response ? JSON.stringify(metrics.response) : undefined,
			errorMessage: metrics.error?.message,
			errorCode: metrics.error?.code,
			promptCost: costs.promptCost,
			completionCost: costs.completionCost,
			totalCost: costs.totalCost,
		});

		// Non-blocking rate limit check
		if (!metrics.error) {
			checkAndNotifyRateLimit({
				c,
				db,
				projectId: projectData.project.id,
				teamId: projectData.teamId,
				projectName: projectData.project.name,
			});
		}
	} catch (error) {
		logger.error("Failed to record execution:", error);
		// Don't throw - this is a non-critical operation
	}
}

/**
 * Creates a safe execution wrapper with timeout
 */
export function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage = "Operation timed out",
): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
		),
	]);
}
