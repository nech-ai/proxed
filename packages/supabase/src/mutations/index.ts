import { getUserQuery } from "../queries";
import type { Client, TablesUpdate } from "../types/index";
import { calculateCosts } from "@proxed/utils";

export async function updateUser(
	supabase: Client,
	data: TablesUpdate<"users">,
) {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		return;
	}

	return supabase
		.from("users")
		.update(data)
		.eq("id", session.user.id)
		.select()
		.single();
}

export async function deleteUser(supabase: Client) {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		return;
	}

	await Promise.all([
		supabase.auth.admin.deleteUser(session.user.id),
		supabase.from("users").delete().eq("id", session.user.id),
		supabase.auth.signOut(),
	]);

	return session.user.id;
}

type CreateTeamParams = {
	name: string;
};

export async function createTeam(supabase: Client, params: CreateTeamParams) {
	const { data } = await supabase.rpc("create_team", {
		name: params.name,
	});

	return data;
}

export async function updateTeam(
	supabase: Client,
	data: TablesUpdate<"teams">,
) {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.user) {
		return;
	}

	const user = await getUserQuery(supabase, session.user.id);

	if (!user.data?.team?.id) {
		return;
	}

	return supabase
		.from("teams")
		.update(data)
		.eq("id", user.data.team.id)
		.select()
		.single();
}

export async function deleteTeam(supabase: Client, teamId: string) {
	return supabase.from("teams").delete().eq("id", teamId);
}

type DeleteTeamMemberParams = {
	userId: string;
	teamId: string;
};

export async function deleteTeamMember(
	supabase: Client,
	params: DeleteTeamMemberParams,
) {
	return supabase
		.from("team_memberships")
		.delete()
		.eq("user_id", params.userId)
		.eq("team_id", params.teamId)
		.select()
		.single();
}

export async function deleteTeamInvitation(supabase: Client, id: string) {
	return supabase.from("team_invitations").delete().eq("id", id).throwOnError();
}

type AcceptInvitationParams = {
	invitationId: string;
	userId: string;
};

export async function acceptInvitation(
	supabase: Client,
	params: AcceptInvitationParams,
) {
	const { data: invitation } = await supabase
		.from("team_invitations")
		.select()
		.eq("id", params.invitationId)
		.single();

	if (!invitation) {
		return;
	}

	await supabase
		.from("team_memberships")
		.insert({
			team_id: invitation.team_id,
			user_id: params.userId,
			role: invitation.role,
		})
		.select()
		.single()
		.throwOnError();

	await supabase
		.from("users")
		.update({
			team_id: invitation.team_id,
		})
		.eq("id", params.userId)
		.select()
		.single();

	await supabase
		.from("team_invitations")
		.delete()
		.eq("id", params.invitationId)
		.throwOnError();
}

type CreateDeviceCheckParams = {
	name?: string;
	key_id: string;
	private_key_p8: string;
	apple_team_id: string;
	team_id: string;
};

export async function createDeviceCheck(
	supabase: Client,
	params: CreateDeviceCheckParams,
) {
	return supabase.from("device_checks").insert(params).select().single();
}

type UpdateDeviceCheckParams = Partial<CreateDeviceCheckParams>;

export async function updateDeviceCheck(
	supabase: Client,
	id: string,
	params: UpdateDeviceCheckParams,
) {
	return supabase
		.from("device_checks")
		.update(params)
		.eq("id", id)
		.select()
		.single();
}

export async function deleteDeviceCheck(supabase: Client, id: string) {
	return supabase.from("device_checks").delete().eq("id", id).throwOnError();
}

type CreateProviderKeyParams = {
	display_name: string;
	partial_key_server: string;
	provider: "OPENAI" | "ANTHROPIC";
	team_id: string;
};

export async function createProviderKey(
	supabase: Client,
	params: CreateProviderKeyParams,
) {
	return supabase.from("provider_keys").insert(params).select().single();
}

type UpdateProviderKeyParams = Partial<CreateProviderKeyParams>;

export async function updateProviderKey(
	supabase: Client,
	id: string,
	params: UpdateProviderKeyParams,
) {
	return supabase
		.from("provider_keys")
		.update(params)
		.eq("id", id)
		.select()
		.single();
}

export async function deleteProviderKey(supabase: Client, id: string) {
	return supabase.from("provider_keys").delete().eq("id", id).throwOnError();
}

type CreateProjectParams = {
	name: string;
	description: string;
	teamId: string;
	bundleId: string;
	schemaConfig?: Record<string, any>;
};

export async function createProject(
	supabase: Client,
	params: CreateProjectParams,
) {
	return supabase
		.from("projects")
		.insert({
			name: params.name,
			description: params.description,
			bundle_id: params.bundleId,
			team_id: params.teamId,
			schema_config: params.schemaConfig ?? {},
		})
		.select()
		.single();
}

export async function updateProjectSchema(
	supabase: Client,
	projectId: string,
	schemaConfig: Record<string, any>,
) {
	return supabase
		.from("projects")
		.update({ schema_config: schemaConfig })
		.eq("id", projectId)
		.select("*")
		.single();
}

export async function updateProject(
	supabase: Client,
	id: string,
	data: TablesUpdate<"projects">,
) {
	return supabase.from("projects").update(data).eq("id", id).select().single();
}

type CreateExecutionParams = Omit<
	{
		team_id: string;
		project_id: string;
		device_check_id: string;
		key_id: string;
		ip: string;
		user_agent?: string;
		model: string;
		provider: "OPENAI" | "ANTHROPIC";
		prompt_tokens: number;
		completion_tokens: number;
		finish_reason:
			| "stop"
			| "length"
			| "content-filter"
			| "tool-calls"
			| "error"
			| "other"
			| "unknown";
		latency: number;
		response_code: number;
		prompt?: string;
		response?: string;
		error_message?: string;
		error_code?: string;
		country_code?: string;
		region_code?: string;
		city?: string;
		longitude?: number;
		latitude?: number;
	},
	"total_tokens" | "prompt_cost" | "completion_cost" | "total_cost"
>;

export async function createExecution(
	supabase: Client,
	params: CreateExecutionParams,
) {
	const costs = calculateCosts({
		provider: params.provider,
		model: params.model as any,
		promptTokens: params.prompt_tokens,
		completionTokens: params.completion_tokens,
	});

	return supabase
		.from("executions")
		.insert({
			...params,
			prompt_cost: costs.promptCost,
			completion_cost: costs.completionCost,
			total_cost: costs.totalCost,
			total_tokens: params.prompt_tokens + params.completion_tokens,
		})
		.select()
		.single();
}
