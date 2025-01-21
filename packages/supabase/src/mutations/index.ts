import { getUserQuery } from "../queries";
import type { Client, TablesUpdate } from "../types/index";

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
	provider: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "MISTRAL";
	is_active: boolean;
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
	deviceCheckId: string;
	teamId: string;
	bundleId: string;
	provider: "OPENAI" | "ANTHROPIC" | "GOOGLE" | "MISTRAL";
	providerKeyPartial: string;
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
			device_check_id: params.deviceCheckId,
			provider: params.provider,
			provider_key_partial: params.providerKeyPartial,
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
