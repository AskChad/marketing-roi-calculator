const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Running OpenAI Settings Migration...\n')

  const client = new Client({
    host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'nLyrqefAev8R-pW-T3.y',
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250103000000_openai_settings.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📝 Executing migration SQL...\n')

    // Execute the SQL
    await client.query(sql)

    console.log('✅ Migration completed successfully!\n')
    console.log('📊 Changes applied:')
    console.log('   ✅ Added 5 OpenAI settings to admin_settings table')
    console.log('   ✅ Created user_openai_settings table')
    console.log('   ✅ Created index on user_id')
    console.log('   ✅ Enabled Row Level Security')
    console.log('   ✅ Created 4 RLS policies')
    console.log('   ✅ Added updated_at trigger')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\nError details:', error)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

runMigration()
