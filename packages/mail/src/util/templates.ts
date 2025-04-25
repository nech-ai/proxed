import { render } from "@react-email/render";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewUser } from "../emails/NewUser";
import { TeamInvitation } from "../emails/TeamInvitation";
import { Feedback } from "../emails/Feedback";
import { Support } from "../emails/Support";
import { ExecutionError } from "../emails/ExecutionError";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	teamInvitation: TeamInvitation,
	feedback: Feedback,
	support: Support,
	executionError: ExecutionError,
};

export async function getTemplate<
	TemplateId extends keyof typeof mailTemplates,
>({
	templateId,
	context,
	locale,
}: {
	templateId: TemplateId;
	context: Parameters<(typeof mailTemplates)[TemplateId]>[0];
	locale: keyof (typeof mailTemplates)[TemplateId]["subjects"];
}) {
	const template = mailTemplates[templateId];
	const email = mailTemplates[templateId](context as any);
	const subject =
		locale in template.subjects
			? (template.subjects as any)[locale]
			: template.subjects.en;
	const html = await render(email);
	const text = await render(email, { plainText: true });
	return { html, text, subject };
}
