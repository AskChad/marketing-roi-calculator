// Run calculator_visits migration using direct PostgreSQL connection
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
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

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

// Try multiple regions
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
  console.log('Running calculator_visits migration...\n')
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
    console.error('Please run the SQL manually in Supabase Dashboard SQL Editor')
    process.exit(1)
  }

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../MIGRATION_SQL_CALCULATOR_VISITS.txt')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Clean up SQL - remove comments and empty lines
    const cleanedSQL = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim())
      .join('\n')

    // Execute the entire SQL as one transaction
    console.log('Executing migration SQL...\n')
    await client.query(cleanedSQL)

    console.log('✅ Migration completed successfully!')
    console.log('Calculator page visits will now be tracked with IP addresses.\n')

    // Verify the table exists
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'calculator_visits'
    `)

    if (result.rows.length > 0) {
      console.log('✓ Verified: calculator_visits table exists')

      // Check indexes
      const indexes = await client.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'calculator_visits'
      `)
      console.log(`✓ Created ${indexes.rows.length} indexes`)
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\nPlease run the SQL manually in Supabase Dashboard:')
    console.log(`1. Go to ${supabaseUrl.replace('.supabase.co', '')}/dashboard`)
    console.log('2. Click SQL Editor')
    console.log('3. Copy and paste MIGRATION_SQL_CALCULATOR_VISITS.txt')
    console.log('4. Click Run')
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
