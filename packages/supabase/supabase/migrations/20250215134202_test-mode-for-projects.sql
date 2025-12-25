-- Add test_mode and test_key columns to projects table
ALTER TABLE public.projects
  ADD COLUMN test_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN test_key TEXT;

-- Add index for test_key columns
CREATE INDEX idx_projects_test_mode_test_key ON public.projects (test_key);

-- Add unique constraint to test_key
ALTER TABLE public.projects
  ADD CONSTRAINT unique_test_key UNIQUE (test_key);

-- Add trigger to generate test_key if test_mode is enabled and clear it when disabled
CREATE OR REPLACE FUNCTION generate_test_key() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.test_mode THEN
    NEW.test_key := gen_random_uuid();
  ELSE
    NEW.test_key := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_test_key_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_test_key();




