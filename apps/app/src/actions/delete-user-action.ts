"use server";

import { getUser } from "@proxed/supabase/cached-queries";
import { deleteUser } from "@proxed/supabase/mutations";
import { createClient } from "@proxed/supabase/server";
import { redirect } from "next/navigation";

export const deleteUserAction = async () => {
	const supabase = await createClient();
	const user = await getUser();

	if (!user?.data?.id) {
		return;
	}

	const { data: membersData } = await supabase
		.from("team_memberships")
		.select("team_id, team:teams(id, name, members:team_memberships(id))")
		.eq("user_id", user?.data?.id);

	const teamIds = membersData
		?.filter(({ team }) => team?.members.length === 1)
		.map(({ team_id }) => team_id);

	if (teamIds?.length) {
		await supabase.from("teams").delete().in("id", teamIds);
	}

	await deleteUser(supabase);

	redirect("/");
};
