-- Partial keys
create table public.provider_keys (
  id uuid primary key default gen_random_uuid (),
  team_id uuid not null references public.teams (id) on delete cascade,

  provider provider_type not null,
  is_active boolean not null default true,
  display_name TEXT not null,
  partial_key_server TEXT not null,
  created_at TIMESTAMPTZ not null default now(),
  updated_at TIMESTAMPTZ not null default now()
);

-- Enable RLS
alter table public.provider_keys enable row level security;

-- Policies
create policy "allow select for team members" on public.provider_keys
    for select using (public.is_member_of(auth.uid(), team_id));

create policy "allow insert for team owners" on public.provider_keys
    for insert with check (public.is_owner_of(auth.uid(), team_id));

create policy "allow update for team owners" on public.provider_keys
    for update using (public.is_owner_of(auth.uid(), team_id));

create policy "allow delete for team owners" on public.provider_keys
    for delete using (public.is_owner_of(auth.uid(), team_id));

-- Update trigger
create trigger provider_keys_updated_at before update
    on public.provider_keys for each row execute function update_updated_at();

-- Indexes
create index idx_provider_keys_team on public.provider_keys(team_id);
