import { render } from "@react-email/component";
import React from "react";
import { Resend } from "resend";

import { Webhook } from "standardwebhooks";
import { ForgotPassword } from "@proxed/mail/emails/ForgotPassword";
import { MagicLink } from "@proxed/mail/emails/MagicLink";

Deno.serve(async (req) => {
	const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
	const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;
	const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;

	const payload = await req.text();
	const headers = Object.fromEntries(req.headers);
	const wh = new Webhook(hookSecret);

	const {
		user,
		email_data: { token, email_action_type, token_hash },
	} = wh.verify(payload, headers) as {
		user: {
			email: string;
			user_metadata?: {
				full_name?: string;
			};
		};
		email_data: {
			token: string;
			redirect_to: string;
			email_action_type: string;
			site_url: string;
			token_hash: string;
			token_new: string;
			token_hash_new: string;
		};
	};

	const displayName = user.user_metadata?.full_name || user.email;

	switch (email_action_type) {
		case "recovery":
		case "reset_password": {
			const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`);
			verifyUrl.searchParams.set("token", token_hash);
			verifyUrl.searchParams.set("type", "recovery");
			verifyUrl.searchParams.set(
				"redirect_to",
				"https://app.proxed.ai/api/auth/callback?next=/auth/reset-password",
			);
			const html = await render(
				React.createElement(ForgotPassword, {
					url: verifyUrl.toString(),
					name: displayName,
					otp: token,
				}),
			);

			await resend.emails.send({
				from: "Proxedbot <no-reply@mail.proxed.ai>",
				to: [user.email],
				subject: "Reset your password",
				html,
			});

			break;
		}
		case "login":
		case "magiclink": {
			const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`);
			verifyUrl.searchParams.set("token", token_hash);
			verifyUrl.searchParams.set("type", "magiclink");
			verifyUrl.searchParams.set(
				"redirect_to",
				"https://app.proxed.ai/api/auth/callback",
			);

			const html = await render(
				React.createElement(MagicLink, {
					url: verifyUrl.toString(),
					name: displayName,
					otp: token,
				}),
			);

			await resend.emails.send({
				from: "Proxedbot <no-reply@mail.proxed.ai>",
				to: [user.email],
				subject: "Login to proxed.ai",
				html,
			});
			break;
		}
		default:
			throw new Error(`Invalid email action type: ${email_action_type}`);
	}

	const responseHeaders = new Headers();
	responseHeaders.set("Content-Type", "application/json");
	return new Response(JSON.stringify({}), {
		status: 200,
		headers: responseHeaders,
	});
});
