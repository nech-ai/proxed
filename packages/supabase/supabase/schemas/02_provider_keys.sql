-- Tables and functions related to provider API keys
-- Provider keys table (public part)
create table if not exists public.provider_keys (
  id uuid default gen_random_uuid () not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  provider public.provider_type not null,
  is_active BOOLEAN default true not null,
  display_name TEXT not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.provider_keys owner to postgres;

create index if not exists idx_provider_keys_team on public.provider_keys using btree (team_id);

-- Server keys table (private part - stores sensitive key values)
create table if not exists private.server_keys (
  id uuid default gen_random_uuid () not null primary key,
  provider_key_id uuid not null references public.provider_keys (id) on delete cascade,
  key_value TEXT not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  constraint server_keys_provider_key_id_key unique (provider_key_id)
);

alter table private.server_keys owner to postgres;

create index if not exists idx_server_keys_provider_key_id on private.server_keys using btree (provider_key_id);

-- function to insert server key securely (requires team ownership)
create or replace function public.insert_server_key (p_provider_key_id uuid, p_key_value TEXT) returns void language plpgsql security definer
set
  search_path = private,
  public as $$
declare
  v_team_id uuid;
begin
  -- get the team id for the provider key
  select team_id into v_team_id from public.provider_keys where id = p_provider_key_id;
  -- check if the user is an owner of the team
  if not public.is_owner_of (auth.uid (), v_team_id) then raise exception 'only team owners can insert server keys';
  end if;
  -- insert the server key into private schema
  insert into
    private.server_keys (provider_key_id, key_value)
  values
    (p_provider_key_id, p_key_value);
end;
$$;

alter function public.insert_server_key (p_provider_key_id uuid, p_key_value TEXT) owner to postgres;

grant
execute on function public.insert_server_key (uuid, TEXT) to authenticated;

-- function to get server key securely (used server-side or by owner? check usage)
create or replace function public.get_server_key (p_provider_key_id uuid) returns TEXT language plpgsql security definer
set
  search_path = private,
  public as $$
declare
  v_key_value text;
  v_team_id uuid;
begin
  -- get the team id for the provider key
  select team_id into v_team_id from public.provider_keys where id = p_provider_key_id;
  -- get the key value from private schema
  select key_value into v_key_value from private.server_keys where provider_key_id = p_provider_key_id;
  return v_key_value;
end;
$$;

alter function public.get_server_key (p_provider_key_id uuid) owner to postgres;

grant
execute on function public.get_server_key (uuid) to authenticated;

-- Be cautious with grants
grant all on function public.get_server_key (p_provider_key_id uuid) to service_role;

-- Allow service role access if needed
-- Enable RLS
alter table public.provider_keys enable row level security;

alter table private.server_keys enable row level security;

-- RLS Policies
-- Provider Keys (Public part)
create policy "allow select for team members" on public.provider_keys for
select
  using (public.is_member_of (auth.uid (), team_id));

create policy "allow insert for team owners" on public.provider_keys for insert
with
  check (public.is_owner_of (auth.uid (), team_id));

create policy "allow update for team owners" on public.provider_keys
for update
  using (public.is_owner_of (auth.uid (), team_id));

create policy "allow delete for team owners" on public.provider_keys for delete using (public.is_owner_of (auth.uid (), team_id));

-- Server Keys (Private part)
create policy "allow insert for team owners" on private.server_keys for insert
with
  check (
    public.is_owner_of (
      auth.uid (),
      (
        select
          team_id
        from
          public.provider_keys
        where
          id = server_keys.provider_key_id
      )
    )
  );

-- Note: No select/update/delete policies on private.server_keys for general users.
-- Grant service_role direct access (bypasses RLS anyway, but explicit grant is clearer)
grant all on table private.server_keys to service_role;

-- Update Triggers (Function defined in 00_functions_pre.sql)
create trigger provider_keys_updated_at before
update on public.provider_keys for each row
execute function public.update_updated_at ();

create trigger server_keys_updated_at before
update on private.server_keys for each row
execute function public.update_updated_at ();
