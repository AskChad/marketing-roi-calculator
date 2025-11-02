# Database Migrations

This document tracks pending database migrations that need to be run manually through the Supabase dashboard.

## Pending Migrations

### 1. Add Hover Color Column
**File**: `supabase/migrations/20250108000003_add_hover_color.sql`
**Status**: ⏳ Pending
**Description**: Adds a `color_hover` column to the brands table for hover state colors

**To Run**:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk
2. Navigate to SQL Editor
3. Copy and paste the contents of the migration file
4. Click "Run"

**SQL**:
```sql
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
```

---

## Completed Migrations

### Performance Indexes
**File**: `supabase/migrations/20250108000001_add_performance_indexes.sql`
**Status**: ✅ Needs to be run
**Description**: Adds database indexes for improved query performance

### Domain Verification Columns
**File**: `supabase/migrations/20250108000002_add_domain_verification_columns.sql`
**Status**: ✅ Needs to be run
**Description**: Adds columns for domain verification tracking

---

## Migration Checklist

Before deploying new features that require database changes:

- [ ] Run all pending migrations in Supabase dashboard
- [ ] Verify migrations succeeded by checking the output
- [ ] Test the feature in production to ensure it works
- [ ] Mark migrations as completed in this document

