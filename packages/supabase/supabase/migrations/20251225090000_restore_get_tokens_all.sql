-- Ensure token metrics RPC exists (required by API metrics charts)
create or replace function public.get_tokens_all (
  p_team_id uuid,
  date_from date,
  date_to date
) returns table (
  date date,
  total_tokens integer
) language plpgsql as $$
begin
  if date_from > date_to then
    raise exception 'date_from must be before or equal to date_to';
  end if;
  return query
  with dates as (
    select (day_series)::date as date
    from generate_series(
      date_from::date,
      date_to::date,
      interval '1 day'
    ) as day_series
  )
  select
    dates.date,
    coalesce (sum (case when e.total_tokens is not null and e.total_tokens > 0 then e.total_tokens else coalesce(e.prompt_tokens, 0) + coalesce(e.completion_tokens, 0) end), 0)::integer as total_tokens
  from
    dates
    left join executions as e on e.created_at::date = dates.date and e.team_id = p_team_id
  group by
    dates.date
  order by
    dates.date;
end;
$$;

alter function public.get_tokens_all (p_team_id uuid, date_from date, date_to date) owner to postgres;

grant all on function public.get_tokens_all (p_team_id uuid, date_from date, date_to date) to anon;

grant all on function public.get_tokens_all (p_team_id uuid, date_from date, date_to date) to authenticated;

grant all on function public.get_tokens_all (p_team_id uuid, date_from date, date_to date) to service_role;
