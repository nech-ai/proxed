import { z } from "zod";

export const updateUserSchema = z.object({
	full_name: z.string().min(2).max(32).optional(),
	email: z.string().email().optional(),
	avatar_url: z.string().url().optional(),
	revalidatePath: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const createTeamSchema = z.object({
	name: z.string().min(2, {
		message: "Team name must be at least 2 characters.",
	}),
	redirectTo: z.string().optional(),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
	name: z.string().min(2).max(32).optional(),
	avatar_url: z.string().url().optional(),
	revalidatePath: z.string().optional(),
});

export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;

export const changeTeamSchema = z.object({
	teamId: z.string(),
	redirectTo: z.string(),
});

export const deleteTeamSchema = z.object({
	teamId: z.string(),
});

export const acceptInvitationSchema = z.object({
	invitationId: z.string(),
	redirectTo: z.string(),
});

export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;

export const inviteTeamMemberSchema = z.object({
	email: z.string().email(),
	role: z.enum(["OWNER", "MEMBER"]),
	revalidatePath: z.string().optional(),
});

export type InviteTeamMemberFormValues = z.infer<typeof inviteTeamMemberSchema>;

export const inviteTeamMembersSchema = z.object({
	invites: z.array(
		z.object({
			email: z.string().email(),
			role: z.enum(["OWNER", "MEMBER"]),
		}),
	),
	revalidatePath: z.string().optional(),
	redirectTo: z.string().optional(),
});

export type InviteTeamMembersFormValues = z.infer<
	typeof inviteTeamMembersSchema
>;
export const deleteInviteSchema = z.object({
	id: z.string(),
	revalidatePath: z.string().optional(),
});

export type DeleteInviteFormValues = z.infer<typeof deleteInviteSchema>;

export const parseDateSchema = z
	.date()
	.transform((value) => new Date(value))
	// .transform((v) => isValid(v))
	.refine((v) => !!v, { message: "Invalid date" });

export const filterProjectsSchema = z.object({
	name: z.string().optional().describe("The name to search for"),
	bundleId: z.string().optional().describe("The bundle ID to search for"),
	deviceCheckId: z
		.string()
		.optional()
		.describe("The device check ID to search for"),
	start: parseDateSchema
		.optional()
		.describe(
			"The start date when project creation date. Return ISO-8601 format.",
		),
	end: parseDateSchema
		.optional()
		.describe(
			"The end date when project creation date. If not provided, defaults to the current date. Return ISO-8601 format.",
		),
});

export const createDeviceCheckSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	key_id: z.string().min(1, {
		message: "Key ID is required",
	}),
	private_key_p8: z.string().min(1, {
		message: "Private key is required",
	}),
	apple_team_id: z.string().min(1, {
		message: "Apple Team ID is required",
	}),
	revalidatePath: z.string().optional(),
	redirectTo: z.string().optional(),
});

export type CreateDeviceCheckFormValues = z.infer<
	typeof createDeviceCheckSchema
>;

export const createProviderKeySchema = z.object({
	display_name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	partial_key_server: z.string().min(1),
	provider: z.enum(["OPENAI", "ANTHROPIC"]),
	revalidatePath: z.string().optional(),
});

export type CreateProviderKeyFormValues = z.infer<
	typeof createProviderKeySchema
>;

export const createProjectSchema = z.object({
	name: z.string(),
	description: z.string().optional().default(""),
	bundleId: z.string(),
	revalidatePath: z.string().optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchemaSchema = z.object({
	projectId: z.string(),
	schemaConfig: z.any(),
	revalidatePath: z.string().optional(),
});

export const updateProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	description: z.string().default(""),
	bundleId: z.string().min(1, {
		message: "Bundle ID is required",
	}),
	deviceCheckId: z
		.string()
		.min(1, {
			message: "Device Check is required",
		})
		.nullish(),
	systemPrompt: z.string().min(1, {
		message: "System prompt is required",
	}),
	defaultUserPrompt: z.string(),
	model: z.string().min(1, {
		message: "Model is required",
	}),
	keyId: z
		.string()
		.min(1, {
			message: "Provider key is required",
		})
		.nullish(),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;

export const toggleProjectTestModeSchema = z.object({
	projectId: z.string(),
	testMode: z.boolean(),
	revalidatePath: z.string().optional(),
});

export type ToggleProjectTestModeFormValues = z.infer<
	typeof toggleProjectTestModeSchema
>;

export const filterExecutionsSchema = z.object({
	projectId: z.string().optional().describe("The project ID to filter by"),
	provider: z
		.enum(["OPENAI", "ANTHROPIC"])
		.optional()
		.describe("The AI provider to filter by"),
	model: z
		.enum(["gpt-4o", "gpt-4o-mini", "claude-3-sonnet"])
		.optional()
		.describe("The model to filter by"),
	finishReason: z
		.enum([
			"stop",
			"length",
			"content-filter",
			"tool-calls",
			"error",
			"other",
			"unknown",
		])
		.optional()
		.describe("The finish reason to filter by"),
	start: parseDateSchema
		.optional()
		.describe(
			"The start date for execution creation date. Return ISO-8601 format.",
		),
	end: parseDateSchema
		.optional()
		.describe(
			"The end date for execution creation date. If not provided, defaults to the current date. Return ISO-8601 format.",
		),
});

export type FilterExecutionsFormValues = z.infer<typeof filterExecutionsSchema>;

export const changeChartPeriodSchema = z.object({
	from: z.string().optional(),
	to: z.string().optional(),
});

export const changeChartTypeSchema = z.enum(["all"]);

export const trackingConsentSchema = z.boolean();

export const feedbackSchema = z.object({
	message: z.string(),
	revalidatePath: z.string().optional(),
	redirectTo: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export const supportSchema = z.object({
	subject: z.string(),
	category: z.enum(["bug", "feature", "question", "other"]),
	priority: z.enum(["low", "medium", "high"]),
	message: z.string(),
	revalidatePath: z.string().optional(),
	redirectTo: z.string().optional(),
});

export type SupportFormValues = z.infer<typeof supportSchema>;
