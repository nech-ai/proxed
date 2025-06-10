import { eq, sql, and, gte } from "drizzle-orm";
import type { Database } from "../index";
import { teams, executions, projects } from "../schema";

export async function getTeamLimitsMetricsQuery(db: Database, teamId: string) {
	try {
		// Get team plan and calculate actual metrics
		const result = await db
			.select({
				plan: teams.plan,
				apiCallsLimit: sql<number>`CASE
				WHEN ${teams.plan} = 'trial' THEN 100
				WHEN ${teams.plan} = 'pro' THEN 10000
					WHEN ${teams.plan} = 'enterprise' THEN NULL
					ELSE 50
			END`,
				apiCallsUsed: sql<number>`(
					SELECT COUNT(*)::int
					FROM ${executions}
					WHERE ${executions.teamId} = ${teams.id}
					AND ${executions.createdAt} >= CURRENT_DATE - INTERVAL '30 days'
				)`,
				projectsLimit: sql<number>`CASE
				WHEN ${teams.plan} = 'trial' THEN 3
				WHEN ${teams.plan} = 'pro' THEN 100
					WHEN ${teams.plan} = 'enterprise' THEN NULL
					ELSE 1
			END`,
				projectsCount: sql<number>`(
					SELECT COUNT(*)::int
					FROM ${projects}
					WHERE ${projects.teamId} = ${teams.id}
					AND ${projects.isActive} = true
				)`,
				canceledAt: teams.canceledAt,
			})
			.from(teams)
			.where(eq(teams.id, teamId))
			.limit(1);

		if (!result[0]) {
			return null;
		}

		// Check if subscription is canceled
		const isCanceled = result[0].canceledAt !== null;

		return {
			api_calls_limit: result[0].apiCallsLimit,
			api_calls_used: result[0].apiCallsUsed,
			api_calls_remaining: result[0].apiCallsLimit
				? Math.max(0, result[0].apiCallsLimit - result[0].apiCallsUsed)
				: null,
			projects_limit: result[0].projectsLimit,
			projects_count: result[0].projectsCount,
			is_canceled: isCanceled,
			plan: result[0].plan,
		};
	} catch (error) {
		console.error("Failed to fetch team limits:", error);
		throw new Error("Failed to fetch team billing information");
	}
}
