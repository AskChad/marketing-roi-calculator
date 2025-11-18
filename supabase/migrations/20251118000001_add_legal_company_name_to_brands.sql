-- Migration: Add legal_company_name to brands table
-- Date: 2025-11-18
-- Purpose: Add legal company name field for use in Privacy Policy, Terms of Service, and A2P forms

-- Add legal_company_name field to brands table
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS legal_company_name VARCHAR(255);

-- Add comment explaining the purpose
COMMENT ON COLUMN brands.legal_company_name IS 'Legal company name used in Privacy Policy, Terms of Service, and A2P SMS consent forms';

-- Update existing brands to use their name as legal_company_name if not set
UPDATE brands
SET legal_company_name = COALESCE(company_name, name)
WHERE legal_company_name IS NULL;
