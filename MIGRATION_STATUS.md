# OpenAI Settings Migration Status

**Date**: 2025-10-31
**Status**: ⚠️ Partially Complete - Need to Run Table Creation

---

## ✅ Completed

### Part 1: Admin Settings (DONE)
Successfully added 5 OpenAI settings to `admin_settings` table:
- ✅ `openai_api_key` (NULL by default)
- ✅ `openai_model` (gpt-4-turbo-preview)
- ✅ `openai_temperature` (0.7)
- ✅ `openai_max_tokens` (2000)
- ✅ `openai_system_instructions` (default prompt)

### Part 2: Code Implementation (DONE)
All code files created and ready:
- ✅ Function definitions (`/lib/ai/function-definitions.ts`)
- ✅ Function handlers (`/lib/ai/function-handlers.ts`)
- ✅ Admin API endpoints (`/app/api/admin/openai-settings/route.ts`)
- ✅ User API endpoints (`/app/api/user/openai-settings/route.ts`)
- ✅ AI chat endpoint updated (`/app/api/ai/chat/route.ts`)
- ✅ Admin UI component (`/components/admin/OpenAISettings.tsx`)
- ✅ Admin content updated (`/components/admin/AdminContent.tsx`)
- ✅ Migration endpoint (`/app/api/admin/run-openai-migration/route.ts`)

---

## ⏳ Remaining

### Part 3: Table Creation (PENDING)
Need to create `user_openai_settings` table with:
- Table structure
- Index on `user_id`
- Row Level Security
- 4 RLS policies
- updated_at trigger

---

## 🚀 Option 1: Run Migration via API Endpoint (EASIEST)

Once the build completes and is deployed:

1. **Start dev server**:
   ```bash
   cd /mnt/c/development/marketing_ROI_Calculator
   npm run dev
   ```

2. **Call migration endpoint** (as admin):
   ```bash
   curl -X POST http://localhost:3000/api/admin/run-openai-migration \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
   ```

   Or visit admin panel and trigger it from there.

---

## 🚀 Option 2: Manual SQL Execution

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Create user_openai_settings table
CREATE TABLE IF NOT EXISTS user_openai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  api_key TEXT,
  use_platform_key BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_openai_settings_user_id ON user_openai_settings(user_id);

-- Enable RLS
ALTER TABLE user_openai_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own OpenAI settings" ON user_openai_settings;
DROP POLICY IF EXISTS "Users can insert own OpenAI settings" ON user_openai_settings;
DROP POLICY IF EXISTS "Users can update own OpenAI settings" ON user_openai_settings;
DROP POLICY IF EXISTS "Users can delete own OpenAI settings" ON user_openai_settings;

-- Create policies
CREATE POLICY "Users can view own OpenAI settings" ON user_openai_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own OpenAI settings" ON user_openai_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own OpenAI settings" ON user_openai_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own OpenAI settings" ON user_openai_settings FOR DELETE USING (auth.uid() = user_id);

-- Create trigger
DROP TRIGGER IF EXISTS update_user_openai_settings_updated_at ON user_openai_settings;
CREATE TRIGGER update_user_openai_settings_updated_at BEFORE UPDATE ON user_openai_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**URL**: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new

---

## ✅ After Migration is Complete

1. **Configure OpenAI API Key** in Admin Panel → AI Settings
2. **Test AI Chat**:
   - As user: "Show me my scenarios"
   - As admin: "Find users at Acme Corporation"
3. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Add OpenAI settings and function calling"
   git push origin main
   ```

---

## 📁 Migration Files

All migration-related files are in:
- `/supabase/migrations/20250103000000_openai_settings.sql` - Original migration
- `/OPENAI_MIGRATION_MANUAL.sql` - Manual execution version
- `/scripts/run-openai-migration-api.js` - REST API script (completed part 1)
- `/app/api/admin/run-openai-migration/route.ts` - API endpoint for part 2

---

## 🎯 Next Steps

1. Wait for build to complete
2. Choose one of the migration options above
3. Run the table creation SQL
4. Configure OpenAI API key
5. Test the system
6. Deploy to production

**Estimated Time**: 5-10 minutes
