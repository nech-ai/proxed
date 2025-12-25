set check_function_bodies = off;

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
  select plan
  into v_plan
  from teams
  where id = p_team_id;

  -- set the start date to the beginning of the current month for usage calculation
  v_start_date := date_trunc('month', now())::date;

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


