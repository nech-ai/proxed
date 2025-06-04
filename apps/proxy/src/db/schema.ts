import {
	pgTable,
	pgSchema,
	varchar,
	uuid,
	text,
	timestamp,
	uniqueIndex,
	index,
	unique,
	check,
	jsonb,
	boolean,
	smallint,
	json,
	foreignKey,
	bigserial,
	inet,
	pgPolicy,
	integer,
	numeric,
	doublePrecision,
	pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/relations";

export const privateSchema = pgSchema("private");
export const auth = pgSchema("auth");
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", [
	"s256",
	"plain",
]);
export const factorStatusInAuth = auth.enum("factor_status", [
	"unverified",
	"verified",
]);
export const factorTypeInAuth = auth.enum("factor_type", [
	"totp",
	"webauthn",
	"phone",
]);
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", [
	"confirmation_token",
	"reauthentication_token",
	"recovery_token",
	"email_change_token_new",
	"email_change_token_current",
	"phone_change_token",
]);
export const finishReason = pgEnum("finish_reason", [
	"stop",
	"length",
	"content-filter",
	"tool-calls",
	"error",
	"other",
	"unknown",
]);
export const providerType = pgEnum("provider_type", ["OPENAI", "ANTHROPIC"]);
export const teamRole = pgEnum("team_role", ["OWNER", "MEMBER"]);

export const schemaMigrationsInAuth = auth.table("schema_migrations", {
	version: varchar({ length: 255 }).primaryKey().notNull(),
});

