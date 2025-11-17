const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  try {
    const migration = fs.readFileSync('./supabase/migrations/20251118000000_add_a2p_compliance_to_brands.sql', 'utf8')

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migration
    })

    if (error) {
      console.error('Migration error:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully')
    console.log('Added a2p_compliance_enabled column to brands table')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

applyMigration()
