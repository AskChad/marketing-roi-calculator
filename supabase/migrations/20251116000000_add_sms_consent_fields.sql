-- Migration: Add SMS consent fields to lead_captures table
-- For A2P 10DLC compliance (TCPA/CTIA)
-- Date: 2025-11-16

-- Add SMS consent tracking fields to lead_captures
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_opted_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sms_consent_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS sms_consent_user_agent TEXT,
ADD COLUMN IF NOT EXISTS sms_consent_text TEXT,
ADD COLUMN IF NOT EXISTS sms_terms_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS sms_privacy_url VARCHAR(500);

-- Add comment explaining the purpose
COMMENT ON COLUMN lead_captures.sms_opt_in IS 'Whether user consented to receive SMS messages';
COMMENT ON COLUMN lead_captures.sms_opted_in_at IS 'Timestamp when user provided SMS consent';
COMMENT ON COLUMN lead_captures.sms_consent_ip IS 'IP address at time of SMS consent';
COMMENT ON COLUMN lead_captures.sms_consent_user_agent IS 'User agent at time of SMS consent';
COMMENT ON COLUMN lead_captures.sms_consent_text IS 'Exact text shown to user at time of consent';
COMMENT ON COLUMN lead_captures.sms_terms_url IS 'URL to SMS terms at time of consent';
COMMENT ON COLUMN lead_captures.sms_privacy_url IS 'URL to privacy policy at time of consent';

-- Create index for finding users who opted in to SMS
CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_opt_in
ON lead_captures(sms_opt_in)
WHERE sms_opt_in = TRUE;

-- Create index for querying by opt-in date
CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_opted_in_at
ON lead_captures(sms_opted_in_at)
WHERE sms_opted_in_at IS NOT NULL;
