import { workflow } from "@novu/framework";
import { payloadSchema } from "./schemas";
import { getTemplate } from "@proxed/mail";
import { getBaseUrl } from "@proxed/utils";

export const highConsumption = workflow(
	"high-consumption",
	async ({ step, payload }) => {
		await step.email("send-email", async () => {
			const { html, subject } = await getTemplate({
				templateId: "highConsumption",
				context: payload,
				locale: "en",
			});

			return {
				subject,
				body: html,
			};
		});

		await step.inApp("in-app", async () => {
			const subject = `High Consumption Alert: ${payload.projectName}`;
			const body = `Your project \"${payload.projectName}\" is experiencing a high rate of API calls. Please review its usage.`;
			const baseUrl = getBaseUrl();
			const projectUrl = `${baseUrl}/projects/${payload.recordId}`;

			return {
				subject,
				body,
				cta: {
					action: {
						buttons: [
							{
								type: "primary" as const,
								content: "View Project",
							},
						],
					},
					data: {
						url: projectUrl,
					},
				},
			};
		});
	},
	{
		payloadSchema,
	},
);
