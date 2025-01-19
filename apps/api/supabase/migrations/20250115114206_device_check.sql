-- Device Check configuration table
create table public.device_checks (
    id uuid primary key default gen_random_uuid(),
    team_id uuid not null references public.teams(id) on delete cascade,
    name text not null default 'Device Check',
    key_id text not null,
    private_key_p8 text not null,
    apple_team_id text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint unique_team_apple_id unique (team_id, apple_team_id)
);

-- Enable RLS
alter table public.device_checks enable row level security;

-- Policies
create policy "allow select for team members" on public.device_checks
    for select using (public.is_member_of(auth.uid(), team_id));

create policy "allow insert for team owners" on public.device_checks
    for insert with check (public.is_owner_of(auth.uid(), team_id));

create policy "allow update for team owners" on public.device_checks
    for update using (public.is_owner_of(auth.uid(), team_id));

create policy "allow delete for team owners" on public.device_checks
    for delete using (public.is_owner_of(auth.uid(), team_id));

-- Update trigger
create trigger device_checks_updated_at before update
    on public.device_checks for each row execute function update_updated_at();

-- Indexes
create index idx_device_checks_team on public.device_checks(team_id);
