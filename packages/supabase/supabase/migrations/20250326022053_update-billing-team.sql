-- Add new columns to the teams table
alter table public.teams
add column plan text default 'trial',
add column email text,
add column canceled_at timestamptz;

-- Add comment explaining the new fields
comment on column public.teams.plan is 'The subscription plan key for the team';
comment on column public.teams.email is 'The email address associated with team billing';
comment on column public.teams.canceled_at is 'Timestamp when the team plan was canceled';
