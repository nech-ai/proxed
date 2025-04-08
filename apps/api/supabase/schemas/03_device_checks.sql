-- Table and policies for Apple Device Check configuration
create table if not exists public.device_checks (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  name TEXT default 'device check'::TEXT not null,
  key_id TEXT not null,
  private_key_p8 TEXT not null, -- Consider storing this securely, maybe in vault?
  apple_team_id TEXT not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint unique_team_apple_id unique (team_id, apple_team_id)
);

alter table public.device_checks owner to postgres;

create index if not exists idx_device_checks_team on public.device_checks using btree (team_id);

-- Enable RLS
alter table public.device_checks enable row level security;

-- RLS Policies
create policy "allow select for team members" on public.device_checks for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert for team owners" on public.device_checks for insert
with
  check (public.is_owner_of (auth.uid (), team_id));

create policy "allow update for team owners" on public.device_checks
for update
  using (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete for team owners" on public.device_checks for delete using (public.is_owner_of (auth.uid (), team_id));

-- Update Trigger (Define function in 06_functions.sql, apply trigger here)
-- Note: Applying triggers might require a migration step.
-- create trigger device_checks_updated_at before update on public.device_checks for each row execute function public.update_updated_at ();
