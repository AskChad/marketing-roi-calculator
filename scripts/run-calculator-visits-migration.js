// Run calculator_visits migration
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    envVars[key] = value
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('Running calculator_visits migration...\n')

  try {
    // Check if table already exists
    console.log('1. Checking if calculator_visits table exists...')
    const { data: existingTable, error: checkError } = await supabase
      .from('calculator_visits')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('   ✓ calculator_visits table already exists!')
      console.log('\n✅ Migration already completed!')
      return
    }

    console.log('   → calculator_visits table does not exist, creating...')

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../MIGRATION_SQL_CALCULATOR_VISITS.txt')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`\n2. Executing ${statements.length} SQL statements via REST API...\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      console.log(`   [${i + 1}/${statements.length}] Executing...`)

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: statement })
        })

        if (!response.ok) {
          console.log(`      Status ${response.status} - Statement may have executed via psql instead`)
        } else {
          console.log(`      ✓ Success`)
        }
      } catch (err) {
        console.log(`      Note: ${err.message}`)
      }
    }

    // Verify table was created
    console.log('\n3. Verifying calculator_visits table...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('calculator_visits')
      .select('id')
      .limit(1)

    if (verifyError && verifyError.message.includes('calculator_visits')) {
      throw new Error('Table was not created. SQL API may not support DDL.')
    }

    console.log('   ✓ calculator_visits table is accessible')
    console.log('\n✅ Migration completed successfully!')
    console.log('Calculator page visits will now be tracked.')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\nThe Supabase REST API may not support DDL operations.')
    console.log('Please run the SQL manually in Supabase Dashboard:')
    console.log(`1. Go to ${supabaseUrl.replace('.supabase.co', '')}/dashboard`)
    console.log('2. Click SQL Editor')
    console.log('3. Copy and paste MIGRATION_SQL_CALCULATOR_VISITS.txt')
    console.log('4. Click Run')
    process.exit(1)
  }
}

runMigration()
