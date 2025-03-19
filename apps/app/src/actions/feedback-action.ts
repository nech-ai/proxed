"use server";

import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { feedbackSchema } from "./schema";
import { redirect } from "next/navigation";
import { sendEmail } from "@proxed/mail";

export const feedbackAction = authActionClient
	.schema(feedbackSchema)
	.action(
		async ({
			parsedInput: { revalidatePath, redirectTo, message },
			ctx: { user },
		}) => {
			const email = user.email;

			await sendEmail({
				to: "alex@proxed.ai",
				templateId: "feedback",
				context: {
					email,
					message,
				},
			});

			if (revalidatePath) {
				revalidatePathFunc(revalidatePath);
			}

			if (redirectTo) {
				redirect(redirectTo);
			}
		},
	);
