-- Vault storage bucket
insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do nothing;

-- Ensure storage helper functions exist for policy checks
create or replace function public.storage_foldername (name TEXT) returns text[] language plpgsql as $function$
declare
_parts text[];
begin
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
end
$function$;

-- Storage policies for vault bucket
create policy "Vault: allow select for team members" on storage.objects
    for select
    to authenticated
    using (
        bucket_id = 'vault'
        and exists (
            select 1 from team_memberships
            where team_memberships.user_id = auth.uid()
              and (team_memberships.team_id)::text = (public.storage_foldername(objects.name))[1]
        )
    );

create policy "Vault: allow insert for team members" on storage.objects
    for insert
    to public
    with check (
        bucket_id = 'vault'
        and exists (
            select 1 from team_memberships
            where team_memberships.user_id = auth.uid()
              and (team_memberships.team_id)::text = (public.storage_foldername(objects.name))[1]
        )
    );

create policy "Vault: allow update for team members" on storage.objects
    for update
    to public
    using (
        bucket_id = 'vault'
        and exists (
            select 1 from team_memberships
            where team_memberships.user_id = auth.uid()
              and (team_memberships.team_id)::text = (public.storage_foldername(objects.name))[1]
        )
    );

create policy "Vault: allow delete for team members" on storage.objects
    for delete
    to public
    using (
        bucket_id = 'vault'
        and exists (
            select 1 from team_memberships
            where team_memberships.user_id = auth.uid()
              and (team_memberships.team_id)::text = (public.storage_foldername(objects.name))[1]
        )
    );
