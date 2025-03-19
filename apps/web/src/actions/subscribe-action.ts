"use server";

import { resend } from "@proxed/utils";
import { setupAnalytics } from "@proxed/analytics/server";
import { LogEvents } from "@proxed/analytics/events";

export async function subscribeAction(formData: FormData) {
	const email = formData.get("email") as string;

	const analytics = await setupAnalytics({
		userId: email,
		fullName: email,
	});

	analytics.track({
		event: LogEvents.JoinWaitlist.name,
		channel: LogEvents.JoinWaitlist.channel,
	});

	return resend.contacts.create({
		email,
		audienceId: process.env.RESEND_AUDIENCE_ID as string,
	});
}
