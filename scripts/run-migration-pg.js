// Run tracking_id migration using pg client
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

const databaseUrl = envVars.DATABASE_URL

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local')
  process.exit(1)
}

async function runMigration() {
  const client = new Client({
    connectionString: databaseUrl,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✓ Connected\n')

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