export const instancesInAuth = auth.table("instances", {
	id: uuid().primaryKey().notNull(),
	uuid: uuid(),
	rawBaseConfig: text("raw_base_config"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
});

export const usersInAuth = auth.table(
	"users",
	{
		instanceId: uuid("instance_id"),
		id: uuid().primaryKey().notNull(),
		aud: varchar({ length: 255 }),
		role: varchar({ length: 255 }),
		email: varchar({ length: 255 }),
		encryptedPassword: varchar("encrypted_password", { length: 255 }),
		emailConfirmedAt: timestamp("email_confirmed_at", {
			withTimezone: true,
			mode: "string",
		}),
		invitedAt: timestamp("invited_at", { withTimezone: true, mode: "string" }),
		confirmationToken: varchar("confirmation_token", { length: 255 }),
		confirmationSentAt: timestamp("confirmation_sent_at", {
			withTimezone: true,
			mode: "string",
		}),
		recoveryToken: varchar("recovery_token", { length: 255 }),
		recoverySentAt: timestamp("recovery_sent_at", {
			withTimezone: true,
			mode: "string",
		}),
		emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
		emailChange: varchar("email_change", { length: 255 }),
		emailChangeSentAt: timestamp("email_change_sent_at", {
			withTimezone: true,
			mode: "string",
		}),
		lastSignInAt: timestamp("last_sign_in_at", {
			withTimezone: true,
			mode: "string",
		}),
		rawAppMetaData: jsonb("raw_app_meta_data"),
		rawUserMetaData: jsonb("raw_user_meta_data"),
		isSuperAdmin: boolean("is_super_admin"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		phone: text().default(sql`NULL`),
		phoneConfirmedAt: timestamp("phone_confirmed_at", {
			withTimezone: true,
			mode: "string",
		}),
		phoneChange: text("phone_change").default(""),
		phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(
			"",
		),
		phoneChangeSentAt: timestamp("phone_change_sent_at", {
			withTimezone: true,
			mode: "string",
		}),
		confirmedAt: timestamp("confirmed_at", {
			withTimezone: true,
			mode: "string",
		}).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
		emailChangeTokenCurrent: varchar("email_change_token_current", {
			length: 255,
		}).default(""),
		emailChangeConfirmStatus: smallint("email_change_confirm_status").default(
			0,
		),
		bannedUntil: timestamp("banned_until", {
			withTimezone: true,
			mode: "string",
		}),
		reauthenticationToken: varchar("reauthentication_token", {
			length: 255,
		}).default(""),
		reauthenticationSentAt: timestamp("reauthentication_sent_at", {
			withTimezone: true,
			mode: "string",
		}),
		isSsoUser: boolean("is_sso_user").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
		isAnonymous: boolean("is_anonymous").default(false).notNull(),
	},
	(table) => [
		uniqueIndex("confirmation_token_idx")
			.using("btree", table.confirmationToken.asc().nullsLast().op("text_ops"))
			.where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("email_change_token_current_idx")
			.using(
				"btree",
				table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops"),
			)
			.where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("email_change_token_new_idx")
			.using(
				"btree",
				table.emailChangeTokenNew.asc().nullsLast().op("text_ops"),
			)
			.where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("reauthentication_token_idx")
			.using(
				"btree",
				table.reauthenticationToken.asc().nullsLast().op("text_ops"),
			)
			.where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("recovery_token_idx")
			.using("btree", table.recoveryToken.asc().nullsLast().op("text_ops"))
			.where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("users_email_partial_key")
			.using("btree", table.email.asc().nullsLast().op("text_ops"))
			.where(sql`(is_sso_user = false)`),
		index("users_instance_id_email_idx").using(
			"btree",
			sql`instance_id`,
			sql`lower((email)::text)`,
		),
		index("users_instance_id_idx").using(
			"btree",
			table.instanceId.asc().nullsLast().op("uuid_ops"),
		),
		index("users_is_anonymous_idx").using(
			"btree",
			table.isAnonymous.asc().nullsLast().op("bool_ops"),
		),
		unique("users_phone_key").on(table.phone),
		check(
			"users_email_change_confirm_status_check",
			sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
		),
	],
);

export const auditLogEntriesInAuth = auth.table(
	"audit_log_entries",
	{
		instanceId: uuid("instance_id"),
		id: uuid().primaryKey().notNull(),
		payload: json(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		ipAddress: varchar("ip_address", { length: 64 }).default("").notNull(),
	},
	(table) => [
		index("audit_logs_instance_id_idx").using(
			"btree",
			table.instanceId.asc().nullsLast().op("uuid_ops"),
		),
	],
);

export const refreshTokensInAuth = auth.table(
	"refresh_tokens",
	{
		instanceId: uuid("instance_id"),
		id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
		token: varchar({ length: 255 }),
		userId: varchar("user_id", { length: 255 }),
		revoked: boolean(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		parent: varchar({ length: 255 }),
		sessionId: uuid("session_id"),
	},
	(table) => [
		index("refresh_tokens_instance_id_idx").using(
			"btree",
			table.instanceId.asc().nullsLast().op("uuid_ops"),
		),
		index("refresh_tokens_instance_id_user_id_idx").using(
			"btree",
			table.instanceId.asc().nullsLast().op("text_ops"),
			table.userId.asc().nullsLast().op("text_ops"),
		),
		index("refresh_tokens_parent_idx").using(
			"btree",
			table.parent.asc().nullsLast().op("text_ops"),
		),
		index("refresh_tokens_session_id_revoked_idx").using(
			"btree",
			table.sessionId.asc().nullsLast().op("bool_ops"),
			table.revoked.asc().nullsLast().op("bool_ops"),
		),
		index("refresh_tokens_updated_at_idx").using(
			"btree",
			table.updatedAt.desc().nullsFirst().op("timestamptz_ops"),
		),
		foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "refresh_tokens_session_id_fkey",
		}).onDelete("cascade"),
		unique("refresh_tokens_token_unique").on(table.token),
	],
);

export const identitiesInAuth = auth.table(
	"identities",
	{
		providerId: text("provider_id").notNull(),
		userId: uuid("user_id").notNull(),
		identityData: jsonb("identity_data").notNull(),
		provider: text().notNull(),
		lastSignInAt: timestamp("last_sign_in_at", {
			withTimezone: true,
			mode: "string",
		}),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		email: text().generatedAlwaysAs(
			sql`lower((identity_data ->> 'email'::text))`,
		),
		id: uuid().defaultRandom().primaryKey().notNull(),
	},
	(table) => [
		index("identities_email_idx").using(
			"btree",
			table.email.asc().nullsLast().op("text_pattern_ops"),
		),
		index("identities_user_id_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "identities_user_id_fkey",
		}).onDelete("cascade"),
		unique("identities_provider_id_provider_unique").on(
			table.providerId,
			table.provider,
		),
	],
);

export const ssoProvidersInAuth = auth.table(
	"sso_providers",
	{
		id: uuid().primaryKey().notNull(),
		resourceId: text("resource_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	},
	(table) => [
		uniqueIndex("sso_providers_resource_id_idx").using(
			"btree",
			sql`lower(resource_id)`,
		),
		check(
			"resource_id not empty",
			sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`,
		),
	],
);

export const ssoDomainsInAuth = auth.table(
	"sso_domains",
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid("sso_provider_id").notNull(),
		domain: text().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
	},
	(table) => [
		uniqueIndex("sso_domains_domain_idx").using("btree", sql`lower(domain)`),
		index("sso_domains_sso_provider_id_idx").using(
			"btree",
			table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "sso_domains_sso_provider_id_fkey",
		}).onDelete("cascade"),
		check("domain not empty", sql`char_length(domain) > 0`),
	],
);

export const mfaAmrClaimsInAuth = auth.table(
	"mfa_amr_claims",
	{
		sessionId: uuid("session_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		authenticationMethod: text("authentication_method").notNull(),
		id: uuid().primaryKey().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: "mfa_amr_claims_session_id_fkey",
		}).onDelete("cascade"),
		unique("mfa_amr_claims_session_id_authentication_method_pkey").on(
			table.sessionId,
			table.authenticationMethod,
		),
	],
);

export const samlRelayStatesInAuth = auth.table(
	"saml_relay_states",
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid("sso_provider_id").notNull(),
		requestId: text("request_id").notNull(),
		forEmail: text("for_email"),
		redirectTo: text("redirect_to"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		flowStateId: uuid("flow_state_id"),
	},
	(table) => [
		index("saml_relay_states_created_at_idx").using(
			"btree",
			table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
		),
		index("saml_relay_states_for_email_idx").using(
			"btree",
			table.forEmail.asc().nullsLast().op("text_ops"),
		),
		index("saml_relay_states_sso_provider_id_idx").using(
			"btree",
			table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_relay_states_sso_provider_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.flowStateId],
			foreignColumns: [flowStateInAuth.id],
			name: "saml_relay_states_flow_state_id_fkey",
		}).onDelete("cascade"),
		check("request_id not empty", sql`char_length(request_id) > 0`),
	],
);

export const sessionsInAuth = auth.table(
	"sessions",
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		factorId: uuid("factor_id"),
		aal: aalLevelInAuth(),
		notAfter: timestamp("not_after", { withTimezone: true, mode: "string" }),
		refreshedAt: timestamp("refreshed_at", { mode: "string" }),
		userAgent: text("user_agent"),
		ip: inet(),
		tag: text(),
	},
	(table) => [
		index("sessions_not_after_idx").using(
			"btree",
			table.notAfter.desc().nullsFirst().op("timestamptz_ops"),
		),
		index("sessions_user_id_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
		),
		index("user_id_created_at_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
			table.createdAt.asc().nullsLast().op("timestamptz_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "sessions_user_id_fkey",
		}).onDelete("cascade"),
	],
);

export const samlProvidersInAuth = auth.table(
	"saml_providers",
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid("sso_provider_id").notNull(),
		entityId: text("entity_id").notNull(),
		metadataXml: text("metadata_xml").notNull(),
		metadataUrl: text("metadata_url"),
		attributeMapping: jsonb("attribute_mapping"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		nameIdFormat: text("name_id_format"),
	},
	(table) => [
		index("saml_providers_sso_provider_id_idx").using(
			"btree",
			table.ssoProviderId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: "saml_providers_sso_provider_id_fkey",
		}).onDelete("cascade"),
		unique("saml_providers_entity_id_key").on(table.entityId),
		check("metadata_xml not empty", sql`char_length(metadata_xml) > 0`),
		check(
			"metadata_url not empty",
			sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`,
		),
		check("entity_id not empty", sql`char_length(entity_id) > 0`),
	],
);

export const flowStateInAuth = auth.table(
	"flow_state",
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid("user_id"),
		authCode: text("auth_code").notNull(),
		codeChallengeMethod: codeChallengeMethodInAuth(
			"code_challenge_method",
		).notNull(),
		codeChallenge: text("code_challenge").notNull(),
		providerType: text("provider_type").notNull(),
		providerAccessToken: text("provider_access_token"),
		providerRefreshToken: text("provider_refresh_token"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		authenticationMethod: text("authentication_method").notNull(),
		authCodeIssuedAt: timestamp("auth_code_issued_at", {
			withTimezone: true,
			mode: "string",
		}),
	},
	(table) => [
		index("flow_state_created_at_idx").using(
			"btree",
			table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
		),
		index("idx_auth_code").using(
			"btree",
			table.authCode.asc().nullsLast().op("text_ops"),
		),
		index("idx_user_id_auth_method").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
			table.authenticationMethod.asc().nullsLast().op("uuid_ops"),
		),
	],
);

export const oneTimeTokensInAuth = auth.table(
	"one_time_tokens",
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		tokenType: oneTimeTokenTypeInAuth("token_type").notNull(),
		tokenHash: text("token_hash").notNull(),
		relatesTo: text("relates_to").notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("one_time_tokens_relates_to_hash_idx").using(
			"hash",
			table.relatesTo.asc().nullsLast().op("text_ops"),
		),
		index("one_time_tokens_token_hash_hash_idx").using(
			"hash",
			table.tokenHash.asc().nullsLast().op("text_ops"),
		),
		uniqueIndex("one_time_tokens_user_id_token_type_key").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
			table.tokenType.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "one_time_tokens_user_id_fkey",
		}).onDelete("cascade"),
		check("one_time_tokens_token_hash_check", sql`char_length(token_hash) > 0`),
	],
);

