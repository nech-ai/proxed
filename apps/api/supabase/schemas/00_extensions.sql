-- Database extensions required by the application
CREATE EXTENSION IF NOT EXISTS "pgsodium";

CREATE SCHEMA IF NOT EXISTS "private";

ALTER SCHEMA "private" OWNER TO "postgres";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql"
WITH
  SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt"
WITH
  SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault"
WITH
  SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH
  SCHEMA "extensions";
