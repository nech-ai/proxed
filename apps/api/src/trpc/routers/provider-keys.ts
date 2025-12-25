import { providerKeys, serverKeysInPrivate } from "@proxed/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, ownerProcedure, teamProcedure } from "../init";
import { mapProviderKey } from "../mappers";

export const providerKeysRouter = createTRPCRouter({
	list: teamProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db
			.select()
			.from(providerKeys)
			.where(eq(providerKeys.teamId, ctx.teamId))
			.orderBy(providerKeys.createdAt);

		return rows.map((row) => mapProviderKey(row));
	}),

	byId: teamProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select()
				.from(providerKeys)
				.where(eq(providerKeys.id, input.id))
				.limit(1);

			if (!row || row.teamId !== ctx.teamId) {
				return null;
			}

			return mapProviderKey(row);
		}),

	create: ownerProcedure
		.input(
			z.object({
				displayName: z.string().min(2),
				partialKeyServer: z.string().min(1),
				provider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const created = await ctx.db.transaction(async (tx) => {
				const [providerKey] = await tx
					.insert(providerKeys)
					.values({
						teamId: ctx.teamId,
						provider: input.provider,
						displayName: input.displayName,
					})
					.returning();

				if (!providerKey) return null;

				await tx.insert(serverKeysInPrivate).values({
					providerKeyId: providerKey.id,
					keyValue: input.partialKeyServer,
				});

				return providerKey;
			});

			return created ? mapProviderKey(created) : null;
		}),

	delete: ownerProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(providerKeys).where(eq(providerKeys.id, input.id));

			return { ok: true };
		}),
});
