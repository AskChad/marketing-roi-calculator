-- Migration: Add IP geolocation fields to lead_captures
-- Using data from ipgeolocation.io API

ALTER TABLE lead_captures
  ADD COLUMN IF NOT EXISTS geo_country_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS geo_country_code2 VARCHAR(2),
  ADD COLUMN IF NOT EXISTS geo_state_prov VARCHAR(100),
  ADD COLUMN IF NOT EXISTS geo_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS geo_zipcode VARCHAR(20),
  ADD COLUMN IF NOT EXISTS geo_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS geo_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS geo_timezone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS geo_isp VARCHAR(255),
  ADD COLUMN IF NOT EXISTS geo_organization VARCHAR(255),
  ADD COLUMN IF NOT EXISTS geo_continent_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS geo_continent_code VARCHAR(2),
  ADD COLUMN IF NOT EXISTS geo_currency_code VARCHAR(3),
  ADD COLUMN IF NOT EXISTS geo_currency_name VARCHAR(50),
  ADD COLUMN IF NOT EXISTS geo_calling_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS geo_languages VARCHAR(255),
  ADD COLUMN IF NOT EXISTS geo_data JSONB;  -- Store full API response

-- Add index on common geolocation queries
CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_country ON lead_captures(geo_country_code2);
CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_city ON lead_captures(geo_city);
CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_state ON lead_captures(geo_state_prov);

-- Add comments
COMMENT ON COLUMN lead_captures.geo_data IS 'Full JSON response from IP geolocation API for advanced queries';
COMMENT ON COLUMN lead_captures.geo_latitude IS 'Latitude coordinate from IP geolocation';
COMMENT ON COLUMN lead_captures.geo_longitude IS 'Longitude coordinate from IP geolocation';
