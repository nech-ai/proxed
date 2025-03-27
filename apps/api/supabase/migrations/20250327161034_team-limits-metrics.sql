-- Function to get team limits based on their plan
create or replace function public.get_team_limits_metrics(p_team_id uuid)
returns table (
  projects_limit integer,
  projects_count integer,
  api_calls_limit integer,
  api_calls_used integer,
  api_calls_remaining integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_start_date date;
begin
  -- Get the team's plan
  select plan, date_trunc('month', coalesce(canceled_at, now()))::date
  into v_plan, v_start_date
  from teams
  where id = p_team_id;

  -- Calculate limits based on plan
  projects_limit := case
    when v_plan like 'starter-%' then 1
    else null -- null means unlimited
  end;

  -- Get current projects count
  select count(*)::integer
  into projects_count
  from projects
  where team_id = p_team_id;

  -- Set API calls limit based on plan
  api_calls_limit := case
    when v_plan like 'starter-%' then 1000
    when v_plan like 'pro-%' then 10000
    when v_plan like 'ultimate-%' then 50000
    else null -- null means unlimited
  end;

  -- Calculate API calls used this month
  select coalesce(sum(execution_count), 0)::integer
  into api_calls_used
  from get_executions_all(p_team_id, v_start_date, now()::date);

  -- Calculate remaining API calls
  api_calls_remaining := case
    when api_calls_limit is null then null
    else greatest(0, api_calls_limit - api_calls_used)
  end;

  return next;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_team_limits_metrics(uuid) to authenticated;

-- Add comment
comment on function public.get_team_limits_metrics(uuid) is 'Returns the current usage metrics and limits for a team based on their plan';
