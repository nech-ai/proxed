export * from "./resend";
import { type Config, config } from "@config";
import type { MailProvider } from "../types";
export async function getProvider() {
	const providerResolvers = {
		console: () => import("./console"),
		resend: () => import("./resend"),
	} satisfies Record<
		Config["mailing"]["provider"],
		() => Promise<MailProvider>
	>;
	return await providerResolvers[config.mailing.provider]();
}
