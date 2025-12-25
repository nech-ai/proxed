-- Custom ENUM types used across the database
CREATE TYPE "public"."finish_reason" AS ENUM(
  'stop',
  'length',
  'content-filter',
  'tool-calls',
  'error',
  'other',
  'unknown'
);

ALTER TYPE "public"."finish_reason" OWNER TO "postgres";

CREATE TYPE "public"."provider_type" AS ENUM('OPENAI', 'ANTHROPIC', 'GOOGLE');

ALTER TYPE "public"."provider_type" OWNER TO "postgres";

CREATE TYPE "public"."team_role" AS ENUM('OWNER', 'MEMBER');

ALTER TYPE "public"."team_role" OWNER TO "postgres";
