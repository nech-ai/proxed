-- Table and policies for tracking LLM executions
create table if not exists public.executions (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  device_check_id uuid references public.device_checks (id) on delete set null,
  key_id uuid references public.provider_keys (id) on delete set null,
  ip TEXT not null,
  user_agent TEXT,
  model TEXT not null,
  provider public.provider_type not null,
  prompt_tokens INTEGER not null,
  completion_tokens INTEGER not null,
  total_tokens INTEGER not null,
  finish_reason public.finish_reason not null,
  latency INTEGER not null,
  response_code INTEGER not null,
  prompt_cost NUMERIC(10, 6) default 0 not null,
  completion_cost NUMERIC(10, 6) default 0 not null,
  total_cost NUMERIC(10, 6) default 0 not null,
  prompt TEXT,
  response TEXT,
  error_message TEXT,
  error_code TEXT,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  country_code TEXT,
  region_code TEXT,
  city TEXT,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION
);

alter table public.executions owner to postgres;

create index if not exists idx_executions_team on public.executions using btree (team_id);

create index if not exists idx_executions_project on public.executions using btree (project_id);

create index if not exists idx_executions_created_at on public.executions using btree (created_at);

create index if not exists idx_executions_provider on public.executions using btree (provider);

create index if not exists idx_executions_model on public.executions using btree (model);

create index if not exists idx_executions_location on public.executions using btree (country_code, region_code);

-- Enable RLS
alter table public.executions enable row level security;

-- RLS Policies
create policy "allow select for team members" on public.executions for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert for team members" on public.executions for insert
with
  check (public.is_member_of (auth.uid (), team_id));

-- Update Trigger (Define function in 06_functions.sql, apply trigger here)
-- Note: Applying triggers might require a migration step.
-- create trigger executions_updated_at before update on public.executions for each row execute function public.update_updated_at ();