export const mfaFactorsInAuth = auth.table(
	"mfa_factors",
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		friendlyName: text("friendly_name"),
		factorType: factorTypeInAuth("factor_type").notNull(),
		status: factorStatusInAuth().notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		secret: text(),
		phone: text(),
		lastChallengedAt: timestamp("last_challenged_at", {
			withTimezone: true,
			mode: "string",
		}),
		webAuthnCredential: jsonb("web_authn_credential"),
		webAuthnAaguid: uuid("web_authn_aaguid"),
	},
	(table) => [
		index("factor_id_created_at_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("timestamptz_ops"),
			table.createdAt.asc().nullsLast().op("uuid_ops"),
		),
		uniqueIndex("mfa_factors_user_friendly_name_unique")
			.using(
				"btree",
				table.friendlyName.asc().nullsLast().op("text_ops"),
				table.userId.asc().nullsLast().op("uuid_ops"),
			)
			.where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
		index("mfa_factors_user_id_idx").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
		),
		uniqueIndex("unique_phone_factor_per_user").using(
			"btree",
			table.userId.asc().nullsLast().op("text_ops"),
			table.phone.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "mfa_factors_user_id_fkey",
		}).onDelete("cascade"),
		unique("mfa_factors_last_challenged_at_key").on(table.lastChallengedAt),
	],
);

