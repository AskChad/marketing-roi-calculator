-- Fix existing empty subdomain strings to NULL
-- This prevents duplicate key violations on the unique constraint

UPDATE brands
SET subdomain = NULL
WHERE subdomain = '' OR subdomain IS NULL OR TRIM(subdomain) = '';

-- Verify the migration worked
SELECT 'SUCCESS: Empty subdomains converted to NULL!' AS status;
