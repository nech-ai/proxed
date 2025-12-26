import { sendEmail } from "@proxed/mail";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const supportRouter = createTRPCRouter({
	feedback: protectedProcedure
		.input(z.object({ message: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			await sendEmail({
				to: "alex@proxed.ai",
				templateId: "feedback",
				context: {
					email: ctx.user.email ?? "",
					message: input.message,
				},
			});

			return { ok: true };
		}),

	support: protectedProcedure
		.input(
			z.object({
				subject: z.string().min(1),
				category: z.enum(["bug", "feature", "question", "other"]),
				priority: z.enum(["low", "medium", "high"]),
				message: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await sendEmail({
				to: "alex@proxed.ai",
				templateId: "support",
				context: {
					email: ctx.user.email ?? "",
					subject: input.subject,
					category: input.category,
					priority: input.priority,
					message: input.message,
				},
			});

			return { ok: true };
		}),
});
