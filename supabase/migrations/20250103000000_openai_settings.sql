-- OpenAI Settings Migration
-- Purpose: Add OpenAI configuration and AI system instructions

-- =====================================================
-- Add OpenAI settings to admin_settings table
-- =====================================================

-- Insert OpenAI configuration settings
INSERT INTO admin_settings (setting_key, setting_value, encrypted) VALUES
  ('openai_api_key', NULL, TRUE),
  ('openai_model', 'gpt-4-turbo-preview', FALSE),
  ('openai_temperature', '0.7', FALSE),
  ('openai_max_tokens', '2000', FALSE),
  ('openai_system_instructions', 'You are a helpful AI assistant that analyzes marketing ROI data. Be specific, actionable, and data-driven in your responses.', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- TABLE: user_openai_settings
-- Purpose: Allow users to save their own OpenAI API keys
-- =====================================================
CREATE TABLE IF NOT EXISTS user_openai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  api_key TEXT, -- Encrypted user's personal OpenAI key
  use_platform_key BOOLEAN DEFAULT TRUE, -- Use platform key or personal key
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_openai_settings_user_id ON user_openai_settings(user_id);

-- Enable RLS on user_openai_settings
ALTER TABLE user_openai_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own OpenAI settings
CREATE POLICY "Users can view own OpenAI settings"
  ON user_openai_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OpenAI settings"
  ON user_openai_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OpenAI settings"
  ON user_openai_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own OpenAI settings"
  ON user_openai_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_openai_settings_updated_at BEFORE UPDATE ON user_openai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETED: OpenAI Settings Tables
-- =====================================================
