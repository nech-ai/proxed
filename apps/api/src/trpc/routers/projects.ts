import { deviceChecks, projects, providerKeys } from "@proxed/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, teamProcedure } from "../init";
import { mapProject } from "../mappers";

const sortSchema = z
	.tuple([
		z.enum([
			"name",
			"description",
			"bundleId",
			"deviceCheck",
			"key",
			"isActive",
			"testMode",
			"createdAt",
		]),
		z.enum(["asc", "desc"]),
	])
	.optional();

const filterSchema = z
	.object({
		start: z.string().optional(),
		end: z.string().optional(),
		deviceCheckId: z.string().optional(),
		keyId: z.string().optional(),
		bundleId: z.string().optional(),
	})
	.optional();

export const projectsRouter = createTRPCRouter({
	list: teamProcedure
		.input(
			z.object({
				cursor: z.string().optional(),
				pageSize: z.number().int().positive().optional(),
				sort: sortSchema,
				searchQuery: z.string().optional(),
				filter: filterSchema,
			}),
		)
		.query(async ({ ctx, input }) => {
			const pageSize = input.pageSize ?? 50;
			const offset = input.cursor ? Number.parseInt(input.cursor, 10) : 0;

			const conditions = [eq(projects.teamId, ctx.teamId)];

			if (input.filter?.start) {
				const start = new Date(input.filter.start);
				if (!Number.isNaN(start.getTime())) {
					conditions.push(gte(projects.createdAt, start.toISOString()));
				}
			}

			if (input.filter?.end) {
				const end = new Date(input.filter.end);
				if (!Number.isNaN(end.getTime())) {
					conditions.push(lte(projects.createdAt, end.toISOString()));
				}
			}

			if (input.filter?.deviceCheckId) {
				conditions.push(eq(projects.deviceCheckId, input.filter.deviceCheckId));
			}

			if (input.filter?.keyId) {
				conditions.push(eq(projects.keyId, input.filter.keyId));
			}

			if (input.filter?.bundleId) {
				conditions.push(eq(projects.bundleId, input.filter.bundleId));
			}

			if (input.searchQuery) {
				const query = `%${input.searchQuery}%`;
				conditions.push(
					or(
						ilike(projects.name, query),
						ilike(projects.description, query),
						ilike(projects.bundleId, query),
					),
				);
			}

			const whereClause =
				conditions.length > 1 ? and(...conditions) : conditions[0];

			const [countRow] = await ctx.db
				.select({ count: sql<number>`count(*)` })
				.from(projects)
				.where(whereClause);

			const [sortColumn, sortDirection] = input.sort ?? ["createdAt", "desc"];
			const order = sortDirection === "asc" ? asc : desc;

			const rows = await ctx.db
				.select({
					project: projects,
					deviceCheck: deviceChecks,
					key: providerKeys,
				})
				.from(projects)
				.leftJoin(deviceChecks, eq(projects.deviceCheckId, deviceChecks.id))
				.leftJoin(providerKeys, eq(projects.keyId, providerKeys.id))
				.where(whereClause)
				.orderBy(
					sortColumn === "deviceCheck"
						? order(deviceChecks.name)
						: sortColumn === "key"
							? order(providerKeys.displayName)
							: sortColumn === "bundleId"
								? order(projects.bundleId)
								: sortColumn === "isActive"
									? order(projects.isActive)
									: sortColumn === "testMode"
										? order(projects.testMode)
										: sortColumn === "description"
											? order(projects.description)
											: sortColumn === "createdAt"
												? order(projects.createdAt)
												: order(projects.name),
				)
				.limit(pageSize)
				.offset(offset);

			const hasNextPage = rows.length === pageSize;
			const nextCursor = hasNextPage
				? (offset + pageSize).toString()
				: undefined;

			return {
				meta: {
					cursor: nextCursor,
					hasNextPage,
					hasPreviousPage: offset > 0,
					count: countRow?.count ?? 0,
				},
				data: rows.map((row) =>
					mapProject(row.project, row.deviceCheck, row.key),
				),
			};
		}),

	byId: teamProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select({
					project: projects,
					deviceCheck: deviceChecks,
					key: providerKeys,
				})
				.from(projects)
				.leftJoin(deviceChecks, eq(projects.deviceCheckId, deviceChecks.id))
				.leftJoin(providerKeys, eq(projects.keyId, providerKeys.id))
				.where(eq(projects.id, input.id))
				.limit(1);

			if (!row || row.project.teamId !== ctx.teamId) {
				return null;
			}

			return mapProject(row.project, row.deviceCheck, row.key);
		}),

	create: ownerProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional().default(""),
				bundleId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [created] = await ctx.db
				.insert(projects)
				.values({
					name: input.name,
					description: input.description ?? "",
					bundleId: input.bundleId,
					teamId: ctx.teamId,
					schemaConfig: {},
				})
				.returning();

			if (!created) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create project",
				});
			}

			return mapProject(created, null, null);
		}),

	update: ownerProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(2).optional(),
				description: z.string().optional(),
				bundleId: z.string().optional(),
				deviceCheckId: z.string().nullish(),
				keyId: z.string().nullish(),
				systemPrompt: z.string().optional(),
				defaultUserPrompt: z.string().optional(),
				model: z.string().optional(),
				notificationThreshold: z.number().int().positive().nullish(),
				notificationIntervalSeconds: z.number().int().positive().nullish(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const payload: Partial<typeof projects.$inferInsert> = {};

			if (input.name !== undefined) payload.name = input.name;
			if (input.description !== undefined)
				payload.description = input.description;
			if (input.bundleId !== undefined) payload.bundleId = input.bundleId;
			if (input.deviceCheckId !== undefined)
				payload.deviceCheckId = input.deviceCheckId || null;
			if (input.keyId !== undefined) payload.keyId = input.keyId || null;
			if (input.systemPrompt !== undefined)
				payload.systemPrompt = input.systemPrompt;
			if (input.defaultUserPrompt !== undefined)
				payload.defaultUserPrompt = input.defaultUserPrompt;
			if (input.model !== undefined) payload.model = input.model;
			if (input.notificationThreshold !== undefined)
				payload.notificationThreshold = input.notificationThreshold ?? null;
			if (input.notificationIntervalSeconds !== undefined)
				payload.notificationIntervalSeconds =
					input.notificationIntervalSeconds ?? null;

			const [updated] = await ctx.db
				.update(projects)
				.set(payload)
				.where(eq(projects.id, input.id))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return mapProject(updated, null, null);
		}),

	updateSchema: ownerProcedure
		.input(
			z.object({
				projectId: z.string().uuid(),
				schemaConfig: z.any(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [updated] = await ctx.db
				.update(projects)
				.set({ schemaConfig: input.schemaConfig })
				.where(eq(projects.id, input.projectId))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return mapProject(updated, null, null);
		}),

	toggleTestMode: ownerProcedure
		.input(
			z.object({
				projectId: z.string().uuid(),
				testMode: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const testKey = input.testMode ? crypto.randomUUID() : null;

			const [updated] = await ctx.db
				.update(projects)
				.set({
					testMode: input.testMode,
					testKey,
				})
				.where(eq(projects.id, input.projectId))
				.returning();

			if (!updated) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return mapProject(updated, null, null);
		}),
});
