import { sql } from "drizzle-orm";
import type { Database } from "../db";
import { client as RedisClient } from "@proxed/kv";
import { logger } from "./logger";

export interface HealthCheckResult {
	service: string;
	status: "healthy" | "degraded" | "unhealthy";
	responseTime?: number;
	error?: string;
	details?: Record<string, any>;
}

export interface SystemHealth {
	status: "healthy" | "degraded" | "unhealthy";
	timestamp: string;
	uptime: number;
	checks: HealthCheckResult[];
	version: string;
	environment: string;
	metrics?: {
		memory: {
			used: number;
			total: number;
			percentage: number;
		};
		cpu?: {
			usage: number;
		};
	};
}

/**
 * Check database health with timeout
 */
export async function checkDatabaseHealth(
	db: Database,
	timeout = 3000,
): Promise<HealthCheckResult> {
	const start = Date.now();

	try {
		await Promise.race([
			db.execute(sql`SELECT 1 as health_check`),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Database health check timeout")),
					timeout,
				),
			),
		]);

		return {
			service: "database",
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch (error) {
		logger.error("Database health check failed", { error });
		return {
			service: "database",
			status: "unhealthy",
			responseTime: Date.now() - start,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Check Redis health with timeout
 */
export async function checkRedisHealth(
	timeout = 3000,
): Promise<HealthCheckResult> {
	const start = Date.now();

	try {
		await Promise.race([
			RedisClient.ping(),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Redis health check timeout")),
					timeout,
				),
			),
		]);

		return {
			service: "redis",
			status: "healthy",
			responseTime: Date.now() - start,
		};
	} catch (error) {
		// If Redis is down, the service can still function (rate limiting degrades gracefully)
		logger.warn("Redis health check failed", { error });
		return {
			service: "redis",
			status: "degraded",
			responseTime: Date.now() - start,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Check external API health (e.g., OpenAI)
 */
export async function checkExternalAPIHealth(
	provider: "openai" | "anthropic",
	timeout = 5000,
): Promise<HealthCheckResult> {
	const start = Date.now();
	const urls = {
		openai: "https://api.openai.com/v1/models",
		anthropic: "https://api.anthropic.com/v1/messages",
	};

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		const response = await fetch(urls[provider], {
			method: "HEAD",
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		// We expect 401 (unauthorized) which means the API is up
		const isHealthy = response.status === 401 || response.status === 200;

		return {
			service: `${provider}-api`,
			status: isHealthy ? "healthy" : "degraded",
			responseTime: Date.now() - start,
			details: { statusCode: response.status },
		};
	} catch (error) {
		return {
			service: `${provider}-api`,
			status: "degraded",
			responseTime: Date.now() - start,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get system metrics
 */
function getSystemMetrics() {
	const memUsage = process.memoryUsage();
	const totalMem = memUsage.heapTotal;
	const usedMem = memUsage.heapUsed;

	return {
		memory: {
			used: Math.round(usedMem / 1024 / 1024), // MB
			total: Math.round(totalMem / 1024 / 1024), // MB
			percentage: Math.round((usedMem / totalMem) * 100),
		},
	};
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(
	db?: Database,
	startTime: number = Date.now(),
): Promise<SystemHealth> {
	const checks: HealthCheckResult[] = [];

	// Database check (if available)
	if (db) {
		checks.push(await checkDatabaseHealth(db));
	}

	// Redis check
	checks.push(await checkRedisHealth());

	// External API checks (run in parallel)
	const [openaiHealth, anthropicHealth] = await Promise.all([
		checkExternalAPIHealth("openai"),
		checkExternalAPIHealth("anthropic"),
	]);
	checks.push(openaiHealth, anthropicHealth);

	// Determine overall status
	const hasUnhealthy = checks.some((check) => check.status === "unhealthy");
	const hasDegraded = checks.some((check) => check.status === "degraded");

	let status: SystemHealth["status"] = "healthy";
	if (hasUnhealthy) {
		status = "unhealthy";
	} else if (hasDegraded) {
		status = "degraded";
	}

	return {
		status,
		timestamp: new Date().toISOString(),
		uptime: Date.now() - startTime,
		checks,
		version: process.env.npm_package_version || "unknown",
		environment: process.env.NODE_ENV || "development",
		metrics: getSystemMetrics(),
	};
}
