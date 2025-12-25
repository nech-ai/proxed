import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	getSubscriberPreferences,
	updateSubscriberPreference,
} from "@proxed/notifications";
import { createTRPCRouter, protectedProcedure, teamProcedure } from "../init";

type RawPreference = {
	template?: {
		_id?: string;
		name?: string;
	};
	preference?: {
		channels?: Record<string, boolean | null | undefined>;
	};
};

function mapChannelKey(key: string) {
	if (key === "in_app") return "inApp";
	return key;
}

function normalizePreferences(raw: unknown) {
	const list = Array.isArray(raw)
		? raw
		: Array.isArray((raw as { data?: unknown })?.data)
			? ((raw as { data?: unknown[] }).data ?? [])
			: Array.isArray(
						(raw as { data?: { preferences?: unknown[] } })?.data?.preferences,
					)
				? ((raw as { data?: { preferences?: unknown[] } })?.data?.preferences ??
					[])
				: [];

	return (list as RawPreference[]).map((item) => ({
		template: {
			id: item.template?._id ?? "",
			name: item.template?.name ?? "",
		},
		preference: {
			channels: Object.fromEntries(
				Object.entries(item.preference?.channels ?? {}).map(([key, value]) => [
					mapChannelKey(key),
					Boolean(value),
				]),
			),
		},
	}));
}

export const notificationsRouter = createTRPCRouter({
	preferences: teamProcedure.query(async ({ ctx }) => {
		if (!ctx.user || !ctx.teamId) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		const preferences = await getSubscriberPreferences({
			subscriberId: ctx.user.id,
			teamId: ctx.teamId,
		});

		return normalizePreferences(preferences);
	}),

	updatePreference: protectedProcedure
		.input(
			z.object({
				templateId: z.string(),
				type: z.enum(["inApp", "email"]),
				enabled: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (!ctx.teamId) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			const channelType = input.type === "inApp" ? "in_app" : input.type;

			return updateSubscriberPreference({
				subscriberId: ctx.user.id,
				teamId: ctx.teamId,
				templateId: input.templateId,
				type: channelType,
				enabled: input.enabled,
			});
		}),
});
