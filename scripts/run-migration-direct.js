// Run tracking_id migration using direct pg connection
const { Client } = require('pg')
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
const dbPassword = envVars.SUPABASE_DB_PASSWORD

if (!supabaseUrl || !dbPassword) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Extract project ref from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

// Construct database connection string
// Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
// Try common US regions first
const possibleRegions = ['us-west-1', 'us-east-1', 'us-west-2', 'eu-west-1']

async function tryConnection(region) {
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres`

  const client = new Client({ connectionString })

  try {
    await client.connect()
    return client
  } catch (error) {
    return null
  }
}

async function runMigration() {
  console.log('Finding database region...')

  let client = null
  for (const region of possibleRegions) {
    console.log(`  Trying ${region}...`)
    client = await tryConnection(region)
    if (client) {
      console.log(`  ✓ Connected via ${region}\n`)
      break
    }
  }

  if (!client) {
    console.error('\n❌ Could not connect to database')
    console.error('Please check your database credentials or run migration manually through Supabase Dashboard')
    process.exit(1)
  }

  try {
    console.log('Running tracking_id migration...\n')

    // Add tracking_id to lead_captures
    console.log('1. Adding tracking_id column to lead_captures...')
    await client.query('ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS tracking_id UUID;')
    console.log('   ✓ Success')

    // Add tracking_id to users
    console.log('2. Adding tracking_id column to users...')
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS tracking_id UUID;')
    console.log('   ✓ Success')

    // Create index on lead_captures
    console.log('3. Creating index on lead_captures.tracking_id...')
    await client.query('CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);')
    console.log('   ✓ Success')

    // Create index on users
    console.log('4. Creating index on users.tracking_id...')
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);')
    console.log('   ✓ Success')

    // Add comments
    console.log('5. Adding column comments...')
    await client.query("COMMENT ON COLUMN lead_captures.tracking_id IS 'Anonymous visitor tracking ID from cookie. Used to identify users before registration.';")
    await client.query("COMMENT ON COLUMN users.tracking_id IS 'Carries over tracking_id from anonymous activity. Links pre-registration activity to user account.';")
    console.log('   ✓ Success')

    // Verify the columns exist
    console.log('\n6. Verifying migration...')

    const leadResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'lead_captures' AND column_name = 'tracking_id'
    `)

    if (leadResult.rows.length === 0) {
      throw new Error('lead_captures.tracking_id column not found')
    }
    console.log('   ✓ lead_captures.tracking_id exists (type: uuid)')

    const usersResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'tracking_id'
    `)

    if (usersResult.rows.length === 0) {
      throw new Error('users.tracking_id column not found')
    }
    console.log('   ✓ users.tracking_id exists (type: uuid)')

    // Check indexes
    const indexResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('lead_captures', 'users')
      AND indexname IN ('idx_lead_captures_tracking_id', 'idx_users_tracking_id')
    `)
    console.log(`   ✓ ${indexResult.rows.length} indexes created`)

    console.log('\n✅ Migration completed successfully!')
    console.log('Anonymous user tracking is now enabled.')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
