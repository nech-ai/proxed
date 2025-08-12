CREATE OR REPLACE FUNCTION public.get_tokens_all(
  p_team_id uuid,
  date_from date,
  date_to date
)
RETURNS TABLE (
  date timestamp with time zone,
  total_tokens integer
)
LANGUAGE plpgsql
AS $function$
begin
  if date_from > date_to then
    raise exception 'date_from must be before or equal to date_to';
  end if;

  return query
  with dates as (
    select date_trunc('day', day_series)::timestamp with time zone as date
    from generate_series(
      date_from::timestamp,
      date_to::timestamp,
      interval '1 day'
    ) as day_series
  )
  select
    dates.date,
    coalesce(sum(e.total_tokens), 0)::integer as total_tokens
  from dates
  left join executions as e
    on date_trunc('day', e.created_at) = dates.date
    and e.team_id = p_team_id
  group by dates.date
  order by dates.date;
end;
$function$;

-- Grants
alter function public.get_tokens_all(p_team_id uuid, date_from date, date_to date) owner to postgres;
grant all on function public.get_tokens_all(p_team_id uuid, date_from date, date_to date) to anon;
grant all on function public.get_tokens_all(p_team_id uuid, date_from date, date_to date) to authenticated;
grant all on function public.get_tokens_all(p_team_id uuid, date_from date, date_to date) to service_role;