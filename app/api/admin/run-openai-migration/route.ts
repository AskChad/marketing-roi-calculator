import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/run-openai-migration
 * Run OpenAI settings migration (admin only, one-time use)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!(userData as any)?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Execute migration using pg client directly
    const { Client } = require('pg')
    const client = new Client({
      host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
      port: 6543,
      database: 'postgres',
      user: 'postgres.ohmioijbzvhoydyhdkdk',
      password: process.env.SUPABASE_DB_PASSWORD || 'nLyrqefAev8R-pW-T3.y',
      ssl: { rejectUnauthorized: false }
    })

    try {
      await client.connect()

      const migrationSql = `
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
`

      await client.query(migrationSql)
      await client.end()

      return NextResponse.json({
        success: true,
        message: 'OpenAI settings migration completed successfully!',
        changes: [
          '✅ Created user_openai_settings table',
          '✅ Created index on user_id',
          '✅ Enabled Row Level Security',
          '✅ Created 4 RLS policies',
          '✅ Added updated_at trigger',
        ],
      })
    } catch (dbError: any) {
      await client.end()
      throw dbError
    }
  } catch (error: any) {
    console.error('Migration error:', error)

    if (error.message && (error.message.includes('already exists') || error.code === '42P07')) {
      return NextResponse.json({
        success: true,
        message: 'Migration already completed (table exists)',
        alreadyRan: true,
      })
    }

    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    )
  }
}
