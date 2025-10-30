-- Add domain verification fields to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verification_checked_at TIMESTAMPTZ;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS dns_records JSONB;

-- Add comment
COMMENT ON COLUMN brands.domain_verified IS 'Whether the custom domain has been verified in Vercel';
COMMENT ON COLUMN brands.domain_verification_checked_at IS 'Last time domain verification was checked';
COMMENT ON COLUMN brands.dns_records IS 'DNS records required for domain verification';
