import { connectDb } from "../../db";
import type { MiddlewareHandler } from "hono";
import { logger } from "../../utils/logger";

// Cache the database connection promise to avoid reconnecting on every request
let dbConnectionPromise: Promise<any> | null = null;

/**
 * Database middleware that connects to the database and sets it on context
 * Now with connection reuse to improve performance
 */
export const withDatabase: MiddlewareHandler = async (c, next) => {
	try {
		// Reuse existing connection promise or create new one
		if (!dbConnectionPromise) {
			dbConnectionPromise = connectDb();
		}

		const db = await dbConnectionPromise;

		// Set database on context
		c.set("db", db);

		await next();
	} catch (error) {
		// Reset connection promise on error
		dbConnectionPromise = null;
		logger.error("Database connection error", { error });
		throw error;
	}
};
