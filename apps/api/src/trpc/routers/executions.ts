import {
	deviceChecks,
	executions,
	projects,
	providerKeys,
} from "@proxed/db/schema";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, teamProcedure } from "../init";
import { mapExecution } from "../mappers";

const sortSchema = z
	.tuple([
		z.enum([
			"project",
			"deviceCheck",
			"key",
			"totalTokens",
			"totalCost",
			"finishReason",
			"latency",
			"createdAt",
			"model",
			"provider",
		]),
		z.enum(["asc", "desc"]),
	])
	.optional();

const filterSchema = z
	.object({
		start: z.string().optional(),
		end: z.string().optional(),
		projectId: z.string().optional(),
		deviceCheckId: z.string().optional(),
		keyId: z.string().optional(),
		provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE"]).optional(),
		model: z.string().optional(),
		finishReason: z
			.enum([
				"stop",
				"length",
				"content-filter",
				"tool-calls",
				"error",
				"other",
				"unknown",
			])
			.optional(),
	})
	.optional();

export const executionsRouter = createTRPCRouter({
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

			const conditions = [eq(executions.teamId, ctx.teamId)];

			if (input.filter?.start) {
				const start = new Date(input.filter.start);
				if (!Number.isNaN(start.getTime())) {
					conditions.push(gte(executions.createdAt, start.toISOString()));
				}
			}

			if (input.filter?.end) {
				const end = new Date(input.filter.end);
				if (!Number.isNaN(end.getTime())) {
					conditions.push(lte(executions.createdAt, end.toISOString()));
				}
			}

			if (input.filter?.projectId) {
				conditions.push(eq(executions.projectId, input.filter.projectId));
			}

			if (input.filter?.deviceCheckId) {
				conditions.push(
					eq(executions.deviceCheckId, input.filter.deviceCheckId),
				);
			}

			if (input.filter?.keyId) {
				conditions.push(eq(executions.keyId, input.filter.keyId));
			}

			if (input.filter?.provider) {
				conditions.push(eq(executions.provider, input.filter.provider));
			}

			if (input.filter?.model) {
				conditions.push(eq(executions.model, input.filter.model));
			}

			if (input.filter?.finishReason) {
				conditions.push(eq(executions.finishReason, input.filter.finishReason));
			}

			if (input.searchQuery) {
				const query = `%${input.searchQuery}%`;
				conditions.push(
					or(
						ilike(projects.name, query),
						ilike(projects.bundleId, query),
						ilike(executions.model, query),
						ilike(executions.errorMessage, query),
					),
				);
			}

			const whereClause =
				conditions.length > 1 ? and(...conditions) : conditions[0];

			const [countRow] = await ctx.db
				.select({ count: sql<number>`count(*)` })
				.from(executions)
				.leftJoin(projects, eq(executions.projectId, projects.id))
				.where(whereClause);

			const [sortColumn, sortDirection] = input.sort ?? ["createdAt", "desc"];
			const order = sortDirection === "asc" ? asc : desc;

			const rows = await ctx.db
				.select({
					execution: executions,
					project: projects,
					deviceCheck: deviceChecks,
					key: providerKeys,
				})
				.from(executions)
				.leftJoin(projects, eq(executions.projectId, projects.id))
				.leftJoin(deviceChecks, eq(executions.deviceCheckId, deviceChecks.id))
				.leftJoin(providerKeys, eq(executions.keyId, providerKeys.id))
				.where(whereClause)
				.orderBy(
					sortColumn === "project"
						? order(projects.name)
						: sortColumn === "deviceCheck"
							? order(deviceChecks.name)
							: sortColumn === "key"
								? order(providerKeys.displayName)
								: sortColumn === "totalTokens"
									? order(executions.totalTokens)
									: sortColumn === "totalCost"
										? order(executions.totalCost)
										: sortColumn === "finishReason"
											? order(executions.finishReason)
											: sortColumn === "latency"
												? order(executions.latency)
												: sortColumn === "createdAt"
													? order(executions.createdAt)
													: sortColumn === "model"
														? order(executions.model)
														: sortColumn === "provider"
															? order(executions.provider)
															: order(executions.createdAt),
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
					mapExecution(row.execution, row.project, row.deviceCheck, row.key),
				),
			};
		}),

	byId: teamProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select({
					execution: executions,
					project: projects,
					deviceCheck: deviceChecks,
					key: providerKeys,
				})
				.from(executions)
				.leftJoin(projects, eq(executions.projectId, projects.id))
				.leftJoin(deviceChecks, eq(executions.deviceCheckId, deviceChecks.id))
				.leftJoin(providerKeys, eq(executions.keyId, providerKeys.id))
				.where(eq(executions.id, input.id))
				.limit(1);

			if (!row || row.execution.teamId !== ctx.teamId) {
				return null;
			}

			return mapExecution(row.execution, row.project, row.deviceCheck, row.key);
		}),
});
