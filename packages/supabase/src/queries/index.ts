import { UTCDate } from "@date-fns/utc";
import type { Client } from "../types/index";
import { subYears } from "date-fns";

export function getPercentageIncrease(a: number, b: number) {
	return a > 0 && b > 0 ? Math.abs(((a - b) / b) * 100).toFixed() : 0;
}

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
	// @ts-expect-error
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
		"test_mode",
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
		.select("*, device_check:device_checks(*), key:provider_keys(*)")
		.eq("id", projectId)
		.throwOnError()
		.single();
}

export type GetExecutionsParams = {
	teamId: string;
	to: number;
	from: number;
	sort?: [string, "asc" | "desc"];
	searchQuery?: string;
	filter?: {
		start?: string;
		end?: string;
		projectId?: string;
		deviceCheckId?: string;
		keyId?: string;
		provider?: "OPENAI" | "ANTHROPIC";
		model?: string;
		finishReason?:
			| "stop"
			| "length"
			| "content-filter"
			| "tool-calls"
			| "error"
			| "other"
			| "unknown";
	};
};

export async function getExecutionsQuery(
	supabase: Client,
	params: GetExecutionsParams,
) {
	const { from = 0, to, filter, sort, teamId } = params;
	const {
		start,
		end,
		projectId,
		deviceCheckId,
		keyId,
		provider,
		model,
		finishReason,
	} = filter || {};

	const columns = [
		"id",
		"project_id",
		"project:projects(id, name, bundle_id)",
		"device_check_id",
		"device_check:device_checks(id, name)",
		"key_id",
		"key:provider_keys(id, display_name)",
		"model",
		"provider",
		"prompt_tokens",
		"completion_tokens",
		"total_tokens",
		"total_cost",
		"finish_reason",
		"latency",
		"response_code",
		"error_message",
		"completion_cost",
		"prompt_cost",
		"created_at",
	];

	const query = supabase
		.from("executions")
		.select(columns.join(","), { count: "exact" })
		.eq("team_id", teamId);

	if (sort) {
		const [column, value] = sort;
		const ascending = value === "asc";
		if (column === "project") {
			query.order("project(name)", { ascending });
		} else if (column === "device_check") {
			query.order("device_check(name)", { ascending });
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

	if (projectId) {
		query.eq("project_id", projectId);
	}

	if (deviceCheckId) {
		query.eq("device_check_id", deviceCheckId);
	}

	if (keyId) {
		query.eq("key_id", keyId);
	}

	if (provider) {
		query.eq("provider", provider);
	}

	if (model) {
		query.eq("model", model);
	}

	if (finishReason) {
		query.eq("finish_reason", finishReason);
	}

	const { data, count } = await query.range(from, to).throwOnError();

	return {
		meta: {
			count,
		},
		data,
	};
}

export async function getExecutionQuery(supabase: Client, executionId: string) {
	return supabase
		.from("executions")
		.select(`
      *,
      project:projects(*),
      device_check:device_checks(*),
      key:provider_keys(*)
    `)
		.eq("id", executionId)
		.throwOnError()
		.single();
}

export type getExecutionMetricsParams = {
	teamId: string;
	from: string;
	to: string;
	type?: "all";
};

export async function getExecutionMetricsQuery(
	supabase: Client,
	params: getExecutionMetricsParams,
) {
	const { teamId, from, to, type = "all" } = params;
	const rpc = `get_executions_${type}` as const;

	const fromDate = new UTCDate(from);
	const toDate = new UTCDate(to);

	const [{ data: prevData }, { data: currentData }] = await Promise.all([
		supabase.rpc(rpc, {
			p_team_id: teamId,
			date_from: subYears(fromDate, 1).toDateString(),
			date_to: subYears(toDate, 1).toDateString(),
		}),
		supabase.rpc(rpc, {
			p_team_id: teamId,
			date_from: fromDate.toDateString(),
			date_to: toDate.toDateString(),
		}),
	]);

	const prevTotal = prevData?.reduce(
		(acc, item) => acc + (item.execution_count || 0),
		0,
	);
	const currentTotal = currentData?.reduce(
		(acc, item) => acc + (item.execution_count || 0),
		0,
	);

	return {
		summary: {
			currentTotal: currentTotal || 0,
			prevTotal: prevTotal || 0,
		},
		meta: {
			type,
		},
		result: currentData?.map((record, index) => {
			const prev = prevData?.at(index);

			return {
				date: record.date,
				precentage: {
					value: getPercentageIncrease(
						Math.abs(prev?.execution_count || 0),
						Math.abs(record.execution_count || 0),
					),
					status:
						(record.execution_count || 0) > (prev?.execution_count || 0)
							? "positive"
							: "negative",
				},
				current: {
					date: record.date,
					value: record.execution_count || 0,
				},
				previous: {
					date: prev?.date,
					value: prev?.execution_count || 0,
				},
			};
		}),
	};
}
