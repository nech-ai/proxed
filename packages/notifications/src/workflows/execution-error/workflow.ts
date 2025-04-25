import { workflow } from "@novu/framework";

import { payloadSchema } from "./schemas";
import { getTemplate } from "@proxed/mail";

export const executionError = workflow(
	"execution-error",
	async ({ step, payload }) => {
		await step.email("send-email", async () => {
			const { html, subject } = await getTemplate({
				templateId: "executionError",
				context: payload,
				locale: "en",
			});

			return {
				subject,
				body: html,
			};
		});
		await step.inApp("in-app", async () => {
			const subject = `Execution Error - ${payload.model || "Unknown Model"}`;
			const body = `An error occurred during execution. Type: ${payload.errorType || "N/A"}. Message: ${payload.errorMessage || "N/A"}. Model: ${payload.model || "N/A"}.`;

			return {
				subject,
				body,
			};
		});
	},
	{
		payloadSchema,
	},
);
