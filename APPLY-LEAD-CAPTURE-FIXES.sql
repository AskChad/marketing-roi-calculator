-- =====================================================
-- FIX LEAD CAPTURE 500 ERROR
-- =====================================================
-- This SQL adds the missing visit_count column to lead_captures table
-- Copy this entire file and run it in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new
-- =====================================================

-- Add visit_count column to lead_captures (if it doesn't exist)
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;

-- Add ip_address column to lead_captures (if it doesn't exist)
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Add brand_id column to lead_captures (if it doesn't exist)
-- This was added in the brands migration but we'll ensure it exists
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);
CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);

-- Add comments
COMMENT ON COLUMN lead_captures.visit_count IS 'Number of visits before lead capture (starts at 1)';
COMMENT ON COLUMN lead_captures.ip_address IS 'IP address when the lead was captured';
COMMENT ON COLUMN lead_captures.brand_id IS 'Brand that this lead was captured on';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show the updated schema
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'lead_captures'
  AND column_name IN ('visit_count', 'ip_address', 'brand_id')
ORDER BY column_name;

-- =====================================================
-- RESULT
-- =====================================================
-- After running this SQL:
-- ✅ visit_count column will exist in lead_captures
-- ✅ ip_address column will exist in lead_captures
-- ✅ brand_id column will exist in lead_captures
-- ✅ Lead capture form will work without 500 errors
-- =====================================================
