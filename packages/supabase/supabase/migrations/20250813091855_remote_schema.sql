DO $$
DECLARE
  _owner text;
BEGIN
  SELECT r.rolname
    INTO _owner
  FROM pg_extension AS ext
  JOIN pg_roles AS r
    ON r.oid = ext.extowner
  WHERE ext.extname = 'pg_net';

  IF _owner IS NULL THEN
    -- extension not installed
  ELSIF _owner = current_user THEN
    EXECUTE 'DROP EXTENSION IF EXISTS "pg_net"';
  ELSE
    RAISE NOTICE 'Skipping drop of pg_net extension owned by %', _owner;
  END IF;
END $$;

DO $$
DECLARE
  _owner text;
BEGIN
  SELECT r.rolname
    INTO _owner
  FROM pg_extension AS ext
  JOIN pg_roles AS r
    ON r.oid = ext.extowner
  WHERE ext.extname = 'pgjwt';

  IF _owner IS NULL THEN
    -- extension not installed
  ELSIF _owner = current_user THEN
    EXECUTE 'DROP EXTENSION IF EXISTS "pgjwt"';
  ELSE
    RAISE NOTICE 'Skipping drop of pgjwt extension owned by %', _owner;
  END IF;
END $$;

set check_function_bodies = off;

DO $$
DECLARE
  _owner text;
BEGIN
  SELECT r.rolname
    INTO _owner
  FROM pg_proc AS p
  JOIN pg_namespace AS n
    ON n.oid = p.pronamespace
  JOIN pg_roles AS r
    ON r.oid = p.proowner
  WHERE n.nspname = 'extensions'
    AND p.proname = 'grant_pg_net_access';

  IF _owner IS NOT NULL AND _owner <> current_user THEN
    RAISE NOTICE 'Skipping update of extensions.grant_pg_net_access owned by %', _owner;
  ELSE
    EXECUTE $fn$
    CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
     RETURNS event_trigger
     LANGUAGE plpgsql
    AS $function$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_event_trigger_ddl_commands() AS ev
          JOIN pg_extension AS ext
          ON ev.objid = ext.oid
          WHERE ext.extname = 'pg_net'
        )
        THEN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'supabase_functions_admin'
          )
          THEN
            CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
          END IF;

          GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

          IF EXISTS (
            SELECT FROM pg_extension
            WHERE extname = 'pg_net'
            -- all versions in use on existing projects as of 2025-02-20
            -- version 0.12.0 onwards don't need these applied
            AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
          ) THEN
            ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
            ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

            ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
            ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

            REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
            REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

            GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
            GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
          END IF;
        END IF;
      END;
      $function$
    ;
    $fn$;
  END IF;
END $$;
