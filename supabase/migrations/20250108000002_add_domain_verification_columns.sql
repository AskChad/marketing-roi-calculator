-- Add domain verification tracking columns to brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS domain_verification_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dns_records JSONB;

-- Add index for domain verification status
CREATE INDEX IF NOT EXISTS idx_brands_domain_verified ON brands(domain_verified) WHERE domain_verified = true;

-- Add comments
COMMENT ON COLUMN brands.domain_verified IS 'Whether the domain DNS has been verified';
COMMENT ON COLUMN brands.domain_verification_checked_at IS 'Last time domain verification was checked';
COMMENT ON COLUMN brands.dns_records IS 'DNS records returned during verification check';

-- Verify the migration worked
SELECT 'SUCCESS: Domain verification columns added to brands table!' AS status;
