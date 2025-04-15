-- Migration: Update generate_test_key function
-- Purpose: Modify the trigger function for project test keys.
-- Behavior:
--   - On INSERT or UPDATE (test_mode: FALSE -> TRUE): Generate a key only if one doesn't exist.
--   - On UPDATE (test_mode: TRUE -> FALSE): Purge (nullify) the existing key.
--   - Otherwise, the key remains unchanged.

-- Ensure the trigger exists before dropping (optional, but safer)
DROP TRIGGER IF EXISTS generate_test_key_trigger ON public.projects;

-- Drop existing function (if it exists) to replace it
drop function if exists public.generate_test_key ();

-- Create the updated function
create or replace function public.generate_test_key () returns trigger language plpgsql as $$
begin
  -- Check if test_mode changed from FALSE to TRUE or is TRUE on INSERT
  if new.test_mode and (TG_OP = 'INSERT' or not old.test_mode) then
    -- Generate a key only if it doesn't already have one
    if new.test_key is null then
      new.test_key := gen_random_uuid ();
    end if;
  -- Check if test_mode changed from TRUE to FALSE on UPDATE
  elsif not new.test_mode and TG_OP = 'UPDATE' and old.test_mode then
    -- Purge the key
    new.test_key := null;
  end if;
  return new;
end;
$$;

-- Set function owner
alter function public.generate_test_key () owner to postgres;

-- Grant execute permissions
-- Note: Granting to anon might not be necessary depending on usage, but matches the schema definition.
grant all on function public.generate_test_key () to anon;

grant all on function public.generate_test_key () to authenticated;

grant all on function public.generate_test_key () to service_role;

-- Re-apply the trigger using the updated function
-- Create the trigger
CREATE TRIGGER generate_test_key_trigger BEFORE INSERT
OR
UPDATE ON public.projects FOR EACH ROW
EXECUTE FUNCTION public.generate_test_key ();
