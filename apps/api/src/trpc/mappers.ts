import type {
	deviceChecks,
	executions,
	projects,
	providerKeys,
	vaultObjects,
	teamInvitations,
	teamMemberships,
	teams,
	users,
} from "@proxed/db/schema";

type TeamRow = typeof teams.$inferSelect;
type UserRow = typeof users.$inferSelect;
type TeamMembershipRow = typeof teamMemberships.$inferSelect;
type TeamInvitationRow = typeof teamInvitations.$inferSelect;
type DeviceCheckRow = typeof deviceChecks.$inferSelect;
type ProviderKeyRow = typeof providerKeys.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type ExecutionRow = typeof executions.$inferSelect;
type VaultObjectRow = typeof vaultObjects.$inferSelect;

export function mapTeam(team: TeamRow | null) {
	if (!team) return null;
	return {
		id: team.id,
		name: team.name,
		avatarUrl: team.avatarUrl,
		createdAt: team.createdAt,
		updatedAt: team.updatedAt,
		plan: team.plan,
		email: team.email,
		canceledAt: team.canceledAt,
	};
}

export function mapUser(user: UserRow) {
	return {
		id: user.id,
		email: user.email,
		fullName: user.fullName,
		avatarUrl: user.avatarUrl,
		teamId: user.teamId,
		onboarded: user.onboarded,
		isAdmin: user.isAdmin,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

export function mapTeamMembership(
	membership: TeamMembershipRow,
	team?: TeamRow | null,
	user?: UserRow | null,
) {
	return {
		id: membership.id,
		teamId: membership.teamId,
		userId: membership.userId,
		role: membership.role,
		isCreator: membership.isCreator,
		createdAt: membership.createdAt,
		updatedAt: membership.updatedAt,
		team: team ? mapTeam(team) : null,
		user: user ? mapUser(user) : null,
	};
}

export function mapTeamInvitation(invite: TeamInvitationRow) {
	return {
		id: invite.id,
		teamId: invite.teamId,
		email: invite.email,
		role: invite.role,
		invitedById: invite.invitedById,
		createdAt: invite.createdAt,
		expiresAt: invite.expiresAt,
	};
}

export function mapDeviceCheck(deviceCheck: DeviceCheckRow | null) {
	if (!deviceCheck) return null;
	return {
		id: deviceCheck.id,
		teamId: deviceCheck.teamId,
		name: deviceCheck.name,
		keyId: deviceCheck.keyId,
		appleTeamId: deviceCheck.appleTeamId,
		createdAt: deviceCheck.createdAt,
		updatedAt: deviceCheck.updatedAt,
	};
}

export function mapProviderKey(key: ProviderKeyRow | null) {
	if (!key) return null;
	return {
		id: key.id,
		teamId: key.teamId,
		provider: key.provider,
		isActive: key.isActive,
		displayName: key.displayName,
		createdAt: key.createdAt,
		updatedAt: key.updatedAt,
	};
}

export function mapProject(
	project: ProjectRow,
	deviceCheck?: DeviceCheckRow | null,
	key?: ProviderKeyRow | null,
) {
	return {
		id: project.id,
		teamId: project.teamId,
		name: project.name,
		description: project.description,
		bundleId: project.bundleId,
		iconUrl: project.iconUrl,
		deviceCheckId: project.deviceCheckId,
		keyId: project.keyId,
		systemPrompt: project.systemPrompt,
		defaultUserPrompt: project.defaultUserPrompt,
		model: project.model,
		isActive: project.isActive,
		schemaConfig: project.schemaConfig ?? {},
		createdAt: project.createdAt,
		updatedAt: project.updatedAt,
		testMode: project.testMode,
		testKey: project.testKey,
		lastRateLimitNotifiedAt: project.lastRateLimitNotifiedAt,
		notificationIntervalSeconds: project.notificationIntervalSeconds,
		notificationThreshold: project.notificationThreshold,
		saveImagesToVault: project.saveImagesToVault,
		deviceCheck: deviceCheck ? mapDeviceCheck(deviceCheck) : null,
		key: key ? mapProviderKey(key) : null,
	};
}

export function mapExecution(
	execution: ExecutionRow,
	project?: ProjectRow | null,
	deviceCheck?: DeviceCheckRow | null,
	key?: ProviderKeyRow | null,
) {
	return {
		id: execution.id,
		teamId: execution.teamId,
		projectId: execution.projectId,
		deviceCheckId: execution.deviceCheckId,
		keyId: execution.keyId,
		ip: execution.ip,
		userAgent: execution.userAgent,
		model: execution.model,
		provider: execution.provider,
		promptTokens: execution.promptTokens,
		completionTokens: execution.completionTokens,
		totalTokens: execution.totalTokens,
		finishReason: execution.finishReason,
		latency: execution.latency,
		responseCode: execution.responseCode,
		promptCost: execution.promptCost ? Number(execution.promptCost) : 0,
		completionCost: execution.completionCost
			? Number(execution.completionCost)
			: 0,
		totalCost: execution.totalCost ? Number(execution.totalCost) : 0,
		prompt: execution.prompt,
		response: execution.response,
		errorMessage: execution.errorMessage,
		errorCode: execution.errorCode,
		createdAt: execution.createdAt,
		updatedAt: execution.updatedAt,
		countryCode: execution.countryCode,
		regionCode: execution.regionCode,
		city: execution.city,
		longitude: execution.longitude,
		latitude: execution.latitude,
		project: project
			? {
					id: project.id,
					name: project.name,
					bundleId: project.bundleId,
				}
			: null,
		deviceCheck: deviceCheck
			? {
					id: deviceCheck.id,
					name: deviceCheck.name,
				}
			: null,
		key: key
			? {
					id: key.id,
					displayName: key.displayName,
				}
			: null,
	};
}

export function mapVaultObject(
	vaultObject: VaultObjectRow,
	project?: ProjectRow | null,
) {
	return {
		id: vaultObject.id,
		teamId: vaultObject.teamId,
		projectId: vaultObject.projectId,
		executionId: vaultObject.executionId,
		bucket: vaultObject.bucket,
		pathTokens: vaultObject.pathTokens,
		mimeType: vaultObject.mimeType,
		sizeBytes: vaultObject.sizeBytes,
		createdAt: vaultObject.createdAt,
		updatedAt: vaultObject.updatedAt,
		project: project
			? {
					id: project.id,
					name: project.name,
					bundleId: project.bundleId,
				}
			: null,
	};
}
