import { createClient as createSuperClient } from "@proxed/supabase/api";
import { getTeamInviteQuery } from "@proxed/supabase/queries";
import { createClient } from "@proxed/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ code: string }> },
) {
	const { code } = await params;
	if (!code) {
		return redirect("/login?error=invitation-not-found");
	}
	const supabase = await createClient();
	const supaSupabase = await createSuperClient();

	const invitation = await getTeamInviteQuery(supaSupabase, code);
	if (!invitation.data) {
		return redirect("/login?error=invitation-not-found");
	}

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		const { data: existingUser } = await supaSupabase
			.from("users")
			.select("id")
			.eq("email", invitation.data.email)
			.single();

		const authPath = existingUser ? "login" : "signup";
		return redirect(
			`/${authPath}?invitationCode=${invitation.data.id}&email=${encodeURIComponent(
				invitation.data.email,
			)}`,
		);
	}
	return redirect(`/teams/accept-invitation?code=${invitation.data.id}`);
}
