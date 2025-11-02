-- Add page path and brand_id columns to calculator_visits table
ALTER TABLE calculator_visits
  ADD COLUMN IF NOT EXISTS page_path TEXT,
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zipcode TEXT;

-- Create index for page_path
CREATE INDEX IF NOT EXISTS idx_calculator_visits_page_path ON calculator_visits(page_path);

-- Create index for brand_id
CREATE INDEX IF NOT EXISTS idx_calculator_visits_brand_id ON calculator_visits(brand_id);

-- Add helpful comments
COMMENT ON COLUMN calculator_visits.page_path IS 'The URL path that was visited (e.g., /calculator, /dashboard)';
COMMENT ON COLUMN calculator_visits.brand_id IS 'Reference to the brand that was visited';

-- Verify the migration worked
SELECT 'SUCCESS: page_path and brand_id columns added to calculator_visits!' AS status;
