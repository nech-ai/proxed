-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."finish_reason" AS ENUM('stop', 'length', 'content-filter', 'tool-calls', 'error', 'other', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('OPENAI', 'ANTHROPIC', 'GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('OWNER', 'MEMBER');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"team_id" uuid,
	"onboarded" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_role" DEFAULT 'MEMBER' NOT NULL,
	"is_creator" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_team_user" UNIQUE("team_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "team_memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "team_role" DEFAULT 'MEMBER' NOT NULL,
	"invited_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '48:00:00'::interval) NOT NULL,
	CONSTRAINT "unique_team_email" UNIQUE("team_id","email"),
	CONSTRAINT "valid_email" CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
);
--> statement-breakpoint
ALTER TABLE "team_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "device_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text DEFAULT 'device check' NOT NULL,
	"key_id" text NOT NULL,
	"private_key_p8" text NOT NULL,
	"apple_team_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_team_apple_id" UNIQUE("team_id","apple_team_id")
);
--> statement-breakpoint
ALTER TABLE "device_checks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "provider_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"provider" "provider_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provider_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"bundle_id" text NOT NULL,
	"icon_url" text,
	"device_check_id" uuid,
	"key_id" uuid,
	"system_prompt" text,
	"default_user_prompt" text,
	"model" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"schema_config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"test_mode" boolean DEFAULT false,
	"test_key" text,
	"last_rate_limit_notified_at" timestamp with time zone,
	"notification_interval_seconds" integer,
	"notification_threshold" integer,
	CONSTRAINT "unique_team_bundle" UNIQUE("team_id","bundle_id"),
	CONSTRAINT "projects_test_key_key" UNIQUE("test_key")
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"plan" text DEFAULT 'trial',
	"email" text,
	"canceled_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"device_check_id" uuid,
	"key_id" uuid,
	"ip" text NOT NULL,
	"user_agent" text,
	"model" text NOT NULL,
	"provider" "provider_type" NOT NULL,
	"prompt_tokens" integer NOT NULL,
	"completion_tokens" integer NOT NULL,
	"total_tokens" integer NOT NULL,
	"finish_reason" "finish_reason" NOT NULL,
	"latency" integer NOT NULL,
	"response_code" integer NOT NULL,
	"prompt_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"completion_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"total_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"prompt" text,
	"response" text,
	"error_message" text,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"country_code" text,
	"region_code" text,
	"city" text,
	"longitude" double precision,
	"latitude" double precision
);
--> statement-breakpoint
ALTER TABLE "executions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_checks" ADD CONSTRAINT "device_checks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_keys" ADD CONSTRAINT "provider_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_device_check_id_fkey" FOREIGN KEY ("device_check_id") REFERENCES "public"."device_checks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "public"."provider_keys"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_device_check_id_fkey" FOREIGN KEY ("device_check_id") REFERENCES "public"."device_checks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executions" ADD CONSTRAINT "executions_key_id_fkey" FOREIGN KEY ("key_id") REFERENCES "public"."provider_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_team_memberships_user_id" ON "team_memberships" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_team_invitations_team_id" ON "team_invitations" USING btree ("team_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_device_checks_team_id" ON "device_checks" USING btree ("team_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_provider_keys_team_id" ON "provider_keys" USING btree ("team_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "allow select own profile" ON "users" AS PERMISSIVE FOR SELECT TO public USING ((( SELECT auth.uid() AS uid) = id));--> statement-breakpoint
CREATE POLICY "allow update own profile" ON "users" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "allow insert for authenticated users" ON "team_memberships" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "allow select own memberships" ON "team_memberships" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow delete invitations for team owners" ON "team_invitations" AS PERMISSIVE FOR DELETE TO public USING (is_owner_of(( SELECT auth.uid() AS uid), team_id));--> statement-breakpoint
CREATE POLICY "allow insert invitations for team owners" ON "team_invitations" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "allow select invitations for team members" ON "team_invitations" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow delete for team owners" ON "device_checks" AS PERMISSIVE FOR DELETE TO public USING (is_owner_of(( SELECT auth.uid() AS uid), team_id));--> statement-breakpoint
CREATE POLICY "allow insert for team owners" ON "device_checks" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "allow select for team members" ON "device_checks" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow update for team owners" ON "device_checks" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "allow delete for team owners" ON "provider_keys" AS PERMISSIVE FOR DELETE TO public USING (is_owner_of(( SELECT auth.uid() AS uid), team_id));--> statement-breakpoint
CREATE POLICY "allow insert for team owners" ON "provider_keys" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "allow select for team members" ON "provider_keys" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow update for team owners" ON "provider_keys" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "allow delete for team owners" ON "projects" AS PERMISSIVE FOR DELETE TO public USING (is_owner_of(( SELECT auth.uid() AS uid), team_id));--> statement-breakpoint
CREATE POLICY "allow insert for team owners" ON "projects" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "allow select for team members" ON "projects" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow update for team owners" ON "projects" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "allow delete for team owners" ON "teams" AS PERMISSIVE FOR DELETE TO public USING (is_owner_of(( SELECT auth.uid() AS uid), id));--> statement-breakpoint
CREATE POLICY "allow insert for authenticated users" ON "teams" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "allow select for team members" ON "teams" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "allow update for team owners" ON "teams" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "allow insert for team members" ON "executions" AS PERMISSIVE FOR INSERT TO public WITH CHECK (is_member_of(( SELECT auth.uid() AS uid), team_id));--> statement-breakpoint
CREATE POLICY "allow select for team members" ON "executions" AS PERMISSIVE FOR SELECT TO public;
*/
