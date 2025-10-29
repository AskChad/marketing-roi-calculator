-- Add Platform Admin User: chad@askchad.net
-- This migration creates the admin user account

-- Note: Password needs to be set via Supabase Auth
-- This SQL creates the user record in the users table
-- The actual authentication will be handled by Supabase Auth

-- First, create a lead capture record for the admin
INSERT INTO lead_captures (
  first_name,
  last_name,
  email,
  phone,
  company_name,
  website_url
) VALUES (
  'Chad',
  'Admin',
  'chad@askchad.net',
  NULL,
  'AskChad',
  NULL
) ON CONFLICT DO NOTHING;

-- Create admin user in users table
-- Note: In production, this would be created through Supabase Auth signup
-- For now, we'll create the record with a placeholder password hash
-- The admin should reset their password on first login

INSERT INTO users (
  id,
  email,
  phone,
  password_hash,
  first_name,
  last_name,
  company_name,
  is_admin,
  lead_capture_id
) VALUES (
  gen_random_uuid(),
  'chad@askchad.net',
  '', -- Phone will be updated on first login
  '', -- Password hash will be set by Supabase Auth
  'Chad',
  'Admin',
  'AskChad',
  TRUE, -- Set as admin
  (SELECT id FROM lead_captures WHERE email = 'chad@askchad.net' LIMIT 1)
) ON CONFLICT (email) DO UPDATE SET
  is_admin = TRUE; -- Ensure admin status if user already exists

-- Create a comment for documentation
COMMENT ON TABLE users IS 'Platform admin: chad@askchad.net';
