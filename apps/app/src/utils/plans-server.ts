import { createClient } from "@proxed/supabase/job";
import { revalidateTag } from "next/cache";
import type { PLANS } from "./plans";

type UpdateTeamPlanData = {
	plan?: keyof (typeof PLANS)[keyof typeof PLANS];
	email?: string;
	canceled_at?: string | null;
};

export async function updateTeamPlan(teamId: string, data: UpdateTeamPlanData) {
	const supabase = createClient();

	const { data: teamData, error } = await supabase
		.from("teams")
		.update(data)
		.eq("id", teamId)
		.select("team_memberships(user_id)")
		.single();

	revalidateTag(`teams_${teamId}`);

	// Revalidate the user cache for each user on the team
	for (const user of teamData?.team_memberships ?? []) {
		revalidateTag(`user_${user.user_id}`);
	}
}

export async function canChooseStarterPlanQuery(teamId: string) {
	const supabase = createClient();

	const [projectsResponse] = await Promise.all([
		supabase.from("projects").select("id").eq("team_id", teamId),
	]);

	return (projectsResponse.data?.length ?? 0) < 2;
}
