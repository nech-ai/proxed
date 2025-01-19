insert into
  storage.buckets (id, name, public)
values
  ('avatars', 'avatars', false);


CREATE
OR REPLACE FUNCTION storage.handle_empty_folder_placeholder () RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    name_tokens text[];
    modified_name text;
BEGIN
    -- Split the name into an array of tokens based on '/'
    name_tokens := string_to_array(NEW.name, '/');

    -- Check if the last item in name_tokens is '.emptyFolderPlaceholder'
    IF name_tokens[array_length(name_tokens, 1)] = '.emptyFolderPlaceholder' THEN

        -- Change the last item to '.folderPlaceholder'
        name_tokens[array_length(name_tokens, 1)] := '.folderPlaceholder';

        -- Reassemble the tokens back into a string
        modified_name := array_to_string(name_tokens, '/');

        -- Insert a new row with the modified name
        INSERT INTO storage.objects (bucket_id, name, owner, owner_id, team_id, parent_path)
        VALUES (
            NEW.bucket_id,
            modified_name,
            NEW.owner,
            NEW.owner_id,
            NEW.team_id,
            NEW.parent_path
        );
    END IF;

    -- Insert the original row
    RETURN NEW;
END;
$function$;

CREATE
OR REPLACE FUNCTION storage.extension (name TEXT) RETURNS TEXT LANGUAGE plpgsql AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2
    return split_part(_filename, '.', 2);
END
$function$;

CREATE
OR REPLACE FUNCTION storage.filename (name TEXT) RETURNS TEXT LANGUAGE plpgsql AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$function$;

CREATE
OR REPLACE FUNCTION storage.foldername (name TEXT) RETURNS text[] LANGUAGE plpgsql AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
END
$function$;

create policy "Give users select access to avatars folder" on "storage"."objects" as permissive for
select
  to authenticated using (true);

create policy "Give members insert access to avatars folder" on "storage"."objects" as permissive for insert to public
with
  check (
    (
      (bucket_id = 'avatars'::TEXT)
      AND (
        EXISTS (
          SELECT
            1
          FROM
            team_memberships
          WHERE
            (
              (team_memberships.user_id = auth.uid ())
              AND (
                (team_memberships.team_id)::TEXT = (storage.foldername (objects.name)) [1]
              )
            )
        )
      )
    )
  );

create policy "Give members update access to avatars folder" on "storage"."objects" as permissive
for update
  to public using (
    (
      (bucket_id = 'avatars'::TEXT)
      AND (
        EXISTS (
          SELECT
            1
          FROM
            team_memberships
          WHERE
            (
              (team_memberships.user_id = auth.uid ())
              AND (
                (team_memberships.team_id)::TEXT = (storage.foldername (objects.name)) [1]
              )
            )
        )
      )
    )
  );

create policy "Give members delete access to avatars folder" on "storage"."objects" as permissive for delete to public using (
  (
    (bucket_id = 'avatars'::TEXT)
    AND (
      EXISTS (
        SELECT
          1
        FROM
          team_memberships
        WHERE
          (
            (team_memberships.user_id = auth.uid ())
            AND (
              (team_memberships.team_id)::TEXT = (storage.foldername (objects.name)) [1]
            )
          )
      )
    )
  )
);

create policy "Give users insert access to avatars folder" on "storage"."objects" as permissive for insert to authenticated
with
  check (
    (
      (bucket_id = 'avatars'::TEXT)
      AND (
        (auth.uid ())::TEXT = (storage.foldername (name)) [1]
      )
    )
  );

create policy "Give users update access to avatars folder" on "storage"."objects" as permissive
for update
  to authenticated using (
    (
      (bucket_id = 'avatars'::TEXT)
      AND (
        (auth.uid ())::TEXT = (storage.foldername (name)) [1]
      )
    )
  );

create policy "Give users delete access to avatars folder" on "storage"."objects" as permissive for delete to authenticated using (
  (
    (bucket_id = 'avatars'::TEXT)
    AND (
      (auth.uid ())::TEXT = (storage.foldername (name)) [1]
    )
  )
);
