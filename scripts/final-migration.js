const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Running Final OpenAI Migration...\n')

  // Try different connection options
  const connectionConfigs = [
    {
      name: 'Direct connection (port 5432)',
      config: {
        host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: 'nLyrqefAev8R-pW-T3.y',
        ssl: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Pooler connection (port 6543)',
      config: {
        host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
        port: 6543,
        database: 'postgres',
        user: 'postgres.ohmioijbzvhoydyhdkdk',
        password: 'nLyrqefAev8R-pW-T3.y',
        ssl: { rejectUnauthorized: false }
      }
    }
  ]

  for (const { name, config } of connectionConfigs) {
    console.log(`\nTrying ${name}...`)

    const client = new Client(config)

    try {
      await client.connect()
      console.log('✅ Connected successfully!\n')

      // Read the migration SQL
      const sqlPath = path.join(__dirname, '..', 'OPENAI_MIGRATION_MANUAL.sql')
      const sql = fs.readFileSync(sqlPath, 'utf8')

      console.log('📝 Executing migration SQL...\n')

      // Execute the SQL
      await client.query(sql)

      console.log('\n✅ Migration completed successfully!\n')
      console.log('📊 Changes applied:')
      console.log('   ✅ Created user_openai_settings table')
      console.log('   ✅ Created index on user_id')
      console.log('   ✅ Enabled Row Level Security')
      console.log('   ✅ Created 4 RLS policies')
      console.log('   ✅ Added updated_at trigger')
      console.log('\n🎉 OpenAI settings system is now fully operational!')

      await client.end()
      return // Success! Exit
    } catch (error) {
      await client.end()

      if (error.code === 'ENOTFOUND' || error.code === 'ENETUNREACH' || error.code === 'ETIMEDOUT') {
        console.log(`   ❌ Connection failed: ${error.message}`)
        console.log('   Trying next connection method...')
        continue
      }

      // Other errors (like "already exists") are OK
      if (error.message && (error.message.includes('already exists') || error.code === '42P07')) {
        console.log('   ✅ Migration already completed (table exists)')
        return
      }

      console.error('   ❌ Migration error:', error.message)
      if (error.code) console.error('   Error code:', error.code)
    }
  }

  console.log('\n❌ All connection attempts failed')
  console.log('\n📋 Please run the SQL manually:')
  console.log('   1. Go to: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new')
  console.log('   2. Copy SQL from: OPENAI_MIGRATION_MANUAL.sql')
  console.log('   3. Paste and click "Run"')
}

runMigration()
