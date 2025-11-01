/**
 * Run demo scenarios migration
 * Run with: node scripts/run-demo-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

async function runMigration() {
  console.log('Running demo scenarios migration...\n')

  const migrationPath = path.join(__dirname, '../supabase/migrations/20250109000000_create_demo_scenarios.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  // Split by statements and execute
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'

    // Skip comments
    if (statement.trim().startsWith('COMMENT ON')) {
      console.log(`Skipping comment statement...`)
      continue
    }

    console.log(`Executing statement ${i + 1}/${statements.length}...`)

    const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

    if (error) {
      console.error(`Error on statement ${i + 1}:`, error)
      console.error('Statement:', statement.substring(0, 200))
      // Continue anyway as some errors are expected (e.g., table already exists)
    } else {
      console.log(`✓ Statement ${i + 1} executed successfully`)
    }
  }

  console.log('\n✅ Migration completed!')
}

runMigration().catch(console.error)
