drop function if exists "public"."storage_handle_empty_folder_placeholder"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_tokens_all(p_team_id uuid, date_from date, date_to date)
 RETURNS TABLE(date date, total_tokens integer)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.storage_extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
_parts text[];
_filename text;
begin
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2 (corrected to handle multiple dots)
    return substring(_filename from '\.([^.]*)$');
end
$function$
;

CREATE OR REPLACE FUNCTION public.storage_filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
declare
_parts text[];
begin
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
end
$function$
;

CREATE OR REPLACE FUNCTION public.storage_foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
declare
_parts text[];
begin
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
end
$function$
;


