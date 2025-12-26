-- Move server_keys table to private schema
ALTER TABLE public.server_keys
SET SCHEMA private;

-- Update the get_server_key function to reference the private schema
CREATE OR REPLACE FUNCTION public.get_server_key (p_provider_key_id UUID) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = private,
  public AS $$
DECLARE
  v_key_value TEXT;
  v_team_id UUID;
BEGIN
  -- Get the team ID for the provider key
  SELECT team_id INTO v_team_id
  FROM public.provider_keys
  WHERE id = p_provider_key_id;

  -- Get the key value from private schema
  SELECT key_value INTO v_key_value
  FROM private.server_keys
  WHERE provider_key_id = p_provider_key_id;

  RETURN v_key_value;
END;
$$;

-- Update the insert_server_key function to reference the private schema
CREATE OR REPLACE FUNCTION public.insert_server_key (p_provider_key_id UUID, p_key_value TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = private,
  public AS $$
DECLARE
  v_team_id UUID;
BEGIN
  -- Get the team ID for the provider key
  SELECT team_id INTO v_team_id
  FROM public.provider_keys
  WHERE id = p_provider_key_id;

  -- Check if the user is an owner of the team
  IF NOT public.is_owner_of(auth.uid(), v_team_id) THEN
    RAISE EXCEPTION 'Only team owners can insert server keys';
  END IF;

  -- Insert the server key into private schema
  INSERT INTO private.server_keys(provider_key_id, key_value)
  VALUES (p_provider_key_id, p_key_value);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT
EXECUTE ON FUNCTION public.get_server_key (UUID) TO authenticated;

GRANT
EXECUTE ON FUNCTION public.insert_server_key (UUID, TEXT) TO authenticated;

-- Ensure search_path is reset for security
ALTER FUNCTION public.get_server_key
SET
  search_path = private,
  public;

ALTER FUNCTION public.insert_server_key
SET
  search_path = private,
  public;

-- Set ownership of the functions to postgres
ALTER FUNCTION public.get_server_key OWNER TO postgres;

ALTER FUNCTION public.insert_server_key OWNER TO postgres;