export const mfaChallengesInAuth = auth.table(
	"mfa_challenges",
	{
		id: uuid().primaryKey().notNull(),
		factorId: uuid("factor_id").notNull(),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).notNull(),
		verifiedAt: timestamp("verified_at", {
			withTimezone: true,
			mode: "string",
		}),
		ipAddress: inet("ip_address").notNull(),
		otpCode: text("otp_code"),
		webAuthnSessionData: jsonb("web_authn_session_data"),
	},
	(table) => [
		index("mfa_challenge_created_at_idx").using(
			"btree",
			table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
		),
		foreignKey({
			columns: [table.factorId],
			foreignColumns: [mfaFactorsInAuth.id],
			name: "mfa_challenges_auth_factor_id_fkey",
		}).onDelete("cascade"),
	],
);

export const users = pgTable(
	"users",
	{
		id: uuid().primaryKey().notNull(),
		email: text().notNull(),
		fullName: text("full_name"),
		avatarUrl: text("avatar_url"),
		teamId: uuid("team_id"),
		onboarded: boolean().default(false),
		isAdmin: boolean("is_admin").default(false),
		createdAt: timestamp("created_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
		updatedAt: timestamp("updated_at", {
			withTimezone: true,
			mode: "string",
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "users_team_id_fkey",
		}).onDelete("set null"),
		unique("users_email_key").on(table.email),
		pgPolicy("allow update own profile", {
			as: "permissive",
			for: "update",
			to: ["public"],
			using: sql`(( SELECT auth.uid() AS uid) = id)`,
		}),
		pgPolicy("allow select own profile", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
	],
);

export const teamMemberships = pgTable(
	"team_memberships",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		userId: uuid("user_id").notNull(),
		role: teamRole().default("MEMBER").notNull(),
		isCreator: boolean("is_creator").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("idx_team_memberships_user_id").using(
			"btree",
			table.userId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_memberships_team_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "team_memberships_user_id_fkey",
		}).onDelete("cascade"),
		unique("unique_team_user").on(table.teamId, table.userId),
		pgPolicy("allow insert for authenticated users", {
			as: "permissive",
			for: "insert",
			to: ["public"],
			withCheck: sql`true`,
		}),
		pgPolicy("allow select own memberships", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
	],
);

export const teamInvitations = pgTable(
	"team_invitations",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		email: text().notNull(),
		role: teamRole().default("MEMBER").notNull(),
		invitedById: uuid("invited_by_id"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" })
			.default(sql`(now() + '48:00:00'::interval)`)
			.notNull(),
	},
	(table) => [
		index("idx_team_invitations_team_id").using(
			"btree",
			table.teamId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "team_invitations_team_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.invitedById],
			foreignColumns: [users.id],
			name: "team_invitations_invited_by_id_fkey",
		}).onDelete("set null"),
		unique("unique_team_email").on(table.teamId, table.email),
		pgPolicy("allow delete invitations for team owners", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`is_owner_of(( SELECT auth.uid() AS uid), team_id)`,
		}),
		pgPolicy("allow insert invitations for team owners", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("allow select invitations for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		check(
			"valid_email",
			sql`email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text`,
		),
	],
);

