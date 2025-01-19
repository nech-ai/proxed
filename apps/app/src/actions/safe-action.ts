import { logger } from "@proxed/logger";
import { getUser } from "@proxed/supabase/cached-queries";
import { createClient } from "@proxed/supabase/server";
import {
	DEFAULT_SERVER_ERROR_MESSAGE,
	createSafeActionClient,
} from "next-safe-action";

const handleServerError = (e: Error) => {
	console.error("Action error:", e.message);

	if (e instanceof Error) {
		return e.message;
	}

	return DEFAULT_SERVER_ERROR_MESSAGE;
};

export const actionClient = createSafeActionClient({
	handleServerError,
});

export const actionClientWithMeta = createSafeActionClient({
	handleServerError,
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

	.use(async ({ next }) => {
		const userData = await getUser();
		const user = userData?.data;
		const supabase = await createClient();

		if (!user) {
			throw new Error("Unauthorized");
		}

		return next({
			ctx: {
				supabase,
				user,
			},
		});
	});
