-- create type for team roles
create type team_role as ENUM('OWNER', 'MEMBER');

-- create teams table
create table public.teams (
  id uuid primary key default gen_random_uuid (),
  name TEXT not null,
  avatar_url TEXT,
  created_at TIMESTAMPTZ not null default now(),
  updated_at TIMESTAMPTZ not null default now()
);

alter table public.teams owner to postgres;

-- create users table
create table public.users (
  id uuid primary key,
  email TEXT unique not null,
  full_name TEXT,
  avatar_url TEXT,
  team_id uuid,
  onboarded BOOLEAN default false,
  is_admin BOOLEAN default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint fk_auth_user foreign key (id) references auth.users (id) on delete cascade,
  constraint fk_team foreign key (team_id) references public.teams (id) on delete set null
);

alter table public.users owner to postgres;

-- create team memberships table
create table public.team_memberships (
  id uuid primary key default gen_random_uuid (),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role team_role not null default 'MEMBER',
  is_creator BOOLEAN not null default false,
  created_at TIMESTAMPTZ not null default now(),
  updated_at TIMESTAMPTZ not null default now(),
  constraint unique_team_user unique (team_id, user_id)
);

alter table public.team_memberships owner to postgres;

-- create team invitations table
create table public.team_invitations (
  id uuid primary key default gen_random_uuid (),
  team_id uuid not null references public.teams (id) on delete cascade,
  email TEXT not null,
  role team_role not null default 'MEMBER',
  invited_by_id uuid references public.users (id) on delete set null,
  created_at TIMESTAMPTZ not null default now(),
  expires_at TIMESTAMPTZ not null default now() + INTERVAL '48 hours',
  constraint unique_team_email unique (team_id, email),
  constraint valid_email check (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

alter table public.team_invitations owner to postgres;

-- function to create a team
create or replace function public.create_team (name CHARACTER VARYING) returns uuid language plpgsql security definer
set
  search_path to 'public' as $$
declare
    new_team_id uuid;
begin
    insert into teams (name) values (name) returning id into new_team_id;
    insert into team_memberships (user_id, team_id, role, is_creator) values (auth.uid(), new_team_id, 'OWNER', true);

    return new_team_id;
end;
$$;

alter function public.create_team owner to postgres;

-- helper functions for RLS policies
create or replace function public.is_member_of (_user_id uuid, _team_id uuid) returns BOOLEAN as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = _team_id and user_id = _user_id
  );
$$ language sql security definer
set
  search_path = 'public';

create or replace function public.is_owner_of (_user_id uuid, _team_id uuid) returns BOOLEAN as $$
  select exists (
    select 1 from public.team_memberships
    where team_id = _team_id
    and user_id = _user_id
    and role = 'OWNER'
  );
$$ language sql security definer
set
  search_path = 'public';

-- enable row level security (rls)
alter table public.users enable row level security;

alter table public.teams enable row level security;

alter table public.team_memberships enable row level security;

alter table public.team_invitations enable row level security;

-- create a policy to allow users to read their own profile
create policy "allow select own profile" on public.users for
select
  using (auth.uid () = id);

-- create a policy to allow users to update their own profile
create policy "allow update own profile" on public.users
for update
  using (auth.uid () = id);

-- teams policies
create policy "allow select for team members" on public.teams for
select
  using (public.is_member_of (auth.uid (), id));

create policy "allow insert for authenticated users" on public.teams for insert
with
  check (true);

create policy "allow insert for authenticated users" on public.team_memberships for insert
with
  check (true);

create policy "allow update for team owners" on public.teams
for update
  using (public.is_owner_of (auth.uid (), id));

create policy "allow delete for team owners" on public.teams for delete using (public.is_owner_of (auth.uid (), id));

-- team memberships policies
create policy "allow select own memberships" on public.team_memberships for
select
  using (auth.uid () = user_id);

-- team invitations policies
create policy "allow select invitations for team members" on public.team_invitations for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert invitations for team owners" on public.team_invitations for insert
with
  check (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete invitations for team owners" on public.team_invitations for delete using (public.is_owner_of (auth.uid (), team_id));

-- grant permissions to the anonymous role
grant all on function public.create_team ("name" CHARACTER VARYING) to anon;

grant all on function public.create_team ("name" CHARACTER VARYING) to authenticated;

grant all on function public.create_team ("name" CHARACTER VARYING) to service_role;

-- create a trigger to update the updated_at column
create or replace function update_updated_at () returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer
set
  search_path = 'public';

create trigger users_updated_at before
update on public.users for each row
execute function update_updated_at ();

create trigger teams_updated_at before
update on public.teams for each row
execute function update_updated_at ();

create trigger team_memberships_updated_at before
update on public.team_memberships for each row
execute function update_updated_at ();

create trigger team_invitations_updated_at before
update on public.team_invitations for each row
execute function update_updated_at ();

-- create indexes
create index idx_team_memberships_team_user on public.team_memberships (team_id, user_id);

create index idx_team_memberships_user on public.team_memberships (user_id);

create index idx_team_invitations_team on public.team_invitations (team_id);
