-- Make device_check_id and key_id nullable and update foreign key constraints
ALTER TABLE public.executions
  ALTER COLUMN device_check_id DROP NOT NULL,
  ALTER COLUMN key_id DROP NOT NULL;

-- Drop existing foreign key constraints
ALTER TABLE public.executions
  DROP CONSTRAINT executions_device_check_id_fkey,
  DROP CONSTRAINT executions_key_id_fkey;

-- Add new foreign key constraints with SET NULL on delete
ALTER TABLE public.executions
  ADD CONSTRAINT executions_device_check_id_fkey
    FOREIGN KEY (device_check_id)
    REFERENCES public.device_checks(id)
    ON DELETE SET NULL,
  ADD CONSTRAINT executions_key_id_fkey
    FOREIGN KEY (key_id)
    REFERENCES public.provider_keys(id)
    ON DELETE SET NULL;

-- Add location columns
ALTER TABLE public.executions
  ADD COLUMN country_code TEXT,
  ADD COLUMN region_code TEXT,
  ADD COLUMN city TEXT,
  ADD COLUMN longitude DOUBLE PRECISION,
  ADD COLUMN latitude DOUBLE PRECISION;

-- Add index for location queries
CREATE INDEX idx_executions_location ON public.executions (country_code, region_code);
