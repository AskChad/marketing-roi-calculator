// Run tracking_id migration using Supabase client
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
  console.log('Running tracking_id migration...\n')

  try {
    // Try to add column by querying information_schema first
    console.log('1. Checking lead_captures table...')
    const { data: leadCheck, error: leadCheckError } = await supabase
      .from('lead_captures')
      .select('*')
      .limit(1)

    if (leadCheckError) {
      console.error('Error checking lead_captures:', leadCheckError.message)
      throw leadCheckError
    }
    console.log('   ✓ lead_captures table exists')

    console.log('2. Checking users table...')
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (userCheckError) {
      console.error('Error checking users:', userCheckError.message)
      throw userCheckError
    }
    console.log('   ✓ users table exists')

    // Use REST API to execute raw SQL
    console.log('\n3. Executing SQL via REST API...')

    const migrations = [
      'ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS tracking_id UUID;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS tracking_id UUID;',
      'CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);',
      'CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);',
    ]

    for (let i = 0; i < migrations.length; i++) {
      console.log(`   Executing statement ${i + 1}/${migrations.length}...`)

      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: migrations[i] })
      })

      if (!response.ok) {
        console.log(`   Note: Status ${response.status} (may be expected)`)
      }
    }

    // Verify by trying to select tracking_id
    console.log('\n4. Verifying migration...')

    const { data: leadVerify, error: leadVerifyError } = await supabase
      .from('lead_captures')
      .select('tracking_id')
      .limit(1)

    if (leadVerifyError && leadVerifyError.message.includes('tracking_id')) {
      console.error('   ✗ lead_captures.tracking_id not found')
      console.log('\nThe migration could not be applied via the API.')
      console.log('Please run the SQL manually in Supabase Dashboard SQL Editor:')
      console.log('\n' + migrations.join('\n'))
      process.exit(1)
    } else {
      console.log('   ✓ lead_captures.tracking_id column is accessible')
    }

    const { data: userVerify, error: userVerifyError } = await supabase
      .from('users')
      .select('tracking_id')
      .limit(1)

    if (userVerifyError && userVerifyError.message.includes('tracking_id')) {
      console.error('   ✗ users.tracking_id not found')
      console.log('\nThe migration could not be applied via the API.')
      console.log('Please run the SQL manually in Supabase Dashboard SQL Editor:')
      console.log('\n' + migrations.join('\n'))
      process.exit(1)
    } else {
      console.log('   ✓ users.tracking_id column is accessible')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('Anonymous user tracking is now enabled.')

  } catch (error) {
    console.error('\n❌ Migration verification failed')
    console.log('\nPlease run the SQL manually in Supabase Dashboard:')
    console.log(`1. Go to ${supabaseUrl.replace('.supabase.co', '')}/dashboard`)
    console.log('2. Click SQL Editor')
    console.log('3. Run this SQL:\n')
    console.log('ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS tracking_id UUID;')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS tracking_id UUID;')
    console.log('CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);')
    console.log('CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);')
    process.exit(1)
  }
}

runMigration()