export const deviceChecks = pgTable(
	"device_checks",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		name: text().default("device check").notNull(),
		keyId: text("key_id").notNull(),
		privateKeyP8: text("private_key_p8").notNull(),
		appleTeamId: text("apple_team_id").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("idx_device_checks_team_id").using(
			"btree",
			table.teamId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "device_checks_team_id_fkey",
		}).onDelete("cascade"),
		unique("unique_team_apple_id").on(table.teamId, table.appleTeamId),
		pgPolicy("allow delete for team owners", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`is_owner_of(( SELECT auth.uid() AS uid), team_id)`,
		}),
		pgPolicy("allow insert for team owners", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("allow select for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		pgPolicy("allow update for team owners", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
	],
);

export const providerKeys = pgTable(
	"provider_keys",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		provider: providerType().notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		displayName: text("display_name").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("idx_provider_keys_team_id").using(
			"btree",
			table.teamId.asc().nullsLast().op("uuid_ops"),
		),
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "provider_keys_team_id_fkey",
		}).onDelete("cascade"),
		pgPolicy("allow delete for team owners", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`is_owner_of(( SELECT auth.uid() AS uid), team_id)`,
		}),
		pgPolicy("allow insert for team owners", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("allow select for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		pgPolicy("allow update for team owners", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
	],
);

