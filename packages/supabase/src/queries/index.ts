import { UTCDate } from "@date-fns/utc";
import type { Client } from "../types/index";

// Database types
export async function getUserQuery(supabase: Client, userId: string) {
	return supabase
		.from("users")
		.select(
			`
      *,
      team:teams(*)
    `,
		)
		.eq("id", userId)
		.single()
		.throwOnError();
}

export async function getCurrentUserTeamQuery(supabase: Client) {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		return;
	}
	return getUserQuery(supabase, session.user?.id);
}

export async function getTeamMembershipsByUserIdQuery(
	supabase: Client,
	userId: string,
) {
	return supabase
		.from("team_memberships")
		.select(
			`
      *,
      team:teams(*),
      user:users(*)
    `,
		)
		.eq("user_id", userId)
		.throwOnError();
}

export async function getTeamMembersQuery(supabase: Client, teamId: string) {
	return await supabase
		.from("team_memberships")
		.select(
			`
      id,
      role,
      is_creator,
      team_id,
      user_id,
      created_at,
      updated_at,
      team:teams(*),
      user:users(*)
    `,
		)
		.eq("team_id", teamId)
		.order("created_at")
		.throwOnError();
}

export async function getTeamInvitesQuery(supabase: Client, teamId: string) {
	const { data } = await supabase
		.from("team_invitations")
		.select(
			`
      *,
      team:teams(*),
      invited_by:users(*)
    `,
		)
		.eq("team_id", teamId)
		.order("created_at")
		.throwOnError();

	return data;
}

export async function getTeamInviteQuery(supabase: Client, code: string) {
	return supabase
		.from("team_invitations")
		.select(
			`
      *,
      team:teams(*),
      invited_by:users(*)
    `,
		)
		.eq("code", code)
		.throwOnError()
		.single();
}

type GetTeamUserParams = {
	teamId: string;
	userId: string;
};

export async function getTeamUserQuery(
	supabase: Client,
	params: GetTeamUserParams,
) {
	const { data } = await supabase
		.from("team_memberships")
		.select(
			`
      id,
      role,
      team_id,
      is_creator,
      user:users(id, full_name, avatar_url, email)
    `,
		)
		.eq("team_id", params.teamId)
		.eq("user_id", params.userId)
		.throwOnError()
		.single();

	return {
		data,
	};
}

export async function getUserInvitesQuery(supabase: Client, email: string) {
	return supabase
		.from("team_invitations")
		.select("id, email, code, role, user:invited_by(*), team:team_id(*)")
		.eq("email", email)
		.throwOnError();
}

export async function getDeviceChecksQuery(supabase: Client, teamId: string) {
	const { data, count } = await supabase
		.from("device_checks")
		.select("id, name, key_id, apple_team_id, created_at, updated_at")
		.eq("team_id", teamId)
		.throwOnError();

	return {
		meta: {
			count,
		},
		data: data ?? [],
	};
}

export async function getDeviceCheckQuery(supabase: Client, id: string) {
	return supabase
		.from("device_checks")
		.select("id, name, key_id, apple_team_id, created_at, updated_at")
		.eq("id", id)
		.throwOnError()
		.single();
}

export async function getProviderKeysQuery(supabase: Client, teamId: string) {
	return supabase
		.from("provider_keys")
		.select(
			"id, team_id, provider, is_active, display_name, created_at, updated_at",
		)
		.eq("team_id", teamId)
		.throwOnError();
}

export async function getProviderKeyQuery(supabase: Client, id: string) {
	return supabase
		.from("provider_keys")
		.select(
			"id, team_id, provider, is_active, display_name, created_at, updated_at",
		)
		.eq("id", id)
		.throwOnError()
		.single();
}

export type GetProjectsParams = {
	teamId: string;
	to: number;
	from: number;
	sort?: [string, "asc" | "desc"];
	searchQuery?: string;
	filter?: {
		start?: string;
		end?: string;
		deviceCheckId?: string;
		keyId?: string;
	};
};

export async function getProjectsQuery(
	supabase: Client,
	params: GetProjectsParams,
) {
	const { from = 0, to, filter, sort, teamId } = params;
	const { start, end, deviceCheckId, keyId } = filter || {};
	const columns = [
		"id",
		"name",
		"is_active",
		"description",
		"bundle_id",
		"device_check_id",
		"device_check:device_checks(id, name)",
		"key_id",
		"key:provider_keys(id, display_name, provider)",
		"created_at",
		"updated_at",
	];
	const query = supabase
		.from("projects")
		.select(columns.join(","), { count: "exact" })
		.eq("team_id", teamId);

	if (sort) {
		const [column, value] = sort;
		const ascending = value === "asc";
		if (column === "device_check") {
			query.order("device_check(name)", { ascending });
		} else if (column === "credential") {
			query.order("credential(name)", { ascending });
		} else if (column === "created_by") {
			query.order("created_by(full_name)", { ascending });
		} else if (column === "key") {
			query.order("key(display_name)", { ascending });
		} else {
			query.order(column, { ascending });
		}
	} else {
		query.order("created_at", { ascending: false });
	}

	if (start && end) {
		const fromDate = new UTCDate(start);
		const toDate = new UTCDate(end);

		query.gte("created_at", fromDate.toISOString());
		query.lte("created_at", toDate.toISOString());
	}

	if (deviceCheckId) {
		query.eq("device_check_id", deviceCheckId);
	}

	if (keyId) {
		query.eq("key_id", keyId);
	}

	const { data, count } = await query.range(from, to).throwOnError();

	return {
		meta: {
			count,
		},
		data,
	};
}

export async function getProjectQuery(supabase: Client, projectId: string) {
	return supabase
		.from("projects")
		.select("*, device_check:device_checks(*)")
		.eq("id", projectId)
		.throwOnError()
		.single();
}
