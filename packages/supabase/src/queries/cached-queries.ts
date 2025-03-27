import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient } from "../clients/server";
import {
	type GetProjectsParams,
	getDeviceCheckQuery,
	getDeviceChecksQuery,
	getProjectQuery,
	getProjectsQuery,
	getProviderKeyQuery,
	getProviderKeysQuery,
	getTeamInvitesQuery,
	getTeamMembersQuery,
	getTeamMembershipsByUserIdQuery,
	getTeamUserQuery,
	getUserInvitesQuery,
	getUserQuery,
	type GetExecutionsParams,
	getExecutionsQuery,
	getExecutionQuery,
	type getExecutionMetricsParams,
	getExecutionMetricsQuery,
	getTeamBillingQuery,
} from "../queries";

import type { TeamBilling } from "../types";

export const getSession = cache(async () => {
	const supabase = await createClient();

	return supabase.auth.getSession();
});

export const getUser = async () => {
	const {
		data: { session },
	} = await getSession();
	const userId = session?.user?.id;

	if (!userId) {
		return null;
	}

	const supabase = await createClient();

	return unstable_cache(
		async () => {
			return getUserQuery(supabase, userId);
		},
		["user", userId],
		{
			tags: [`user_${userId}`],
			revalidate: 180,
		},
	)();
};

export const getTeamUser = async () => {
	const supabase = await createClient();
	const user = await getUser();

	const userId = user?.data?.id;
	const teamId = user?.data?.team_id;

	if (!userId || !teamId) {
		return null;
	}

	return unstable_cache(
		async () => {
			return getTeamUserQuery(supabase, {
				userId,
				teamId,
			});
		},
		["team", "user", userId],
		{
			tags: [`team_user_${userId}`],
			revalidate: 180,
		},
	)();
};

export const getTeamMembers = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;

	if (!teamId) {
		return null;
	}

	return unstable_cache(
		async () => {
			return getTeamMembersQuery(supabase, teamId);
		},
		["team_members", teamId],
		{
			tags: [`team_members_${teamId}`],
			revalidate: 180,
		},
	)();
};

export const getTeamMemberships = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const userId = user?.data?.id;

	if (!userId) {
		return;
	}

	return unstable_cache(
		async () => {
			return getTeamMembershipsByUserIdQuery(supabase, userId);
		},
		["teams", userId],
		{
			tags: [`teams_${userId}`],
			revalidate: 180,
		},
	)();
};

export const getTeamInvites = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;

	if (!teamId) {
		return;
	}

	return unstable_cache(
		async () => {
			return getTeamInvitesQuery(supabase, teamId);
		},
		["team", "invites", teamId],
		{
			tags: [`team_invites_${teamId}`],
			revalidate: 180,
		},
	)();
};

export const getUserInvites = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const email = user?.data?.email ?? "";

	return unstable_cache(
		async () => {
			return getUserInvitesQuery(supabase, email);
		},
		["user", "invites", email],
		{
			tags: [`user_invites_${email}`],
			revalidate: 180,
		},
	)();
};

export const getDeviceChecks = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;

	if (!teamId) {
		return;
	}

	return unstable_cache(
		async () => {
			return getDeviceChecksQuery(supabase, teamId);
		},
		["device_checks", teamId],
		{
			tags: [`device_checks_${teamId}`],
			revalidate: 180,
		},
	)();
};

export const getDeviceCheck = async (id: string) => {
	const supabase = await createClient();

	return unstable_cache(
		async () => {
			return getDeviceCheckQuery(supabase, id);
		},
		["device_check", id],
		{
			tags: [`device_check_${id}`],
			revalidate: 180,
		},
	)();
};

export const getProviderKeys = async () => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;
	if (!teamId) return null;

	return unstable_cache(
		async () => getProviderKeysQuery(supabase, teamId),
		["provider_keys", teamId],
		{ tags: [`provider_keys_${teamId}`], revalidate: 180 },
	)();
};

export const getProviderKey = async (id: string) => {
	const supabase = await createClient();

	return unstable_cache(
		async () => getProviderKeyQuery(supabase, id),
		["provider_key", id],
		{ tags: [`provider_key_${id}`], revalidate: 180 },
	)();
};

export const getProjects = async (
	params: Omit<GetProjectsParams, "teamId">,
) => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;
	if (!teamId) return null;

	return unstable_cache(
		async () => getProjectsQuery(supabase, { ...params, teamId }),
		["projects", teamId, JSON.stringify(params)],
		{ tags: [`projects_${teamId}`], revalidate: 30 },
		// @ts-expect-error
	)(params);
};

export const getProject = async (projectId: string) => {
	const supabase = await createClient();

	return unstable_cache(
		async () => getProjectQuery(supabase, projectId),
		["project", projectId],
		{ tags: [`project_${projectId}`], revalidate: 30 },
		// @ts-expect-error
	)(projectId);
};

export const getExecutions = async (
	params: Omit<GetExecutionsParams, "teamId">,
) => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;
	if (!teamId) return null;

	return unstable_cache(
		async () => getExecutionsQuery(supabase, { ...params, teamId }),
		["executions", teamId, JSON.stringify(params)],
		{ tags: [`executions_${teamId}`], revalidate: 30 },
		// @ts-expect-error
	)(params);
};

export const getExecution = async (executionId: string) => {
	const supabase = await createClient();

	return unstable_cache(
		async () => getExecutionQuery(supabase, executionId),
		["execution", executionId],
		{ tags: [`execution_${executionId}`], revalidate: 30 },
		// @ts-expect-error
	)(executionId);
};

export const getExecutionMetrics = async (
	params: Omit<getExecutionMetricsParams, "teamId">,
) => {
	const supabase = await createClient();

	const user = await getUser();
	const teamId = user?.data?.team_id;
	if (!teamId) return null;

	return unstable_cache(
		async () => {
			return getExecutionMetricsQuery(supabase, { ...params, teamId });
		},
		["execution_metrics", teamId, params.type ?? "all"],
		{
			tags: [`job_metrics_${teamId}_${params.type ?? "all"}`],
			revalidate: 30,
		},
		// @ts-expect-error
	)(params);
};

export const getTeamBilling = async () => {
	const client = await createClient();
	const user = await getUser();

	if (!user?.data?.team_id) {
		return { data: null };
	}

	return unstable_cache(
		async () => {
			const data = await getTeamBillingQuery(client, user.data.team_id);
			return { data: data as TeamBilling | null };
		},
		[`team-billing-${user.data.team_id}`],
		{ revalidate: 30 },
	)();
};
