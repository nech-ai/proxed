"use server";

import { revalidatePath as revalidatePathFunc } from "next/cache";
import { authActionClient } from "./safe-action";
import { supportSchema } from "./schema";
import { redirect } from "next/navigation";
import { sendEmail } from "@proxed/mail";

export const supportAction = authActionClient
	.schema(supportSchema)
	.action(
		async ({
			parsedInput: {
				revalidatePath,
				redirectTo,
				subject,
				category,
				priority,
				message,
			},
			ctx: { user },
		}) => {
			const email = user.email;

			await sendEmail({
				to: "alex@proxed.ai",
				templateId: "support",
				context: {
					email,
					subject,
					category,
					priority,
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
