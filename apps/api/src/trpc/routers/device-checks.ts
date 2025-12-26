import { deviceChecks } from "@proxed/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, teamProcedure } from "../init";
import { mapDeviceCheck } from "../mappers";

export const deviceChecksRouter = createTRPCRouter({
	list: teamProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select()
			.from(deviceChecks)
			.where(eq(deviceChecks.teamId, ctx.teamId))
			.orderBy(deviceChecks.createdAt);

		const [{ count }] = await ctx.db
			.select({ count: sql<number>`count(*)` })
			.from(deviceChecks)
			.where(eq(deviceChecks.teamId, ctx.teamId));

		return {
			meta: { count: count ?? 0 },
			data: rows.map((row) => mapDeviceCheck(row)),
		};
	}),

	create: ownerProcedure
		.input(
			z.object({
				name: z.string().min(2),
				keyId: z.string().min(1),
				privateKeyP8: z.string().min(1),
				appleTeamId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(deviceChecks)
				.values({
					teamId: ctx.teamId,
					name: input.name,
					keyId: input.keyId,
					privateKeyP8: input.privateKeyP8,
					appleTeamId: input.appleTeamId,
				})
				.returning();

			return created ? mapDeviceCheck(created) : null;
		}),

	delete: ownerProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(deviceChecks)
				.where(
					and(
						eq(deviceChecks.id, input.id),
						eq(deviceChecks.teamId, ctx.teamId),
					),
				);

			return { ok: true };
		}),
});
