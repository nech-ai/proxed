import type { config } from "@config";
import { getProvider } from "../provider";
import type { mailTemplates } from "./templates";
import { getTemplate } from "./templates";

export async function sendEmail<
	TemplateId extends keyof typeof mailTemplates,
>(params: {
	to: string;
	templateId: TemplateId;
	context: Parameters<(typeof mailTemplates)[TemplateId]>[0];
	locale?: keyof typeof config.i18n.locales;
}) {
	const { to, templateId, context } = params;

	const { send } = await getProvider();

	const { html, text, subject } = await getTemplate({
		templateId,
		context,
		locale: "en",
	});

	try {
		// send the email
		await send({
			to,
			subject,
			text,
			html,
		});
		return true;
	} catch (e) {
		return false;
	}
}
