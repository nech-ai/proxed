import { workflow } from "@novu/framework";

import { payloadSchema } from "./schemas";
import { getTemplate } from "@proxed/mail";
import type { PayloadSchema } from "./types";

export const executionError = workflow(
	"execution-error",
	async ({ step, payload }) => {
		const data = payload as PayloadSchema;
		await step.email("send-email", async () => {
			const { html, subject } = await getTemplate({
				templateId: "executionError",
				context: data,
				locale: "en",
			});

			return {
				subject,
				body: html,
			};
		});
		await step.inApp("in-app", async () => {
			const subject = `Execution Error - ${data.model || "Unknown Model"}`;
			const body = `An error occurred during execution. Type: ${data.errorType || "N/A"}. Message: ${data.errorMessage || "N/A"}. Model: ${data.model || "N/A"}.`;

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
