-- Add zipcode column to calculator_visits table
ALTER TABLE calculator_visits ADD COLUMN IF NOT EXISTS zipcode TEXT;

-- Create index for zipcode searches
CREATE INDEX IF NOT EXISTS idx_calculator_visits_zipcode ON calculator_visits(zipcode);

-- Add comment
COMMENT ON COLUMN calculator_visits.zipcode IS 'Postal/ZIP code from IP geolocation';

SELECT 'SUCCESS: zipcode column added to calculator_visits!' AS status;