export const projects = pgTable(
	"projects",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		name: text().notNull(),
		description: text().notNull(),
		bundleId: text("bundle_id").notNull(),
		iconUrl: text("icon_url"),
		deviceCheckId: uuid("device_check_id"),
		keyId: uuid("key_id"),
		systemPrompt: text("system_prompt"),
		defaultUserPrompt: text("default_user_prompt"),
		model: text(),
		isActive: boolean("is_active").default(true).notNull(),
		schemaConfig: jsonb("schema_config").default({}),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		testMode: boolean("test_mode").default(false),
		testKey: text("test_key"),
		lastRateLimitNotifiedAt: timestamp("last_rate_limit_notified_at", {
			withTimezone: true,
			mode: "string",
		}),
		notificationIntervalSeconds: integer("notification_interval_seconds"),
		notificationThreshold: integer("notification_threshold"),
	},
	(table) => [
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "projects_team_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.deviceCheckId],
			foreignColumns: [deviceChecks.id],
			name: "projects_device_check_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.keyId],
			foreignColumns: [providerKeys.id],
			name: "projects_key_id_fkey",
		}).onDelete("restrict"),
		unique("unique_team_bundle").on(table.teamId, table.bundleId),
		unique("projects_test_key_key").on(table.testKey),
		pgPolicy("allow delete for team owners", {
			as: "permissive",
			for: "delete",
			to: ["public"],
			using: sql`is_owner_of(( SELECT auth.uid() AS uid), team_id)`,
		}),
		pgPolicy("allow insert for team owners", {
			as: "permissive",
			for: "insert",
			to: ["public"],
		}),
		pgPolicy("allow select for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		pgPolicy("allow update for team owners", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
	],
);

export const teams = pgTable(
	"teams",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		avatarUrl: text("avatar_url"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		plan: text().default("trial"),
		email: text(),
		canceledAt: timestamp("canceled_at", {
			withTimezone: true,
			mode: "string",
		}),
	},
	(table) => [
		pgPolicy("allow insert for authenticated users", {
			as: "permissive",
			for: "insert",
			to: ["public"],
			withCheck: sql`true`,
		}),
		pgPolicy("allow delete for team owners", {
			as: "permissive",
			for: "delete",
			to: ["public"],
		}),
		pgPolicy("allow select for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
		pgPolicy("allow update for team owners", {
			as: "permissive",
			for: "update",
			to: ["public"],
		}),
	],
);

export const executions = pgTable(
	"executions",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		teamId: uuid("team_id").notNull(),
		projectId: uuid("project_id").notNull(),
		deviceCheckId: uuid("device_check_id"),
		keyId: uuid("key_id"),
		ip: text().notNull(),
		userAgent: text("user_agent"),
		model: text().notNull(),
		provider: providerType().notNull(),
		promptTokens: integer("prompt_tokens").notNull(),
		completionTokens: integer("completion_tokens").notNull(),
		totalTokens: integer("total_tokens").notNull(),
		finishReason: finishReason("finish_reason").notNull(),
		latency: integer().notNull(),
		responseCode: integer("response_code").notNull(),
		promptCost: numeric("prompt_cost", { precision: 10, scale: 6 })
			.default("0")
			.notNull(),
		completionCost: numeric("completion_cost", { precision: 10, scale: 6 })
			.default("0")
			.notNull(),
		totalCost: numeric("total_cost", { precision: 10, scale: 6 })
			.default("0")
			.notNull(),
		prompt: text(),
		response: text(),
		errorMessage: text("error_message"),
		errorCode: text("error_code"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		countryCode: text("country_code"),
		regionCode: text("region_code"),
		city: text(),
		longitude: doublePrecision(),
		latitude: doublePrecision(),
	},
	(table) => [
		foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "executions_team_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "executions_project_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.deviceCheckId],
			foreignColumns: [deviceChecks.id],
			name: "executions_device_check_id_fkey",
		}).onDelete("set null"),
		foreignKey({
			columns: [table.keyId],
			foreignColumns: [providerKeys.id],
			name: "executions_key_id_fkey",
		}).onDelete("set null"),
		pgPolicy("allow insert for team members", {
			as: "permissive",
			for: "insert",
			to: ["public"],
			withCheck: sql`is_member_of(( SELECT auth.uid() AS uid), team_id)`,
		}),
		pgPolicy("allow select for team members", {
			as: "permissive",
			for: "select",
			to: ["public"],
		}),
	],
);

