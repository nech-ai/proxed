alter table public.projects
    add column if not exists save_images_to_vault boolean not null default false;
