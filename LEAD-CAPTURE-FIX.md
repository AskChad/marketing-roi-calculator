# 🔧 Lead Capture 500 Error - FIX

## 🐛 Problem

Landing page form submissions are failing with 500 errors:

```
Failed to load resource: the server responded with a status of 500 ()
Form submission error: Error: Failed to submit form
```

## 🔍 Root Cause

The `lead_captures` table is **missing required columns** that the API is trying to insert:
- ❌ `visit_count` column is missing
- ❌ `ip_address` column is missing
- ❌ Possibly `brand_id` column is missing

These columns are defined in migrations but **haven't been applied to the production database**.

## ✅ Solution

Apply the missing columns by running SQL in your Supabase Dashboard.

### Step 1: Copy the SQL

Open the file: **`APPLY-LEAD-CAPTURE-FIXES.sql`**

Or copy this SQL:

```sql
-- Add missing columns to lead_captures table
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);
CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);

-- Add comments
COMMENT ON COLUMN lead_captures.visit_count IS 'Number of visits before lead capture (starts at 1)';
COMMENT ON COLUMN lead_captures.ip_address IS 'IP address when the lead was captured';
COMMENT ON COLUMN lead_captures.brand_id IS 'Brand that this lead was captured on';
```

### Step 2: Run in Supabase Dashboard

1. Go to: [Supabase SQL Editor](https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new)
2. Paste the SQL above
3. Click **"Run"**
4. Wait for success message

### Step 3: Verify the Fix

Run this command to verify:

```bash
node scripts/apply-lead-capture-fixes.js
```

You should see:
```
✅ All required columns exist!
✅ Successfully inserted test lead
✅ All fixes applied successfully!
   Lead capture form should now work without errors.
```

## 🧪 Testing

After applying the SQL, test the form:

1. Go to your landing page
2. Fill out the lead capture form
3. Submit
4. Should succeed without 500 errors!

## 📊 What This Fixes

### Before (500 Error):
```javascript
// API tries to insert these fields:
{
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  company_name: "Example Corp",
  visit_count: 1,          // ❌ Column doesn't exist
  ip_address: "1.2.3.4",   // ❌ Column doesn't exist
  brand_id: "uuid-here"    // ❌ Column doesn't exist
}
// Result: 500 Internal Server Error
```

### After (Success):
```javascript
// All columns exist in database
// Insert succeeds
// Form submission works! ✅
```

## 🔄 Related Migrations

The following migrations define these columns but weren't applied:

1. **`20250102000000_add_ip_tracking.sql`**
   - Adds `ip_address` column
   - Adds `visit_count` column

2. **`20250107000000_create_brands_table.sql`**
   - Adds `brand_id` column

## 📁 Files to Use

- **`APPLY-LEAD-CAPTURE-FIXES.sql`** - Copy and run this in Supabase Dashboard
- **`scripts/apply-lead-capture-fixes.js`** - Verify the fix worked
- **`scripts/check-lead-capture-schema.js`** - Check current schema

## ⚡ Quick Fix (One Command)

Just run this SQL in Supabase Dashboard:

```sql
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
```

That's it! Your lead capture form will work immediately after.

## 🎯 Summary

**Problem**: Missing database columns
**Solution**: Run SQL to add columns
**Time**: 30 seconds
**Result**: Lead capture form works! ✅

---

*After applying this fix, the 500 error will be resolved and your landing page form will work correctly.*
