-- Create server_keys table to store sensitive parts of API keys
CREATE TABLE public.server_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  provider_key_id UUID NOT NULL REFERENCES public.provider_keys (id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_provider_key_id UNIQUE (provider_key_id)
);

-- Enable RLS
ALTER TABLE public.server_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert only for team owners
CREATE POLICY "allow insert for team owners" ON public.server_keys FOR INSERT
WITH
  CHECK (
    public.is_owner_of (
      auth.uid (),
      (
        SELECT
          team_id
        FROM
          public.provider_keys
        WHERE
          id = provider_key_id
      )
    )
  );

-- No select, update, or delete policies - this makes the keys unreadable
-- Update trigger
CREATE TRIGGER server_keys_updated_at BEFORE
UPDATE ON public.server_keys FOR EACH ROW
EXECUTE FUNCTION update_updated_at ();

-- Create index
CREATE INDEX idx_server_keys_provider_key_id ON public.server_keys (provider_key_id);

-- Create a function to securely access key value with proper authorization
CREATE OR REPLACE FUNCTION public.get_server_key (p_provider_key_id UUID) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public AS $$
DECLARE
  v_key_value TEXT;
  v_team_id UUID;
BEGIN
  -- Get the team ID for the provider key
  SELECT team_id INTO v_team_id
  FROM provider_keys
  WHERE id = p_provider_key_id;

  -- Check if the user is a member of the team
  IF NOT public.is_member_of(auth.uid(), v_team_id) THEN
    RAISE EXCEPTION 'Unauthorized access to server key';
  END IF;

  -- Get the key value
  SELECT key_value INTO v_key_value
  FROM server_keys
  WHERE provider_key_id = p_provider_key_id;

  RETURN v_key_value;
END;
$$;

-- Create a function to safely insert a server key
CREATE OR REPLACE FUNCTION public.insert_server_key (p_provider_key_id UUID, p_key_value TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = public AS $$
DECLARE
  v_team_id UUID;
BEGIN
  -- Get the team ID for the provider key
  SELECT team_id INTO v_team_id
  FROM provider_keys
  WHERE id = p_provider_key_id;

  -- Check if the user is an owner of the team
  IF NOT public.is_owner_of(auth.uid(), v_team_id) THEN
    RAISE EXCEPTION 'Only team owners can insert server keys';
  END IF;

  -- Insert the server key
  INSERT INTO server_keys (provider_key_id, key_value)
  VALUES (p_provider_key_id, p_key_value);
END;
$$;

-- Grant permissions to authenticated users for the insert function
GRANT
EXECUTE ON FUNCTION public.insert_server_key (UUID, TEXT) TO authenticated;

GRANT
EXECUTE ON FUNCTION public.get_server_key (UUID) TO authenticated;

-- Now, migrate existing data by first adding a column to copy data
ALTER TABLE public.provider_keys
ADD COLUMN temp_key_value TEXT;

-- Copy the values to the temporary column
UPDATE public.provider_keys
SET
  temp_key_value = partial_key_server;

-- Create a migration function to move data to the new table
CREATE OR REPLACE FUNCTION migrate_server_keys () RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, temp_key_value FROM public.provider_keys WHERE temp_key_value IS NOT NULL LOOP
    INSERT INTO public.server_keys (provider_key_id, key_value)
    VALUES (r.id, r.temp_key_value);
  END LOOP;
END;
$$;

-- Execute the migration
SELECT
  migrate_server_keys ();

-- Drop the temporary column and migration function
ALTER TABLE public.provider_keys
DROP COLUMN temp_key_value;

DROP FUNCTION migrate_server_keys ();

-- Remove the partial_key_server from provider_keys
ALTER TABLE public.provider_keys
DROP COLUMN partial_key_server;
