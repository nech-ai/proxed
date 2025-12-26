import { render } from "@react-email/render";
import type { JSX } from "react";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewUser } from "../emails/NewUser";
import { TeamInvitation } from "../emails/TeamInvitation";
import { Feedback } from "../emails/Feedback";
import { Support } from "../emails/Support";
import { ExecutionError } from "../emails/ExecutionError";
import { HighConsumption } from "../emails/HighConsumption";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	teamInvitation: TeamInvitation,
	feedback: Feedback,
	support: Support,
	executionError: ExecutionError,
	highConsumption: HighConsumption,
};

type TemplateWithSubjects<Context> = ((context: Context) => JSX.Element) & {
	subjects: Record<string, string>;
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
	locale: string;
}) {
	const template = mailTemplates[templateId] as TemplateWithSubjects<
		Parameters<(typeof mailTemplates)[TemplateId]>[0]
	>;
	const email = template(context);
	const subject = template.subjects[locale] ?? template.subjects.en;
	const html = await render(email);
	const text = await render(email, { plainText: true });
	return { html, text, subject };
}
