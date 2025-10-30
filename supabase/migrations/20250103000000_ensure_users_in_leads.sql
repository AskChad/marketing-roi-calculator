-- Migration: Ensure all NON-ADMIN users have corresponding lead_captures entries
-- Admin users should NOT be in lead_captures (they are internal users, not contacts/leads)

-- Step 1: Create lead_capture entries for NON-ADMIN users who don't have one
INSERT INTO lead_captures (
  id,
  first_name,
  last_name,
  email,
  phone,
  company_name,
  website_url,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v4(),
  COALESCE(u.first_name, 'Unknown'),
  COALESCE(u.last_name, 'User'),
  u.email,
  u.phone,
  COALESCE(u.company_name, 'Not Provided'),
  NULL,
  u.created_at,
  u.updated_at
FROM users u
WHERE u.lead_capture_id IS NULL
  AND u.is_admin = FALSE  -- Only non-admin users
  AND NOT EXISTS (
    SELECT 1 FROM lead_captures lc WHERE lc.email = u.email
  );

-- Step 2: Link NON-ADMIN users to their lead_capture records
UPDATE users u
SET lead_capture_id = lc.id
FROM lead_captures lc
WHERE u.email = lc.email
  AND u.lead_capture_id IS NULL
  AND u.is_admin = FALSE;  -- Only non-admin users

-- Step 3: Add comment for clarity
COMMENT ON COLUMN users.lead_capture_id IS 'Regular users must have a corresponding lead_capture entry (single source of truth for contact data). Admin users should NOT have a lead_capture entry as they are internal users, not contacts.';
