-- Table and policies for stored vault objects
create table if not exists public.vault_objects (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  execution_id uuid references public.executions (id) on delete set null,
  bucket TEXT not null,
  path_tokens TEXT[] not null,
  mime_type TEXT not null,
  size_bytes INTEGER,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.vault_objects owner to postgres;

create index if not exists idx_vault_objects_team on public.vault_objects using btree (team_id);

create index if not exists idx_vault_objects_project on public.vault_objects using btree (project_id);

create index if not exists idx_vault_objects_execution on public.vault_objects using btree (execution_id);

create index if not exists idx_vault_objects_created_at on public.vault_objects using btree (created_at desc);

-- Enable RLS
alter table public.vault_objects enable row level security;

-- RLS Policies
create policy "allow select for team members" on public.vault_objects for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert for team members" on public.vault_objects for insert
with
  check (public.is_member_of (auth.uid (), team_id));

create policy "allow update for team owners" on public.vault_objects
for update
  using (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete for team owners" on public.vault_objects for delete using (public.is_owner_of (auth.uid (), team_id));

-- Update Trigger (Function defined in 00_functions_pre.sql)
create trigger vault_objects_updated_at before
update on public.vault_objects for each row
execute function public.update_updated_at ();
