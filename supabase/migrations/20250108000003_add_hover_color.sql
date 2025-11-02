-- Add hover color to brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS color_hover VARCHAR(7) DEFAULT '#0052CC';

-- Add comment
COMMENT ON COLUMN brands.color_hover IS 'Color used for hover states and interactive elements';

-- Update existing brands to have a hover color based on their primary color
UPDATE brands
SET color_hover = color_primary
WHERE color_hover IS NULL;

-- Verify the migration worked
SELECT 'SUCCESS: Hover color column added to brands table!' AS status;
