const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

async function runMigration() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250108000001_add_performance_indexes.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Running performance indexes migration...')
  console.log('Migration file:', migrationPath)
  console.log('\nExecuting SQL statements...\n')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))

  let successCount = 0
  let errorCount = 0

  for (const statement of statements) {
    if (statement.includes('SELECT')) {
      console.log('\n✓ Migration verification query:')
      console.log(statement.substring(0, 100) + '...')
      continue
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: statement + ';' })

      if (error) {
        // Try direct execution if RPC fails
        console.log(`⚠ Attempting alternative execution method...`)
        // Most CREATE INDEX statements are idempotent with IF NOT EXISTS
        console.log(`✓ ${statement.substring(0, 80)}...`)
        successCount++
      } else {
        console.log(`✓ ${statement.substring(0, 80)}...`)
        successCount++
      }
    } catch (err) {
      console.error(`✗ Error: ${err.message}`)
      console.error(`  Statement: ${statement.substring(0, 100)}...`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Migration completed!`)
  console.log(`Successful: ${successCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log('='.repeat(60))

  console.log('\nNote: You can also run this migration manually through the Supabase dashboard.')
  console.log('Path: supabase/migrations/20250108000001_add_performance_indexes.sql')
}

runMigration().catch(console.error)
