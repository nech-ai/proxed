drop function if exists "public"."check_and_notify_rate_limit"(p_project_id uuid, p_team_id uuid, p_time_window_seconds integer, p_call_threshold integer);

alter table "public"."projects" add column "notification_interval_seconds" integer;

alter table "public"."projects" add column "notification_threshold" integer;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_and_notify_rate_limit(p_project_id uuid, p_team_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;