export const serverKeysInPrivate = privateSchema.table(
	"server_keys",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		providerKeyId: uuid("provider_key_id").notNull(),
		keyValue: text("key_value").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.providerKeyId],
			foreignColumns: [providerKeys.id],
			name: "server_keys_provider_key_id_fkey",
		}).onDelete("cascade"),
		unique("server_keys_provider_key_id_key").on(table.providerKeyId),
		pgPolicy("allow insert for team owners", {
			as: "permissive",
			for: "insert",
			to: ["public"],
			withCheck: sql`is_owner_of(( SELECT auth.uid() AS uid), ( SELECT provider_keys.team_id
   FROM provider_keys
  WHERE (provider_keys.id = server_keys.provider_key_id)))`,
		}),
	],
);

export const refreshTokensInAuthRelations = relations(
	refreshTokensInAuth,
	({ one }) => ({
		sessionsInAuth: one(sessionsInAuth, {
			fields: [refreshTokensInAuth.sessionId],
			references: [sessionsInAuth.id],
		}),
	}),
);

export const sessionsInAuthRelations = relations(
	sessionsInAuth,
	({ one, many }) => ({
		refreshTokensInAuths: many(refreshTokensInAuth),
		mfaAmrClaimsInAuths: many(mfaAmrClaimsInAuth),
		usersInAuth: one(usersInAuth, {
			fields: [sessionsInAuth.userId],
			references: [usersInAuth.id],
		}),
	}),
);

export const identitiesInAuthRelations = relations(
	identitiesInAuth,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [identitiesInAuth.userId],
			references: [usersInAuth.id],
		}),
	}),
);

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
	identitiesInAuths: many(identitiesInAuth),
	sessionsInAuths: many(sessionsInAuth),
	oneTimeTokensInAuths: many(oneTimeTokensInAuth),
	mfaFactorsInAuths: many(mfaFactorsInAuth),
	users: many(users),
}));

export const ssoDomainsInAuthRelations = relations(
	ssoDomainsInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [ssoDomainsInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
	}),
);

export const ssoProvidersInAuthRelations = relations(
	ssoProvidersInAuth,
	({ many }) => ({
		ssoDomainsInAuths: many(ssoDomainsInAuth),
		samlRelayStatesInAuths: many(samlRelayStatesInAuth),
		samlProvidersInAuths: many(samlProvidersInAuth),
	}),
);

export const mfaAmrClaimsInAuthRelations = relations(
	mfaAmrClaimsInAuth,
	({ one }) => ({
		sessionsInAuth: one(sessionsInAuth, {
			fields: [mfaAmrClaimsInAuth.sessionId],
			references: [sessionsInAuth.id],
		}),
	}),
);

export const samlRelayStatesInAuthRelations = relations(
	samlRelayStatesInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [samlRelayStatesInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
		flowStateInAuth: one(flowStateInAuth, {
			fields: [samlRelayStatesInAuth.flowStateId],
			references: [flowStateInAuth.id],
		}),
	}),
);

