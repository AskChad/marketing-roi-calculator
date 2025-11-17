-- Migration: Add separate SMS consent fields for Marketing and Transactional
-- For A2P 10DLC compliance (TCPA/CTIA)
-- Date: 2025-11-17

-- Add separate SMS consent tracking fields to lead_captures
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS sms_opt_in_marketing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_opt_in_transactional BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_marketing_consent_text TEXT,
ADD COLUMN IF NOT EXISTS sms_transactional_consent_text TEXT,
ADD COLUMN IF NOT EXISTS sms_marketing_opted_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sms_transactional_opted_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sms_marketing_consent_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS sms_transactional_consent_ip VARCHAR(45);

-- Add comments explaining the purpose
COMMENT ON COLUMN lead_captures.sms_opt_in_marketing IS 'Whether user consented to receive marketing SMS messages';
COMMENT ON COLUMN lead_captures.sms_opt_in_transactional IS 'Whether user consented to receive transactional/service SMS messages';
COMMENT ON COLUMN lead_captures.sms_marketing_consent_text IS 'Exact text shown to user for marketing SMS consent';
COMMENT ON COLUMN lead_captures.sms_transactional_consent_text IS 'Exact text shown to user for transactional SMS consent';
COMMENT ON COLUMN lead_captures.sms_marketing_opted_in_at IS 'Timestamp when user provided marketing SMS consent';
COMMENT ON COLUMN lead_captures.sms_transactional_opted_in_at IS 'Timestamp when user provided transactional SMS consent';
COMMENT ON COLUMN lead_captures.sms_marketing_consent_ip IS 'IP address at time of marketing SMS consent';
COMMENT ON COLUMN lead_captures.sms_transactional_consent_ip IS 'IP address at time of transactional SMS consent';

-- Create indexes for finding users who opted in
CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_opt_in_marketing
ON lead_captures(sms_opt_in_marketing)
WHERE sms_opt_in_marketing = TRUE;

CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_opt_in_transactional
ON lead_captures(sms_opt_in_transactional)
WHERE sms_opt_in_transactional = TRUE;

-- Create indexes for querying by opt-in date
CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_marketing_opted_in_at
ON lead_captures(sms_marketing_opted_in_at)
WHERE sms_marketing_opted_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_captures_sms_transactional_opted_in_at
ON lead_captures(sms_transactional_opted_in_at)
WHERE sms_transactional_opted_in_at IS NOT NULL;
