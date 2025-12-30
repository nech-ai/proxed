-- Storage related functions and policies
-- Note: Bucket creation and initial policies might need manual setup or migration
-- as they are often managed outside standard DDL.
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);

-- Storage helper functions moved to public schema to comply with Supabase restrictions
-- (functions cannot be created in storage schema after April 21, 2025)
create or replace function public.storage_extension (name TEXT) returns TEXT language plpgsql as $function$
declare
_parts text[];
_filename text;
begin
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2 (corrected to handle multiple dots)
    return substring(_filename from '\.([^.]*)$');
end
$function$;

create or replace function public.storage_filename (name TEXT) returns TEXT language plpgsql as $function$
declare
_parts text[];
begin
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
end
$function$;

create or replace function public.storage_foldername (name TEXT) returns text[] language plpgsql as $function$
declare
_parts text[];
begin
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
end
$function$;

-- Storage RLS Policies (These are still allowed on storage.objects)
-- Note: Declarative support for storage policies might be limited. Apply via migration if needed.
create policy "Give users select access to avatars folder" on storage.objects as permissive for
select
  to authenticated using (true);

-- Or restrict further?
create policy "Give members insert access to avatars folder" on storage.objects as permissive for insert to public
with
  check (
    (
      (bucket_id = 'avatars'::TEXT)
      and (
        exists (
          select
            1
          from
            team_memberships
          where
            (
              (team_memberships.user_id = auth.uid ())
              and (
                (team_memberships.team_id)::TEXT = (public.storage_foldername (objects.name)) [1]
              )
            )
        )
      )
    )
  );

create policy "Give members update access to avatars folder" on storage.objects as permissive
for update
  to public using (
    (
      (bucket_id = 'avatars'::TEXT)
      and (
        exists (
          select
            1
          from
            team_memberships
          where
            (
              (team_memberships.user_id = auth.uid ())
              and (
                (team_memberships.team_id)::TEXT = (public.storage_foldername (objects.name)) [1]
              )
            )
        )
      )
    )
  );

create policy "Give members delete access to avatars folder" on storage.objects as permissive for delete to public using (
  (
    (bucket_id = 'avatars'::TEXT)
    and (
      exists (
        select
          1
        from
          team_memberships
        where
          (
            (team_memberships.user_id = auth.uid ())
            and (
              (team_memberships.team_id)::TEXT = (public.storage_foldername (objects.name)) [1]
            )
          )
      )
    )
  )
);

create policy "Give users insert access to avatars folder" on storage.objects as permissive for insert to authenticated
with
  check (
    (
      (bucket_id = 'avatars'::TEXT)
      and (
        (auth.uid ())::TEXT = (public.storage_foldername (name)) [1]
      )
    )
  );

create policy "Give users update access to avatars folder" on storage.objects as permissive
for update
  to authenticated using (
    (
      (bucket_id = 'avatars'::TEXT)
      and (
        (auth.uid ())::TEXT = (public.storage_foldername (name)) [1]
      )
    )
  );

create policy "Give users delete access to avatars folder" on storage.objects as permissive for delete to authenticated using (
  (
    (bucket_id = 'avatars'::TEXT)
    and (
      (auth.uid ())::TEXT = (public.storage_foldername (name)) [1]
    )
  )
);

-- Vault bucket and policies
insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do nothing;

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
