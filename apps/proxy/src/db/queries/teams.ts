import { eq, sql } from "drizzle-orm";
import type { Database } from "../index";
import { teams } from "../schema";

export async function getTeamLimitsMetricsQuery(db: Database, teamId: string) {
	// This is a simplified version - you'll need to implement the actual logic
	// based on your business rules for limits and metrics
	const result = await db
		.select({
			plan: teams.plan,
			apiCallsLimit: sql<number>`CASE
				WHEN ${teams.plan} = 'trial' THEN 100
				WHEN ${teams.plan} = 'pro' THEN 10000
				ELSE NULL
			END`,
			apiCallsUsed: sql<number>`0`, // You'd calculate this from executions table
			projectsLimit: sql<number>`CASE
				WHEN ${teams.plan} = 'trial' THEN 3
				WHEN ${teams.plan} = 'pro' THEN 100
				ELSE NULL
			END`,
			projectsCount: sql<number>`0`, // You'd calculate this from projects table
		})
		.from(teams)
		.where(eq(teams.id, teamId))
		.limit(1);

	if (!result[0]) {
		return null;
	}

	return {
		api_calls_limit: result[0].apiCallsLimit,
		api_calls_used: result[0].apiCallsUsed,
		api_calls_remaining: result[0].apiCallsLimit
			? result[0].apiCallsLimit - result[0].apiCallsUsed
			: null,
		projects_limit: result[0].projectsLimit,
		projects_count: result[0].projectsCount,
	};
}
