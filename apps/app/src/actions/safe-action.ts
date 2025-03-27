import { logger } from "@proxed/logger";
import { setupAnalytics } from "@proxed/analytics/server";
import { client as RedisClient } from "@proxed/kv";
import { getUser, getTeamBilling } from "@proxed/supabase/cached-queries";
import { createClient } from "@proxed/supabase/server";
import * as Sentry from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import {
	DEFAULT_SERVER_ERROR_MESSAGE,
	createSafeActionClient,
} from "next-safe-action";
import { headers } from "next/headers";
import { z } from "zod";

const ratelimit = new Ratelimit({
	limiter: Ratelimit.fixedWindow(10, "10s"),
	redis: RedisClient,
});

export const actionClient = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof Error) {
			return e.message;
		}

		return DEFAULT_SERVER_ERROR_MESSAGE;
	},
});

export const actionClientWithMeta = createSafeActionClient({
	handleServerError(e) {
		if (e instanceof Error) {
			return e.message;
		}

		return DEFAULT_SERVER_ERROR_MESSAGE;
	},
	defineMetadataSchema() {
		return z.object({
			name: z.string(),
			requiredFeature: z.string().optional(),
			track: z
				.object({
					event: z.string(),
					channel: z.string(),
				})
				.optional(),
		});
	},
});

export const authActionClient = actionClientWithMeta
	.use(async ({ next, clientInput, metadata }) => {
		const result = await next({ ctx: {} });

		if (process.env.NODE_ENV === "development") {
			logger.info(`Input -> ${JSON.stringify(clientInput)}`);
			logger.info(`Result -> ${JSON.stringify(result.data)}`);
			logger.info(`Metadata -> ${JSON.stringify(metadata)}`);

			return result;
		}

		return result;
	})
	.use(async ({ next, metadata }) => {
		const headersList = await headers();
		const ip = headersList.get("x-forwarded-for");

		const { success, remaining } = await ratelimit.limit(
			`${ip}-${metadata.name}`,
		);

		if (!success) {
			throw new Error("Too many requests");
		}

		return next({
			ctx: {
				ratelimit: {
					remaining,
				},
			},
		});
	})
	.use(async ({ next, metadata }) => {
		const user = await getUser();
		const supabase = await createClient();

		if (!user?.data) {
			throw new Error("Unauthorized");
		}

		const analytics = await setupAnalytics({
			userId: user.data.id,
			fullName: user.data.full_name,
		});

		if (metadata?.track) {
			analytics.track({
				event: metadata.track.event,
				channel: metadata.track.channel,
			});
		}

		return Sentry.withServerActionInstrumentation(metadata.name, async () => {
			return next({
				ctx: {
					supabase,
					analytics,
					user: user.data,
				},
			});
		});
	})
	.use(async ({ next, metadata }) => {
		if (!metadata.requiredFeature) {
			return next({ ctx: {} });
		}

		const { data: billing } = (await getTeamBilling()) ?? { data: null };
		if (!billing) {
			throw new Error("No billing information found");
		}

		const planWithBilling = billing.plan;
		if (!planWithBilling) {
			throw new Error("No plan information found");
		}

		const plan = planWithBilling.split("-")[0];
		const limits = billing.limits;

		switch (metadata.requiredFeature) {
			case "create_project":
				if (!limits) throw new Error("No limits information found");
				if (
					plan === "starter" &&
					limits.projects_count >= (limits.projects_limit || 0)
				) {
					throw new Error("Project limit reached for your current plan");
				}
				break;
			case "api_calls":
				if (!limits) throw new Error("No limits information found");
				if (
					limits.api_calls_limit &&
					limits.api_calls_used >= limits.api_calls_limit
				) {
					throw new Error("API calls limit reached for your current plan");
				}
				break;
			case "advanced_analytics":
				if (plan !== "ultimate") {
					throw new Error("Advanced analytics requires Ultimate plan");
				}
				break;
			case "advanced_rate_limiting":
				if (plan !== "pro" && plan !== "ultimate") {
					throw new Error(
						"Advanced rate limiting requires Pro or Ultimate plan",
					);
				}
				break;
			case "dedicated_support":
				if (plan !== "ultimate") {
					throw new Error("Dedicated support requires Ultimate plan");
				}
				break;
			default:
				throw new Error("Unknown feature check requested");
		}

		return next({ ctx: {} });
	});
