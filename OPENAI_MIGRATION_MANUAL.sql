-- =====================================================
-- OpenAI Settings Migration - MANUAL EXECUTION
-- Copy this entire file and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new
-- =====================================================

-- Step 1: Create user_openai_settings table
CREATE TABLE IF NOT EXISTS user_openai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  api_key TEXT,
  use_platform_key BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create index
CREATE INDEX IF NOT EXISTS idx_user_openai_settings_user_id
ON user_openai_settings(user_id);

-- Step 3: Enable Row Level Security
ALTER TABLE user_openai_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policy - SELECT
DROP POLICY IF EXISTS "Users can view own OpenAI settings" ON user_openai_settings;
CREATE POLICY "Users can view own OpenAI settings"
  ON user_openai_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Step 5: Create RLS Policy - INSERT
DROP POLICY IF EXISTS "Users can insert own OpenAI settings" ON user_openai_settings;
CREATE POLICY "Users can insert own OpenAI settings"
  ON user_openai_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Create RLS Policy - UPDATE
DROP POLICY IF EXISTS "Users can update own OpenAI settings" ON user_openai_settings;
CREATE POLICY "Users can update own OpenAI settings"
  ON user_openai_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 7: Create RLS Policy - DELETE
DROP POLICY IF EXISTS "Users can delete own OpenAI settings" ON user_openai_settings;
CREATE POLICY "Users can delete own OpenAI settings"
  ON user_openai_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Create updated_at trigger
DROP TRIGGER IF EXISTS update_user_openai_settings_updated_at ON user_openai_settings;
CREATE TRIGGER update_user_openai_settings_updated_at
  BEFORE UPDATE ON user_openai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify the table was created
SELECT 'user_openai_settings table created successfully!' as status;

-- Show admin settings
SELECT setting_key,
       CASE
         WHEN setting_key = 'openai_api_key' AND setting_value IS NOT NULL THEN '***configured***'
         ELSE setting_value
       END as value
FROM admin_settings
WHERE setting_key LIKE 'openai%'
ORDER BY setting_key;
