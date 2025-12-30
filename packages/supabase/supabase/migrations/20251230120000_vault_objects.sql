-- Vault objects table for stored files
create table if not exists public.vault_objects (
    id uuid primary key default gen_random_uuid(),
    team_id uuid not null references public.teams(id) on delete cascade,
    project_id uuid not null references public.projects(id) on delete cascade,
    execution_id uuid references public.executions(id) on delete set null,
    bucket text not null,
    path_tokens text[] not null,
    mime_type text not null,
    size_bytes integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.vault_objects enable row level security;

create policy "allow select for team members" on public.vault_objects
    for select using (public.is_member_of(auth.uid(), team_id));

create policy "allow insert for team members" on public.vault_objects
    for insert with check (public.is_member_of(auth.uid(), team_id));

create policy "allow update for team owners" on public.vault_objects
    for update using (public.is_owner_of(auth.uid(), team_id));

create policy "allow delete for team owners" on public.vault_objects
    for delete using (public.is_owner_of(auth.uid(), team_id));

create trigger vault_objects_updated_at before update
    on public.vault_objects for each row execute function update_updated_at();

create index if not exists idx_vault_objects_team on public.vault_objects(team_id);
create index if not exists idx_vault_objects_project on public.vault_objects(project_id);
create index if not exists idx_vault_objects_execution on public.vault_objects(execution_id);
create index if not exists idx_vault_objects_created_at on public.vault_objects(created_at desc);
