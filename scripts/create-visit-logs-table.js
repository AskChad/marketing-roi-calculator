const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createVisitLogsTable() {
  console.log('🔧 Creating visit_logs table...\n')

  const sql = `
    -- Create visit_logs table for detailed tracking
    CREATE TABLE IF NOT EXISTS visit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      lead_capture_id UUID REFERENCES lead_captures(id) ON DELETE CASCADE,
      ip_address VARCHAR(45) NOT NULL,
      user_agent TEXT,
      page_path VARCHAR(500),
      referrer VARCHAR(500),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_visit_logs_user_id ON visit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_lead_capture_id ON visit_logs(lead_capture_id);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_ip_address ON visit_logs(ip_address);
    CREATE INDEX IF NOT EXISTS idx_visit_logs_created_at ON visit_logs(created_at DESC);

    -- Enable RLS on visit_logs
    ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can view own visit logs" ON visit_logs;

    -- Users can view their own visit logs, admins can see all
    CREATE POLICY "Users can view own visit logs"
      ON visit_logs FOR SELECT
      USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
      ));
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql.trim() })

    if (error) {
      console.error('❌ Failed to create visit_logs table')
      console.error('   Error:', error.message)
      return false
    }

    console.log('✅ visit_logs table created successfully!\n')
    return true
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

createVisitLogsTable().then(async (success) => {
  if (!success) {
    process.exit(1)
  }

  // Verify table exists
  const { data, error } = await supabase
    .from('visit_logs')
    .select('id')
    .limit(1)

  if (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }

  console.log('✅ Verification passed - visit_logs table is accessible!\n')
  console.log('📊 Analytics tracking is now fully operational.')
})
