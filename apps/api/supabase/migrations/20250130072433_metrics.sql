CREATE
OR REPLACE FUNCTION public.get_executions_all (p_team_id uuid, date_from date, date_to date) RETURNS TABLE (date timestamp with time zone, execution_count INTEGER) LANGUAGE plpgsql AS $function$ BEGIN IF date_from > date_to THEN RAISE EXCEPTION 'date_from must be before or equal to date_to';
END IF;
RETURN QUERY WITH dates AS (
  SELECT date_trunc('day', day_series)::timestamp with time zone AS date
  FROM generate_series(
      date_from::timestamp,
      date_to::timestamp,
      interval '1 day'
    ) AS day_series
)
SELECT dates.date,
  COALESCE(COUNT(e.id), 0)::integer AS execution_count
FROM dates
  LEFT JOIN executions AS e ON date_trunc('day', e.created_at) = dates.date
  AND e.team_id = p_team_id
GROUP BY dates.date
ORDER BY dates.date;
END;
$function$;
