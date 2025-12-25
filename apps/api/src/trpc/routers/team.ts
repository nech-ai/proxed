import {
	projects,
	teamInvitations,
	teamMemberships,
	teams,
	users,
} from "@proxed/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
	createTRPCRouter,
	ownerProcedure,
	protectedProcedure,
	teamProcedure,
} from "../init";
import {
	mapTeam,
	mapTeamInvitation,
	mapTeamMembership,
	mapUser,
} from "../mappers";
import { sendEmail } from "@proxed/mail";
import { getBaseUrl } from "@proxed/utils";

const inviteSchema = z.object({
	email: z.string().email(),
	role: z.enum(["OWNER", "MEMBER"]),
});

export const teamRouter = createTRPCRouter({
	memberships: protectedProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select({
				membership: teamMemberships,
				team: teams,
				user: users,
			})
			.from(teamMemberships)
			.leftJoin(teams, eq(teamMemberships.teamId, teams.id))
			.leftJoin(users, eq(teamMemberships.userId, users.id))
			.where(eq(teamMemberships.userId, ctx.user.id))
			.orderBy(desc(teamMemberships.createdAt));

		return rows.map((row) =>
			mapTeamMembership(row.membership, row.team, row.user),
		);
	}),

	current: teamProcedure.query(async ({ ctx }) => {
		const [team] = await ctx.db
			.select()
			.from(teams)
			.where(eq(teams.id, ctx.teamId))
			.limit(1);

		if (!team) return null;

		return {
			...mapTeam(team),
			role: ctx.teamRole,
		};
	}),

	members: teamProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select({
				membership: teamMemberships,
				user: users,
				team: teams,
			})
			.from(teamMemberships)
			.innerJoin(users, eq(teamMemberships.userId, users.id))
			.innerJoin(teams, eq(teamMemberships.teamId, teams.id))
			.where(eq(teamMemberships.teamId, ctx.teamId))
			.orderBy(desc(teamMemberships.createdAt));

		return rows.map((row) =>
			mapTeamMembership(row.membership, row.team, row.user),
		);
	}),

	invites: teamProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select()
			.from(teamInvitations)
			.where(eq(teamInvitations.teamId, ctx.teamId))
			.orderBy(desc(teamInvitations.createdAt));

		return rows.map(mapTeamInvitation);
	}),

	invite: ownerProcedure
		.input(inviteSchema)
		.mutation(async ({ ctx, input }) => {
			const [existing] = await ctx.db
				.select()
				.from(teamInvitations)
				.where(
					and(
						eq(teamInvitations.teamId, ctx.teamId),
						eq(teamInvitations.email, input.email),
					),
				)
				.limit(1);

			if (existing) {
				return mapTeamInvitation(existing);
			}

			const [invite] = await ctx.db
				.insert(teamInvitations)
				.values({
					teamId: ctx.teamId,
					email: input.email,
					role: input.role,
					invitedById: ctx.user.id,
					createdAt: new Date().toISOString(),
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
				})
				.returning();

			if (!invite) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create invitation",
				});
			}

			await sendEmail({
				templateId: "teamInvitation",
				to: invite.email,
				context: {
					url: `${getBaseUrl()}/api/team/invitation/${invite.id}`,
					teamName:
						(
							await ctx.db
								.select({ name: teams.name })
								.from(teams)
								.where(eq(teams.id, ctx.teamId))
								.limit(1)
						)?.[0]?.name ?? "",
				},
			});

			return mapTeamInvitation(invite);
		}),

	inviteMany: ownerProcedure
		.input(
			z.object({
				invites: z.array(inviteSchema),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const created = [] as ReturnType<typeof mapTeamInvitation>[];

			for (const inviteInput of input.invites) {
				const [invite] = await ctx.db
					.insert(teamInvitations)
					.values({
						teamId: ctx.teamId,
						email: inviteInput.email,
						role: inviteInput.role,
						invitedById: ctx.user.id,
						createdAt: new Date().toISOString(),
						expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
					})
					.returning();

				if (!invite) continue;

				await sendEmail({
					templateId: "teamInvitation",
					to: invite.email,
					context: {
						url: `${getBaseUrl()}/api/team/invitation/${invite.id}`,
						teamName:
							(
								await ctx.db
									.select({ name: teams.name })
									.from(teams)
									.where(eq(teams.id, ctx.teamId))
									.limit(1)
							)?.[0]?.name ?? "",
					},
				});

				created.push(mapTeamInvitation(invite));
			}

			return created;
		}),

	deleteInvite: ownerProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(teamInvitations)
				.where(
					and(
						eq(teamInvitations.id, input.id),
						eq(teamInvitations.teamId, ctx.teamId),
					),
				);

			return { ok: true };
		}),

	acceptInvitation: protectedProcedure
		.input(z.object({ invitationId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const [invite] = await ctx.db
				.select()
				.from(teamInvitations)
				.where(eq(teamInvitations.id, input.invitationId))
				.limit(1);

			if (!invite) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (invite.email !== ctx.user.email) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invitation email does not match current user",
				});
			}

			await ctx.db.transaction(async (tx) => {
				await tx
					.insert(teamMemberships)
					.values({
						teamId: invite.teamId,
						userId: ctx.user.id,
						role: invite.role,
					})
					.onConflictDoNothing();

				await tx
					.update(users)
					.set({ teamId: invite.teamId })
					.where(eq(users.id, ctx.user.id));

				await tx
					.delete(teamInvitations)
					.where(eq(teamInvitations.id, invite.id));
			});

			return { ok: true, teamId: invite.teamId };
		}),

	switch: protectedProcedure
		.input(z.object({ teamId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const [membership] = await ctx.db
				.select()
				.from(teamMemberships)
				.where(
					and(
						eq(teamMemberships.userId, ctx.user.id),
						eq(teamMemberships.teamId, input.teamId),
					),
				)
				.limit(1);

			if (!membership) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of this team",
				});
			}

			const [updated] = await ctx.db
				.update(users)
				.set({ teamId: input.teamId })
				.where(eq(users.id, ctx.user.id))
				.returning();

			return updated ? mapUser(updated) : null;
		}),

	create: protectedProcedure
		.input(z.object({ name: z.string().min(2).max(64) }))
		.mutation(async ({ ctx, input }) => {
			const result = await ctx.db.transaction(async (tx) => {
				const [team] = await tx
					.insert(teams)
					.values({ name: input.name })
					.returning();

				if (!team) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create team",
					});
				}

				await tx.insert(teamMemberships).values({
					teamId: team.id,
					userId: ctx.user.id,
					role: "OWNER",
					isCreator: true,
				});

				await tx
					.update(users)
					.set({ teamId: team.id })
					.where(eq(users.id, ctx.user.id));

				return team;
			});

			return mapTeam(result);
		}),

	update: ownerProcedure
		.input(
			z.object({
				name: z.string().min(2).max(64).optional(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const payload: Partial<typeof teams.$inferInsert> = {};
			if (input.name !== undefined) payload.name = input.name;
			if (input.avatarUrl !== undefined) payload.avatarUrl = input.avatarUrl;

			const [updated] = await ctx.db
				.update(teams)
				.set(payload)
				.where(eq(teams.id, ctx.teamId))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return mapTeam(updated);
		}),

	delete: ownerProcedure
		.input(z.object({ teamId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			if (input.teamId !== ctx.teamId) {
				const [membership] = await ctx.db
					.select()
					.from(teamMemberships)
					.where(
						and(
							eq(teamMemberships.userId, ctx.user.id),
							eq(teamMemberships.teamId, input.teamId),
						),
					)
					.limit(1);

				if (!membership || membership.role !== "OWNER") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "You are not allowed to delete this team",
					});
				}
			}

			await ctx.db.delete(teams).where(eq(teams.id, input.teamId));

			return { ok: true };
		}),

	canChooseStarterPlan: teamProcedure.query(async ({ ctx }) => {
		const [{ count }] = await ctx.db
			.select({ count: sql<number>`count(*)` })
			.from(projects)
			.where(eq(projects.teamId, ctx.teamId));

		return (count ?? 0) < 2;
	}),

	billing: teamProcedure.query(async ({ ctx }) => {
		const [team] = await ctx.db
			.select({
				plan: teams.plan,
				email: teams.email,
				canceledAt: teams.canceledAt,
			})
			.from(teams)
			.where(eq(teams.id, ctx.teamId))
			.limit(1);

		if (!team) return null;

		const [limits] = await ctx.db.execute<{
			api_calls_limit: number | null;
			api_calls_used: number | null;
			api_calls_remaining: number | null;
			projects_limit: number | null;
			projects_count: number | null;
			is_canceled: boolean | null;
			plan: string | null;
		}>(sql`
			select * from get_team_limits_metrics(${ctx.teamId})
		`);

		return {
			plan: team.plan,
			email: team.email,
			canceledAt: team.canceledAt,
			limits: limits
				? {
						projectsLimit: limits.projects_limit,
						projectsCount: limits.projects_count,
						apiCallsLimit: limits.api_calls_limit,
						apiCallsUsed: limits.api_calls_used,
						apiCallsRemaining: limits.api_calls_remaining,
						isCanceled: limits.is_canceled,
						plan: limits.plan,
					}
				: {
						projectsLimit: null,
						projectsCount: 0,
						apiCallsLimit: null,
						apiCallsUsed: 0,
						apiCallsRemaining: 0,
						isCanceled: null,
						plan: team.plan,
					},
		};
	}),
});
