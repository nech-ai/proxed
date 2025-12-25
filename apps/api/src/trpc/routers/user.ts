import { teams, teamMemberships, users } from "@proxed/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";
import { and, eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { mapTeam, mapTeamMembership, mapUser } from "../mappers";
import { createAdminClient } from "../../services/supabase";

export const userRouter = createTRPCRouter({
	me: protectedProcedure.query(async ({ ctx }) => {
		const [row] = await ctx.db
			.select({
				user: users,
				team: teams,
			})
			.from(users)
			.leftJoin(teams, eq(users.teamId, teams.id))
			.where(eq(users.id, ctx.user.id))
			.limit(1);

		if (!row) return null;

		return {
			...mapUser(row.user),
			team: mapTeam(row.team ?? null),
		};
	}),

	membership: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.teamId) return null;

		const [row] = await ctx.db
			.select({
				membership: teamMemberships,
				team: teams,
				user: users,
			})
			.from(teamMemberships)
			.leftJoin(teams, eq(teamMemberships.teamId, teams.id))
			.leftJoin(users, eq(teamMemberships.userId, users.id))
			.where(
				and(
					eq(teamMemberships.userId, ctx.user.id),
					eq(teamMemberships.teamId, ctx.teamId),
				),
			)
			.limit(1);

		if (!row) return null;

		return mapTeamMembership(row.membership, row.team, row.user);
	}),

	update: protectedProcedure
		.input(
			z.object({
				fullName: z.string().min(2).max(32).optional(),
				email: z.string().email().optional(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updatePayload: Partial<typeof users.$inferInsert> = {};

			if (input.fullName !== undefined) {
				updatePayload.fullName = input.fullName;
			}
			if (input.avatarUrl !== undefined) {
				updatePayload.avatarUrl = input.avatarUrl;
			}
			if (input.email !== undefined) {
				updatePayload.email = input.email;
			}

			if (Object.keys(updatePayload).length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No fields to update",
				});
			}

			const [updated] = await ctx.db
				.update(users)
				.set(updatePayload)
				.where(eq(users.id, ctx.user.id))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			const admin = createAdminClient();
			if (input.fullName) {
				await admin.auth.admin.updateUserById(ctx.user.id, {
					user_metadata: {
						full_name: input.fullName,
					},
				});
			}
			if (input.email) {
				await admin.auth.admin.updateUserById(ctx.user.id, {
					email: input.email,
				});
			}

			return mapUser(updated);
		}),

	delete: protectedProcedure.mutation(async ({ ctx }) => {
		const memberships = await ctx.db
			.select({ teamId: teamMemberships.teamId })
			.from(teamMemberships)
			.where(eq(teamMemberships.userId, ctx.user.id))
			.groupBy(teamMemberships.teamId)
			.having(sql`count(*) = 1`);

		const teamIds = memberships.map((row) => row.teamId);
		if (teamIds.length) {
			await ctx.db.delete(teams).where(inArray(teams.id, teamIds));
		}

		await ctx.db.delete(users).where(eq(users.id, ctx.user.id));

		const admin = createAdminClient();
		await admin.auth.admin.deleteUser(ctx.user.id);

		return { ok: true };
	}),
});
