revoke delete on table "private"."server_keys" from "anon";

revoke insert on table "private"."server_keys" from "anon";

revoke references on table "private"."server_keys" from "anon";

revoke select on table "private"."server_keys" from "anon";

revoke trigger on table "private"."server_keys" from "anon";

revoke truncate on table "private"."server_keys" from "anon";

revoke update on table "private"."server_keys" from "anon";

revoke delete on table "private"."server_keys" from "authenticated";

revoke insert on table "private"."server_keys" from "authenticated";

revoke references on table "private"."server_keys" from "authenticated";

revoke select on table "private"."server_keys" from "authenticated";

revoke trigger on table "private"."server_keys" from "authenticated";

revoke truncate on table "private"."server_keys" from "authenticated";

revoke update on table "private"."server_keys" from "authenticated";

alter table "private"."server_keys" drop constraint "unique_provider_key_id";

drop index if exists "private"."unique_provider_key_id";

CREATE UNIQUE INDEX server_keys_provider_key_id_key ON private.server_keys USING btree (provider_key_id);

alter table "private"."server_keys" add constraint "server_keys_provider_key_id_key" UNIQUE using index "server_keys_provider_key_id_key";


drop trigger if exists "team_invitations_updated_at" on "public"."team_invitations";

alter table "public"."projects" drop constraint "unique_test_key";

alter table "public"."users" drop constraint "fk_auth_user";

alter table "public"."users" drop constraint "fk_team";

drop index if exists "public"."idx_projects_test_mode_test_key";

drop index if exists "public"."unique_test_key";

alter table "public"."device_checks" alter column "name" set default 'device check'::text;

CREATE UNIQUE INDEX projects_test_key_key ON public.projects USING btree (test_key);

alter table "public"."projects" add constraint "projects_test_key_key" UNIQUE using index "projects_test_key_key";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."users" add constraint "users_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL not valid;

alter table "public"."users" validate constraint "users_team_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_team(name character varying)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    new_team_id uuid;
begin
    insert into teams (name) values (name) returning id into new_team_id;
    insert into team_memberships (user_id, team_id, role, is_creator) values (auth.uid(), new_team_id, 'OWNER', true);
    return new_team_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_executions_all(p_team_id uuid, date_from date, date_to date)
 RETURNS TABLE(date timestamp with time zone, execution_count integer)
 LANGUAGE plpgsql
AS $function$
begin
  if date_from > date_to then
    raise exception 'date_from must be before or equal to date_to';
  end if;
  return query
  with dates as (
    select
      date_trunc ('day', day_series)::timestamp with time zone as date
    from
      generate_series (
        date_from::timestamp,
        date_to::timestamp,
        interval '1 day'
      ) as day_series
  )
  select
    dates.date,
    coalesce (count (e.id), 0)::integer as execution_count
  from
    dates
    left join executions as e on date_trunc ('day', e.created_at) = dates.date
    and e.team_id = p_team_id
  group by
    dates.date
  order by
    dates.date;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_server_key(p_provider_key_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'private', 'public'
AS $function$
declare
  v_key_value text;
  v_team_id uuid;
begin
  -- get the team id for the provider key
  select team_id into v_team_id from public.provider_keys where id = p_provider_key_id;
  -- get the key value from private schema
  select key_value into v_key_value from private.server_keys where provider_key_id = p_provider_key_id;
  return v_key_value;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_team_limits_metrics(p_team_id uuid)
 RETURNS TABLE(projects_limit integer, projects_count integer, api_calls_limit integer, api_calls_used integer, api_calls_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_plan text;
  v_start_date date;
begin
  -- get the team's plan
  select plan, date_trunc('month', coalesce(canceled_at, now()))::date
  into v_plan, v_start_date
  from teams
  where id = p_team_id;

  -- calculate limits based on plan
  projects_limit := case
    when v_plan like 'starter-%' then 1
    when v_plan = 'trial' then 5
    else null -- null means unlimited
  end;

  -- get current projects count
  select count(*)::integer
  into projects_count
  from projects
  where team_id = p_team_id;

  -- set api calls limit based on plan
  api_calls_limit := case
    when v_plan like 'starter-%' then 1000
    when v_plan like 'pro-%' then 10000
    when v_plan like 'ultimate-%' then 50000
    when v_plan = 'trial' then 2000
    else null -- null means unlimited
  end;

  -- calculate api calls used this month
  select coalesce(sum(execution_count), 0)::integer
  into api_calls_used
  from get_executions_all(p_team_id, v_start_date, now()::date);

  -- calculate remaining api calls
  api_calls_remaining := case
    when api_calls_limit is null then null
    else greatest(0, api_calls_limit - api_calls_used)
  end;

  return next;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_server_key(p_provider_key_id uuid, p_key_value text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'private', 'public'
AS $function$
declare
  v_team_id uuid;
begin
  -- get the team id for the provider key
  select team_id into v_team_id from public.provider_keys where id = p_provider_key_id;
  -- check if the user is an owner of the team
  if not public.is_owner_of (auth.uid (), v_team_id) then raise exception 'only team owners can insert server keys';
  end if;
  -- insert the server key into private schema
  insert into
    private.server_keys (provider_key_id, key_value)
  values
    (p_provider_key_id, p_key_value);
end;
$function$
;


