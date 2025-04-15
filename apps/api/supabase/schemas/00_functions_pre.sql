-- Prerequisite functions needed early in the migration process
-- Function to update the updated_at timestamp on any table
create or replace function public.update_updated_at () returns trigger language plpgsql security definer
set
  search_path = 'public' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

alter function public.update_updated_at () owner to postgres;

grant all on function public.update_updated_at () to anon;

grant all on function public.update_updated_at () to authenticated;

grant all on function public.update_updated_at () to service_role;
