-- Table and functions related to projects
create table if not exists public.projects (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  name TEXT not null,
  description TEXT not null,
  bundle_id TEXT not null,
  icon_url TEXT,
  device_check_id uuid references public.device_checks (id) on delete restrict,
  key_id uuid references public.provider_keys (id) on delete restrict,
  system_prompt TEXT,
  default_user_prompt TEXT,
  is_active BOOLEAN default true not null,
  schema_config JSONB default '{}'::JSONB,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  model TEXT,
  test_mode BOOLEAN default false,
  test_key TEXT unique,
  constraint unique_team_bundle unique (team_id, bundle_id)
);

alter table public.projects owner to postgres;

create index if not exists idx_projects_team on public.projects using btree (team_id);

create index if not exists idx_projects_device_check on public.projects using btree (device_check_id);

create index if not exists idx_projects_test_mode_test_key on public.projects using btree (test_key);

-- Function to generate test key when test_mode is enabled
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

alter function public.generate_test_key () owner to postgres;

grant all on function public.generate_test_key () to anon;

grant all on function public.generate_test_key () to authenticated;

grant all on function public.generate_test_key () to service_role;

-- Enable RLS
alter table public.projects enable row level security;

-- RLS Policies
create policy "allow select for team members" on public.projects for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert for team owners" on public.projects for insert
with
  check (public.is_owner_of (auth.uid (), team_id));

create policy "allow update for team owners" on public.projects
for update
  using (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete for team owners" on public.projects for delete using (public.is_owner_of (auth.uid (), team_id));

-- Update & Test Key Triggers (update_updated_at defined in 00_functions_pre.sql)
-- Note: Applying triggers might require a migration step.
-- create trigger generate_test_key_trigger before insert or update on public.projects for each row execute function public.generate_test_key ();
create trigger projects_updated_at before
update on public.projects for each row
execute function public.update_updated_at ();
