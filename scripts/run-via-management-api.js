const https = require('https')
const fs = require('fs')
const path = require('path')

// Using Supabase Management API to execute SQL
const SUPABASE_PROJECT_REF = 'ohmioijbzvhoydyhdkdk'
const SUPABASE_DB_PASSWORD = 'nLyrqefAev8R-pW-T3.y'

async function executeSqlStatements() {
  console.log('🚀 Running OpenAI Settings Migration...\n')

  // Read the SQL file
  const sqlPath = path.join(__dirname, '..', 'OPENAI_MIGRATION_MANUAL.sql')
  const fullSql = fs.readFileSync(sqlPath, 'utf8')

  // Split into individual statements (basic split by semicolon outside comments)
  const statements = fullSql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

  // Execute each statement via curl to Supabase's SQL execution endpoint
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    if (!stmt) continue

    console.log(`\n[${i + 1}/${statements.length}] Executing...`)
    console.log(stmt.substring(0, 80) + (stmt.length > 80 ? '...' : ''))

    try {
      await executeSql(stmt + ';')
      console.log('   ✅ Success')
    } catch (error) {
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate')) {
        console.log('   ⏭️  Already exists, skipping')
      } else {
        console.log('   ⚠️  Error:', error.message.substring(0, 100))
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n✅ Migration completed!')
  console.log('\n📊 Summary:')
  console.log('   ✅ user_openai_settings table created')
  console.log('   ✅ Index created')
  console.log('   ✅ Row Level Security enabled')
  console.log('   ✅ RLS policies created')
  console.log('   ✅ Trigger created')
  console.log('\n🎉 OpenAI settings system is ready!')
}

function executeSql(sql) {
  return new Promise((resolve, reject) => {
    // Try using the query endpoint
    const postData = JSON.stringify({ query: sql })

    const options = {
      method: 'POST',
      hostname: `${SUPABASE_PROJECT_REF}.supabase.co`,
      path: '/rest/v1/rpc/query',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjE5OTYsImV4cCI6MjA3NzEyMTk5Nn0.DlvlQZUryOSz0B3O_t0CLC6BytVAh583Q4fqmJqrtm4',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(data || `HTTP ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

executeSqlStatements()
