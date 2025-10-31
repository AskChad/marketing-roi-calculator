const https = require('https')

const SUPABASE_URL = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL)
    const options = {
      method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }

    const req = https.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function runMigration() {
  console.log('🚀 Running OpenAI Settings Migration via Supabase REST API...\n')

  try {
    // Step 1: Add OpenAI settings to admin_settings
    console.log('📝 Step 1: Adding OpenAI settings to admin_settings...')

    const settings = [
      { setting_key: 'openai_api_key', setting_value: null, encrypted: true },
      { setting_key: 'openai_model', setting_value: 'gpt-4-turbo-preview', encrypted: false },
      { setting_key: 'openai_temperature', setting_value: '0.7', encrypted: false },
      { setting_key: 'openai_max_tokens', setting_value: '2000', encrypted: false },
      { setting_key: 'openai_system_instructions', setting_value: 'You are a helpful AI assistant that analyzes marketing ROI data. Be specific, actionable, and data-driven in your responses.', encrypted: false }
    ]

    for (const setting of settings) {
      try {
        // Try to insert, will fail silently if exists due to unique constraint
        await makeRequest('POST', '/rest/v1/admin_settings', setting)
        console.log(`   ✅ Added ${setting.setting_key}`)
      } catch (error) {
        if (error.message.includes('duplicate key') || error.message.includes('409')) {
          console.log(`   ⏭️  ${setting.setting_key} already exists, skipping`)
        } else {
          console.error(`   ❌ Error with ${setting.setting_key}:`, error.message)
        }
      }
    }

    console.log('\n✅ Admin settings migration completed!')
    console.log('\n⚠️  Manual step required:')
    console.log('   The table creation, RLS policies, and triggers must be run in Supabase SQL Editor.')
    console.log('\n📋 Run this SQL in Supabase Dashboard → SQL Editor:\n')
    console.log(`-- Create user_openai_settings table
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

-- Create RLS Policies
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
CREATE TRIGGER update_user_openai_settings_updated_at
  BEFORE UPDATE ON user_openai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`)

    console.log('\n\n📍 To complete the migration:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new')
    console.log('   2. Copy the SQL above')
    console.log('   3. Paste and click "Run"')
    console.log('   4. Verify success')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
  }
}

runMigration()
