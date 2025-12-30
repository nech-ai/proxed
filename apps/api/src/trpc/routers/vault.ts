import { vaultObjects, projects } from "@proxed/db/schema";
import { and, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, teamProcedure } from "../init";
import { mapVaultObject } from "../mappers";
import { createAdminClient } from "../../services/supabase";
import { TRPCError } from "@trpc/server";

const filterSchema = z
	.object({
		start: z.string().optional(),
		end: z.string().optional(),
		projectId: z.string().optional(),
		mimeTypePrefix: z.string().optional(),
	})
	.optional();

function normalizeVaultPath(path: string) {
	const trimmed = path.replace(/^\/+/, "");
	return trimmed.startsWith("vault/")
		? trimmed.slice("vault/".length)
		: trimmed;
}

function decodePathSegment(segment: string) {
	try {
		return decodeURIComponent(segment);
	} catch {
		return null;
	}
}

function normalizeAndValidateVaultPath(path: string) {
	const normalized = normalizeVaultPath(path);

	if (!normalized || normalized.includes("\\") || normalized.includes("\0")) {
		throw new TRPCError({ code: "FORBIDDEN", message: "Invalid vault path" });
	}

	const segments = normalized.split("/");
	const decodedSegments = segments.map((segment) => {
		if (!segment || segment === "." || segment === "..") {
			throw new TRPCError({ code: "FORBIDDEN", message: "Invalid vault path" });
		}

		const decoded = decodePathSegment(segment);
		if (
			!decoded ||
			decoded === "." ||
			decoded === ".." ||
			decoded.includes("/") ||
			decoded.includes("\\")
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Invalid vault path" });
		}

		return decoded;
	});

	return { normalized, decodedSegments };
}

function ensureTeamPath(path: string, teamId: string) {
	const { normalized, decodedSegments } = normalizeAndValidateVaultPath(path);
	const [teamSegment] = decodedSegments;
	if (!teamSegment || teamSegment !== teamId) {
		throw new TRPCError({ code: "FORBIDDEN", message: "Invalid vault path" });
	}
	return normalized;
}

export const vaultRouter = createTRPCRouter({
	list: teamProcedure
		.input(
			z.object({
				cursor: z.string().optional(),
				pageSize: z.number().int().positive().optional(),
				searchQuery: z.string().optional(),
				filter: filterSchema,
				signedUrlExpiresIn: z.number().int().positive().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const pageSize = input.pageSize ?? 30;
			const offset = input.cursor ? Number.parseInt(input.cursor, 10) : 0;
			const conditions = [eq(vaultObjects.teamId, ctx.teamId)];

			if (input.filter?.start) {
				const start = new Date(input.filter.start);
				if (!Number.isNaN(start.getTime())) {
					conditions.push(gte(vaultObjects.createdAt, start.toISOString()));
				}
			}

			if (input.filter?.end) {
				const end = new Date(input.filter.end);
				if (!Number.isNaN(end.getTime())) {
					conditions.push(lte(vaultObjects.createdAt, end.toISOString()));
				}
			}

			if (input.filter?.projectId) {
				conditions.push(eq(vaultObjects.projectId, input.filter.projectId));
			}

			if (input.filter?.mimeTypePrefix) {
				conditions.push(
					ilike(vaultObjects.mimeType, `${input.filter.mimeTypePrefix}%`),
				);
			}

			if (input.searchQuery) {
				const query = `%${input.searchQuery}%`;
				conditions.push(
					or(
						ilike(projects.name, query),
						ilike(sql`array_to_string(${vaultObjects.pathTokens}, '/')`, query),
					),
				);
			}

			const whereClause =
				conditions.length > 1 ? and(...conditions) : conditions[0];

			const [countRow] = await ctx.db
				.select({ count: sql<number>`count(*)` })
				.from(vaultObjects)
				.leftJoin(projects, eq(vaultObjects.projectId, projects.id))
				.where(whereClause);

			const rows = await ctx.db
				.select({
					vault: vaultObjects,
					project: projects,
				})
				.from(vaultObjects)
				.leftJoin(projects, eq(vaultObjects.projectId, projects.id))
				.where(whereClause)
				.orderBy(desc(vaultObjects.createdAt))
				.limit(pageSize)
				.offset(offset);

			const hasNextPage = rows.length === pageSize;
			const nextCursor = hasNextPage
				? (offset + pageSize).toString()
				: undefined;

			const supabase = createAdminClient();
			const expiresIn = input.signedUrlExpiresIn ?? 600;

			const data = await Promise.all(
				rows.map(async (row) => {
					const path = row.vault.pathTokens.join("/");
					const { data } = await supabase.storage
						.from(row.vault.bucket)
						.createSignedUrl(path, expiresIn);
					return {
						...mapVaultObject(row.vault, row.project),
						path,
						url: data?.signedUrl ?? null,
					};
				}),
			);

			return {
				meta: {
					cursor: nextCursor,
					hasNextPage,
					hasPreviousPage: offset > 0,
					count: countRow?.count ?? 0,
				},
				data,
			};
		}),

	signedUrl: teamProcedure
		.input(
			z.object({
				path: z.string().min(1),
				expiresIn: z.number().int().positive().optional(),
				download: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const supabase = createAdminClient();
			const expiresIn = input.expiresIn ?? 600;
			const path = ensureTeamPath(input.path, ctx.teamId);

			const { data } = await supabase.storage
				.from("vault")
				.createSignedUrl(path, expiresIn, {
					download: input.download ?? false,
				});

			return {
				path,
				url: data?.signedUrl ?? null,
			};
		}),

	signedUrls: teamProcedure
		.input(
			z.object({
				paths: z.array(z.string().min(1)).min(1),
				expiresIn: z.number().int().positive().optional(),
				download: z.boolean().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const supabase = createAdminClient();
			const expiresIn = input.expiresIn ?? 600;

			const results = await Promise.all(
				input.paths.map(async (rawPath) => {
					const path = ensureTeamPath(rawPath, ctx.teamId);
					const { data } = await supabase.storage
						.from("vault")
						.createSignedUrl(path, expiresIn, {
							download: input.download ?? false,
						});
					return {
						path,
						url: data?.signedUrl ?? null,
					};
				}),
			);

			return results;
		}),

	delete: ownerProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select({ vault: vaultObjects })
				.from(vaultObjects)
				.where(
					and(
						eq(vaultObjects.id, input.id),
						eq(vaultObjects.teamId, ctx.teamId),
					),
				)
				.limit(1);

			if (!row?.vault) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Vault item not found",
				});
			}

			const supabase = createAdminClient();
			await supabase.storage
				.from(row.vault.bucket)
				.remove([row.vault.pathTokens.join("/")]);

			await ctx.db
				.delete(vaultObjects)
				.where(eq(vaultObjects.id, row.vault.id));

			return { id: row.vault.id };
		}),
});
