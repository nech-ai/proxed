-- Create ENUM for finish reason
CREATE TYPE finish_reason AS ENUM(
  'stop',
  'length',
  'content-filter',
  'tool-calls',
  'error',
  'other',
  'unknown'
);

-- Executions table for tracking LLM calls
CREATE TABLE public.executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  -- Foreign keys
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  device_check_id UUID NOT NULL REFERENCES public.device_checks (id) ON DELETE CASCADE,
  key_id UUID NOT NULL REFERENCES public.provider_keys (id) ON DELETE CASCADE,
  -- Request metadata
  ip TEXT NOT NULL,
  user_agent TEXT,
  model TEXT NOT NULL,
  provider provider_type NOT NULL,
  -- Token usage
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  -- Response metadata
  finish_reason finish_reason NOT NULL,
  latency INTEGER NOT NULL, -- in milliseconds
  response_code INTEGER NOT NULL,
  -- Cost tracking (in USD)
  prompt_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  completion_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  -- Content (optional for debugging/logging)
  prompt TEXT,
  response TEXT,
  -- Error handling
  error_message TEXT,
  error_code TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "allow select for team members" ON public.executions FOR
SELECT
  USING (public.is_member_of (auth.uid (), team_id));

CREATE POLICY "allow insert for team members" ON public.executions FOR INSERT
WITH
  CHECK (public.is_member_of (auth.uid (), team_id));

-- Update trigger
CREATE TRIGGER executions_updated_at BEFORE
UPDATE ON public.executions FOR EACH ROW
EXECUTE FUNCTION update_updated_at ();

-- Indexes
CREATE INDEX idx_executions_team ON public.executions (team_id);

CREATE INDEX idx_executions_project ON public.executions (project_id);

CREATE INDEX idx_executions_created_at ON public.executions (created_at);

CREATE INDEX idx_executions_provider ON public.executions (provider);

CREATE INDEX idx_executions_model ON public.executions (model);
