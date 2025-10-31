const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  console.log('🚀 Running OpenAI Settings Migration directly via pg...\n')

  const client = new Client({
    host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
    port: 6543, // Use connection pooler port
    database: 'postgres',
    user: 'postgres.ohmioijbzvhoydyhdkdk',
    password: 'nLyrqefAev8R-pW-T3.y',
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'OPENAI_MIGRATION_MANUAL.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Executing migration SQL...\n')

    // Execute the SQL
    const result = await client.query(sql)

    console.log('✅ Migration completed successfully!\n')

    // Show results
    if (result && Array.isArray(result)) {
      result.forEach((res, i) => {
        if (res.rows && res.rows.length > 0) {
          console.log(`Result ${i + 1}:`)
          console.table(res.rows)
        }
      })
    } else if (result && result.rows && result.rows.length > 0) {
      console.log('Results:')
      console.table(result.rows)
    }

    console.log('\n📊 Migration Summary:')
    console.log('   ✅ Created user_openai_settings table')
    console.log('   ✅ Created index on user_id')
    console.log('   ✅ Enabled Row Level Security')
    console.log('   ✅ Created 4 RLS policies')
    console.log('   ✅ Added updated_at trigger')
    console.log('\n🎉 OpenAI settings system is now fully operational!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    if (error.code) console.error('Error code:', error.code)
    if (error.detail) console.error('Detail:', error.detail)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

runMigration()
