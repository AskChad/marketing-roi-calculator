-- Migration: Add tracking_id for anonymous user tracking
-- Allows us to track anonymous visitors before they register

-- Add tracking_id to lead_captures
ALTER TABLE lead_captures
  ADD COLUMN IF NOT EXISTS tracking_id UUID;

-- Add tracking_id to users (to link anonymous activity to registered users)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tracking_id UUID;

-- Add index for fast tracking_id lookups
CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);
CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);

-- Add comments
COMMENT ON COLUMN lead_captures.tracking_id IS 'Anonymous visitor tracking ID from cookie. Used to identify users before registration.';
COMMENT ON COLUMN users.tracking_id IS 'Carries over tracking_id from anonymous activity. Links pre-registration activity to user account.';
