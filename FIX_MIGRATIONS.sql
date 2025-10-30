-- First, create the exec_sql function so we can run migrations via API
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Add zipcode to calculator_visits if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'calculator_visits' AND column_name = 'zipcode'
  ) THEN
    ALTER TABLE calculator_visits ADD COLUMN zipcode TEXT;
    CREATE INDEX IF NOT EXISTS idx_calculator_visits_zipcode ON calculator_visits(zipcode);
  END IF;
END $$;

-- Add brand_id to calculator_visits if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'calculator_visits' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE calculator_visits ADD COLUMN brand_id UUID;
    CREATE INDEX IF NOT EXISTS idx_calculator_visits_brand_id ON calculator_visits(brand_id);
  END IF;
END $$;

-- Add brand_id to roi_scenarios if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roi_scenarios' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE roi_scenarios ADD COLUMN brand_id UUID;
    CREATE INDEX IF NOT EXISTS idx_roi_scenarios_brand_id ON roi_scenarios(brand_id);
  END IF;
END $$;

-- Verify the changes
SELECT 'SUCCESS: All migrations applied!' AS status;
