import { createClient } from "@proxed/supabase/api";
import type { Database as SupabaseDatabase } from "@proxed/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError, initTRPC } from "@trpc/server";
import type { Context } from "hono";
import superjson from "superjson";
import { connectDb } from "../db";
import type { Database } from "../db";
import { type Session, verifyAccessToken } from "../utils/auth";
import { getGeoContext } from "../utils/geo";
import { withPrimaryReadAfterWrite } from "./middleware/primary-read-after-write";
import { withTeamPermission } from "./middleware/team-permission";

type TRPCContext = {
	session: Session | null;
	supabase: SupabaseClient<SupabaseDatabase>;
	db: Database;
	geo: ReturnType<typeof getGeoContext>;
	teamId?: string;
};

export const createTRPCContext = async (
	_: unknown,
	c: Context,
): Promise<TRPCContext> => {
	const accessToken = c.req.header("Authorization")?.split(" ")[1];
	const session = await verifyAccessToken(accessToken);
	const supabase = await createClient(accessToken);
	const db = await connectDb(accessToken);
	const geo = getGeoContext(c.req);

	return {
		session,
		supabase,
		db,
		geo,
	};
};

const t = initTRPC.context<TRPCContext>().create({
	transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

const withTeamPermissionMiddleware = t.middleware(async (opts) => {
	return withTeamPermission({
		ctx: opts.ctx,
		next: opts.next,
	});
});

const withPrimaryReadAfterWriteMiddleware = t.middleware(async (opts) => {
	return withPrimaryReadAfterWrite(opts);
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure
	.use(withTeamPermissionMiddleware)
	.use(withPrimaryReadAfterWriteMiddleware)
	.use(async (opts) => {
		const { teamId, session } = opts.ctx;
		if (!session) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return opts.next({
			ctx: {
				teamId,
				session,
			},
		});
	});
