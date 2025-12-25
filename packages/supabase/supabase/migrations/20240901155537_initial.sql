create
or replace function public.handle_new_user () returns trigger language plpgsql security definer
set
  search_path to 'public' as $$
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

-- trigger the function every time a user is created
create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

grant all on function public.handle_new_user () to anon;

grant all on function public.handle_new_user () to authenticated;

grant all on function public.handle_new_user () to service_role;

create schema if not exists private;

alter schema private owner to postgres;
