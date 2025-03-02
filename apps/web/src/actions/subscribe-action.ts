"use server";

import { resend } from "@/utils/resend";
import { config } from "@config";

export async function subscribeAction(formData: FormData) {
	const email = formData.get("email") as string;

	await resend.contacts.create({
		email,
		audienceId: process.env.RESEND_AUDIENCE_ID as string,
	});

	return resend.emails.create({
		from: config.mailing.from,
		to: ["alex@proxed.ai"],
		subject: "New ProxedAI user",
		html: `<p>New ProxedAI user: ${email}</p>`,
	});
}
