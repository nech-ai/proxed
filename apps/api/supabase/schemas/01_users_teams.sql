-- Tables and functions related to users, teams, memberships, and invitations
-- teams table
create table if not exists public.teams (
  id uuid default gen_random_uuid () not null primary key,
  name TEXT not null,
  avatar_url TEXT,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  plan TEXT default 'trial'::TEXT,
  email TEXT,
  canceled_at timestamp with time zone
);

alter table public.teams owner to postgres;

comment on column public.teams.plan is 'The subscription plan key for the team';

comment on column public.teams.email is 'The email address associated with team billing';

comment on column public.teams.canceled_at is 'Timestamp when the team plan was canceled';

-- users table
create table if not exists public.users (
  id uuid not null primary key,
  email TEXT unique not null,
  full_name TEXT,
  avatar_url TEXT,
  team_id uuid references public.teams (id) on delete set null,
  onboarded BOOLEAN default false,
  is_admin BOOLEAN default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.users owner to postgres;

alter table only public.users
add constraint fk_auth_user foreign key (id) references auth.users (id) on delete cascade;

-- team memberships table
create table if not exists public.team_memberships (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role public.team_role default 'MEMBER'::public.team_role not null,
  is_creator BOOLEAN default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint unique_team_user unique (team_id, user_id)
);

alter table public.team_memberships owner to postgres;

create index if not exists idx_team_memberships_team_user on public.team_memberships using btree (team_id, user_id);

create index if not exists idx_team_memberships_user on public.team_memberships using btree (user_id);

-- team invitations table
create table if not exists public.team_invitations (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  email TEXT not null,
  role public.team_role default 'MEMBER'::public.team_role not null,
  invited_by_id uuid references public.users (id) on delete set null,
  created_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone default (now() + '48:00:00'::INTERVAL) not null,
  constraint unique_team_email unique (team_id, email),
  constraint valid_email check (
    (
      email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::TEXT
    )
  )
);

alter table public.team_invitations owner to postgres;

create index if not exists idx_team_invitations_team on public.team_invitations using btree (team_id);

-- function to create a team and initial owner membership
create or replace function public.create_team (name CHARACTER VARYING) returns uuid language plpgsql security definer
set
  search_path = 'public' as $$
declare
    new_team_id uuid;
begin
    insert into teams (name) values (name) returning id into new_team_id;
    insert into team_memberships (user_id, team_id, role, is_creator) values (auth.uid(), new_team_id, 'OWNER', true);
    return new_team_id;
end;
$$;

alter function public.create_team (name CHARACTER VARYING) owner to postgres;

grant all on function public.create_team (name CHARACTER VARYING) to anon;

grant all on function public.create_team (name CHARACTER VARYING) to authenticated;

grant all on function public.create_team (name CHARACTER VARYING) to service_role;

-- function to handle new user creation from auth trigger
create or replace function public.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = 'public' as $$
declare
  new_team_id uuid;
begin
  -- insert into public.users
  insert into public.users (
    id,
    full_name,
    avatar_url,
    email
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  return new;
end;
$$;

alter function public.handle_new_user () owner to postgres;

-- Trigger (Note: Triggers themselves might not be fully declarative, consider applying manually or via migration)
-- create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user ();
grant all on function public.handle_new_user () to anon;

grant all on function public.handle_new_user () to authenticated;

grant all on function public.handle_new_user () to service_role;

-- helper function to check team membership
create or replace function public.is_member_of (_user_id uuid, _team_id uuid) returns BOOLEAN language sql security definer
set
  search_path = 'public' as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = _team_id and user_id = _user_id
  );
$$;

alter function public.is_member_of (_user_id uuid, _team_id uuid) owner to postgres;

grant all on function public.is_member_of (_user_id uuid, _team_id uuid) to anon;

grant all on function public.is_member_of (_user_id uuid, _team_id uuid) to authenticated;

grant all on function public.is_member_of (_user_id uuid, _team_id uuid) to service_role;

-- helper function to check team ownership
create or replace function public.is_owner_of (_user_id uuid, _team_id uuid) returns BOOLEAN language sql security definer
set
  search_path = 'public' as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = _team_id
    and user_id = _user_id
    and role = 'OWNER'
  );
$$;

alter function public.is_owner_of (_user_id uuid, _team_id uuid) owner to postgres;

grant all on function public.is_owner_of (_user_id uuid, _team_id uuid) to anon;

grant all on function public.is_owner_of (_user_id uuid, _team_id uuid) to authenticated;

grant all on function public.is_owner_of (_user_id uuid, _team_id uuid) to service_role;

-- Enable RLS
alter table public.users enable row level security;

alter table public.teams enable row level security;

alter table public.team_memberships enable row level security;

alter table public.team_invitations enable row level security;

-- RLS Policies (Note: Policies might need manual application or migration as declarative support is limited)
-- Users Policies
create policy "allow select own profile" on public.users for
select
  using ((auth.uid () = id));

create policy "allow update own profile" on public.users
for update
  using ((auth.uid () = id));

-- Teams Policies
create policy "allow select for team members" on public.teams for
select
  using (public.is_member_of (auth.uid (), id));

create policy "allow insert for authenticated users" on public.teams for insert
with
  check (true);

create policy "allow update for team owners" on public.teams
for update
  using (public.is_owner_of (auth.uid (), id));

create policy "allow delete for team owners" on public.teams for delete using (public.is_owner_of (auth.uid (), id));

-- Team Memberships Policies
create policy "allow select own memberships" on public.team_memberships for
select
  using ((auth.uid () = user_id));

create policy "allow insert for authenticated users" on public.team_memberships for insert
with
  check (true);

-- Add delete/update policies if needed based on application logic
-- Team Invitations Policies
create policy "allow select invitations for team members" on public.team_invitations for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert invitations for team owners" on public.team_invitations for insert
with
  check (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete invitations for team owners" on public.team_invitations for delete using (public.is_owner_of (auth.uid (), team_id));

-- Update Triggers (Function defined in 00_functions_pre.sql)
create trigger teams_updated_at before
update on public.teams for each row
execute function public.update_updated_at ();

create trigger users_updated_at before
update on public.users for each row
execute function public.update_updated_at ();

create trigger team_memberships_updated_at before
update on public.team_memberships for each row
execute function public.update_updated_at ();

-- Note: Trigger for team_invitations was commented out in 08_triggers.sql
-- Add if needed:
-- create trigger team_invitations_updated_at before update on public.team_invitations for each row execute function public.update_updated_at();
