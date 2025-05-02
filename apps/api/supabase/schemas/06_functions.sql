-- General utility functions and metrics calculations
-- Function to get daily execution counts for a team within a date range
create or replace function public.get_executions_all (p_team_id uuid, date_from date, date_to date) returns table (
  date timestamp with time zone,
  execution_count INTEGER
) language plpgsql as $$
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
$$;

alter function public.get_executions_all (p_team_id uuid, date_from date, date_to date) owner to postgres;

grant all on function public.get_executions_all (p_team_id uuid, date_from date, date_to date) to anon;

grant all on function public.get_executions_all (p_team_id uuid, date_from date, date_to date) to authenticated;

grant all on function public.get_executions_all (p_team_id uuid, date_from date, date_to date) to service_role;

-- Function to get team limits and current usage metrics based on plan
create or replace function public.get_team_limits_metrics (p_team_id uuid) returns table (
  projects_limit INTEGER,
  projects_count INTEGER,
  api_calls_limit INTEGER,
  api_calls_used INTEGER,
  api_calls_remaining INTEGER
) language plpgsql security definer
set
  search_path = public as $$
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
$$;

alter function public.get_team_limits_metrics (p_team_id uuid) owner to postgres;

comment on function public.get_team_limits_metrics (p_team_id uuid) is 'Returns the current usage metrics and limits for a team based on their plan';

grant all on function public.get_team_limits_metrics (p_team_id uuid) to anon;

grant all on function public.get_team_limits_metrics (p_team_id uuid) to authenticated;

grant all on function public.get_team_limits_metrics (p_team_id uuid) to service_role;

-- Function to check project rate limit, update notification timestamp, and return if notification should be sent
CREATE OR REPLACE FUNCTION public.check_and_notify_rate_limit (
  p_project_id UUID,
  p_team_id UUID -- Keep team_id for potential future use or logging
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public AS $$
DECLARE
    v_execution_count INT;
    v_last_notified TIMESTAMPTZ;
    v_notify BOOLEAN := FALSE;
    v_now TIMESTAMPTZ := now();
    v_threshold INT;
    v_interval_seconds INT;
BEGIN
    -- Fetch project-specific notification settings
    SELECT notification_threshold, notification_interval_seconds, last_rate_limit_notified_at
    INTO v_threshold, v_interval_seconds, v_last_notified
    FROM public.projects
    WHERE id = p_project_id;

    -- Only proceed if notification settings are configured for the project
    IF v_threshold IS NULL OR v_interval_seconds IS NULL THEN
        RETURN FALSE; -- Notifications not enabled or configured
    END IF;

    -- Check current execution count within the project's defined time window
    SELECT COUNT(*)
    INTO v_execution_count
    FROM public.executions
    WHERE project_id = p_project_id
      AND created_at >= (v_now - (v_interval_seconds * interval '1 second'));

    IF v_execution_count > v_threshold THEN
        -- Notify if no notification sent before or if last notification is older than the window
        IF v_last_notified IS NULL OR v_last_notified < (v_now - (v_interval_seconds * interval '1 second')) THEN
            -- Update the last notified timestamp *before* setting notify flag to reduce race conditions
            UPDATE public.projects
            SET last_rate_limit_notified_at = v_now
            WHERE id = p_project_id;

            v_notify := TRUE;
        END IF;
    END IF;

    RETURN v_notify;
END;
$$;

ALTER FUNCTION public.check_and_notify_rate_limit (UUID, UUID) OWNER TO postgres;

-- Grant execution permission to the authenticated role (or service_role if called server-side)
GRANT
EXECUTE ON FUNCTION public.check_and_notify_rate_limit (UUID, UUID) TO authenticated;

GRANT
EXECUTE ON FUNCTION public.check_and_notify_rate_limit (UUID, UUID) TO service_role;