export const flowStateInAuthRelations = relations(
	flowStateInAuth,
	({ many }) => ({
		samlRelayStatesInAuths: many(samlRelayStatesInAuth),
	}),
);

export const samlProvidersInAuthRelations = relations(
	samlProvidersInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [samlProvidersInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
	}),
);

export const oneTimeTokensInAuthRelations = relations(
	oneTimeTokensInAuth,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [oneTimeTokensInAuth.userId],
			references: [usersInAuth.id],
		}),
	}),
);

export const mfaFactorsInAuthRelations = relations(
	mfaFactorsInAuth,
	({ one, many }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [mfaFactorsInAuth.userId],
			references: [usersInAuth.id],
		}),
		mfaChallengesInAuths: many(mfaChallengesInAuth),
	}),
);

export const mfaChallengesInAuthRelations = relations(
	mfaChallengesInAuth,
	({ one }) => ({
		mfaFactorsInAuth: one(mfaFactorsInAuth, {
			fields: [mfaChallengesInAuth.factorId],
			references: [mfaFactorsInAuth.id],
		}),
	}),
);

export const usersRelations = relations(users, ({ one, many }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id],
	}),
	team: one(teams, {
		fields: [users.teamId],
		references: [teams.id],
	}),
	teamMemberships: many(teamMemberships),
	teamInvitations: many(teamInvitations),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
	users: many(users),
	teamMemberships: many(teamMemberships),
	teamInvitations: many(teamInvitations),
	deviceChecks: many(deviceChecks),
	providerKeys: many(providerKeys),
	projects: many(projects),
	executions: many(executions),
}));

export const teamMembershipsRelations = relations(
	teamMemberships,
	({ one }) => ({
		team: one(teams, {
			fields: [teamMemberships.teamId],
			references: [teams.id],
		}),
		user: one(users, {
			fields: [teamMemberships.userId],
			references: [users.id],
		}),
	}),
);

export const teamInvitationsRelations = relations(
	teamInvitations,
	({ one }) => ({
		team: one(teams, {
			fields: [teamInvitations.teamId],
			references: [teams.id],
		}),
		user: one(users, {
			fields: [teamInvitations.invitedById],
			references: [users.id],
		}),
	}),
);

export const deviceChecksRelations = relations(
	deviceChecks,
	({ one, many }) => ({
		team: one(teams, {
			fields: [deviceChecks.teamId],
			references: [teams.id],
		}),
		projects: many(projects),
		executions: many(executions),
	}),
);

export const providerKeysRelations = relations(
	providerKeys,
	({ one, many }) => ({
		team: one(teams, {
			fields: [providerKeys.teamId],
			references: [teams.id],
		}),
		projects: many(projects),
		executions: many(executions),
		serverKeysInPrivates: many(serverKeysInPrivate),
	}),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
	team: one(teams, {
		fields: [projects.teamId],
		references: [teams.id],
	}),
	deviceCheck: one(deviceChecks, {
		fields: [projects.deviceCheckId],
		references: [deviceChecks.id],
	}),
	providerKey: one(providerKeys, {
		fields: [projects.keyId],
		references: [providerKeys.id],
	}),
	executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one }) => ({
	team: one(teams, {
		fields: [executions.teamId],
		references: [teams.id],
	}),
	project: one(projects, {
		fields: [executions.projectId],
		references: [projects.id],
	}),
	deviceCheck: one(deviceChecks, {
		fields: [executions.deviceCheckId],
		references: [deviceChecks.id],
	}),
	providerKey: one(providerKeys, {
		fields: [executions.keyId],
		references: [providerKeys.id],
	}),
}));

export const serverKeysInPrivateRelations = relations(
	serverKeysInPrivate,
	({ one }) => ({
		providerKey: one(providerKeys, {
			fields: [serverKeysInPrivate.providerKeyId],
			references: [providerKeys.id],
		}),
	}),
);
