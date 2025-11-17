-- Migration: Add A2P compliance toggle to brands table
-- Date: 2025-11-18
-- Purpose: Allow brands to enable/disable A2P 10DLC compliance requirements

-- Add A2P compliance flag to brands table
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS a2p_compliance_enabled BOOLEAN DEFAULT TRUE;

-- Add comment explaining the purpose
COMMENT ON COLUMN brands.a2p_compliance_enabled IS 'When TRUE: SMS opt-in checkboxes shown, phone/email optional. When FALSE: No SMS checkboxes, phone/email required.';

-- Update existing brands to have A2P compliance enabled by default
UPDATE brands
SET a2p_compliance_enabled = TRUE
WHERE a2p_compliance_enabled IS NULL;

-- Create index for querying brands by A2P compliance status
CREATE INDEX IF NOT EXISTS idx_brands_a2p_compliance
ON brands(a2p_compliance_enabled);
