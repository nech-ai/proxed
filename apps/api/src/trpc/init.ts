import type { Database } from "@proxed/db/client";
import { connectDb } from "@proxed/db/client";
import { teamMemberships, users } from "@proxed/db/schema";
import { logger } from "../utils/logger";
import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import superjson from "superjson";
import { verifyAccessToken } from "../utils/auth";

type AuthedUser = {
	id: string;
	email: string | null;
	fullName: string | null;
};

export type TRPCContext = {
	user: AuthedUser | null;
	db: Database;
	teamId: string | null;
	teamRole: "OWNER" | "MEMBER" | null;
};

function getAccessTokenFromAuthHeader(value: string | undefined) {
	if (!value) return null;
	if (!value.startsWith("Bearer ")) return null;
	return value.slice("Bearer ".length);
}

export async function createTRPCContext(
	_: unknown,
	c: Context,
): Promise<TRPCContext> {
	const db = await connectDb();
	const accessToken = getAccessTokenFromAuthHeader(
		c.req.header("Authorization"),
	);

	if (!accessToken) {
		return { user: null, db, teamId: null, teamRole: null };
	}

	const session = await verifyAccessToken(accessToken);
	if (!session?.user?.id) {
		return { user: null, db, teamId: null, teamRole: null };
	}

	const [userRow] = await db
		.select()
		.from(users)
		.where(eq(users.id, session.user.id))
		.limit(1);

	const teamId = userRow?.teamId ?? null;
	let teamRole: "OWNER" | "MEMBER" | null = null;

	if (teamId) {
		const [membership] = await db
			.select()
			.from(teamMemberships)
			.where(
				and(
					eq(teamMemberships.userId, session.user.id),
					eq(teamMemberships.teamId, teamId),
				),
			)
			.limit(1);

		teamRole = membership?.role ?? null;
	}

	return {
		user: {
			id: session.user.id,
			email: session.user.email ?? null,
			fullName: session.user.full_name ?? null,
		},
		db,
		teamId,
		teamRole,
	};
}

const t = initTRPC.context<TRPCContext>().create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const loggingMiddleware = t.middleware(
	async ({ ctx, type, path, input, next }) => {
		const startedAt = Date.now();

		const result = await next();

		const durationMs = Date.now() - startedAt;
		const logData = {
			type,
			path,
			durationMs,
			userId: ctx.user?.id ?? null,
			teamId: ctx.teamId ?? null,
			input: input ?? null,
			ok: result.ok,
		};

		if (result.ok) {
			logger.info(logData, "tRPC request");
		} else {
			const error = (result as { error?: unknown }).error;
			logger.warn({ ...logData, error }, "tRPC request failed");
		}

		return result;
	},
);

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	});
});

export const teamProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (!ctx.teamId || !ctx.teamRole) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "No team membership",
		});
	}

	return next({
		ctx: {
			...ctx,
			teamId: ctx.teamId,
			teamRole: ctx.teamRole,
		},
	});
});

export const ownerProcedure = teamProcedure.use(async ({ ctx, next }) => {
	if (ctx.teamRole !== "OWNER") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Owner role required",
		});
	}

	return next({
		ctx: {
			...ctx,
			teamRole: ctx.teamRole,
		},
	});
});
