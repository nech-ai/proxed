INSERT INTO
  auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'authenticated',
    'authenticated',
    'alex@proxed.ai',
    '$2a$10$NaMVRrI7NyfwP.AfAVWt6O/abulGnf9BBqwa6DqdMwXMvOCGpAnVO',
    '2024-09-01 17:21:01.462788+00',
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "username", "full_name": "Test User"}',
    NULL,
    '2024-09-01 17:21:01.455486+00',
    '2024-09-01 17:21:01.46295+00',
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL,
    false
  );

INSERT INTO
  auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    id
  )
VALUES
  (
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    '{"sub": "aec53558-767e-4408-b4d6-1c1e6f17ffe5", "email": "user@example.com", "email_verified": false, "phone_verified": false}',
    'email',
    '2024-09-01 17:21:01.459821+00',
    '2024-09-01 17:21:01.459849+00',
    '2024-09-01 17:21:01.459849+00',
    'c5e81668-437b-47c2-83e2-84b8566b3018'
  );

-- Insert additional teams
INSERT INTO
  teams (id, name)
VALUES
  (
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'Team 1'
  ),
  (
    'b1e53558-767e-4408-b4d6-1c1e6f17ffe5',
    'Team 2'
  ),
  (
    'c2e53558-767e-4408-b4d6-1c1e6f17ffe5',
    'Team 3'
  ),
  (
    'd3e53558-767e-4408-b4d6-1c1e6f17ffe5',
    'Team 4'
  ),
  (
    'e4e53558-767e-4408-b4d6-1c1e6f17ffe5',
    'Team 5'
  );

-- Connect two teams to the user
INSERT INTO
  team_memberships (team_id, user_id, role, is_creator)
VALUES
  (
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'OWNER',
    true
  ),
  (
    'b1e53558-767e-4408-b4d6-1c1e6f17ffe5',
    'aec53558-767e-4408-b4d6-1c1e6f17ffe5',
    'MEMBER',
    false
  );

-- update user to have team_id
UPDATE
  users
SET
  team_id = 'aec53558-767e-4408-b4d6-1c1e6f17ffe5'
WHERE
  id = 'aec53558-767e-4408-b4d6-1c1e6f17ffe5';
