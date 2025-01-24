-- Projects table
create table public.projects (
    id uuid primary key default gen_random_uuid(),
    team_id uuid not null references public.teams(id) on delete cascade,
    name text not null,
    description text not null,
    bundle_id text not null,
    icon_url text,
    device_check_id uuid references public.device_checks(id) on delete restrict,
    key_id uuid references public.provider_keys(id) on delete restrict,

    system_prompt text,
    default_user_prompt text,

    is_active boolean not null default true,

    schema_config jsonb default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_team_bundle unique (team_id, bundle_id)
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "allow select for team members" on public.projects
    for select using (public.is_member_of(auth.uid(), team_id));

create policy "allow insert for team owners" on public.projects
    for insert with check (public.is_owner_of(auth.uid(), team_id));

create policy "allow update for team owners" on public.projects
    for update using (public.is_owner_of(auth.uid(), team_id));

create policy "allow delete for team owners" on public.projects
    for delete using (public.is_owner_of(auth.uid(), team_id));

-- Update trigger
create trigger projects_updated_at before update
    on public.projects for each row execute function update_updated_at();

-- Indexes
create index idx_projects_team on public.projects(team_id);
create index idx_projects_device_check on public.projects(device_check_id);
