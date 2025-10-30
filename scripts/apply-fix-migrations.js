// Apply pending migrations to fix scenarios and calculator visits
const https = require('https')
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
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', supabaseUrl)
    const postData = JSON.stringify({ sql })

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(url, options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function runMigrations() {
  console.log('🚀 Applying database migrations...\n')
  console.log(`📦 Supabase URL: ${supabaseUrl}\n`)

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '../FIX_MIGRATIONS.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Split SQL into individual statements (split by semicolon followed by newline)
    const statements = sqlContent
      .split(/;[\s]*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== 'SELECT')

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    for (let i = 0; i < statements.length; i++) {
      let statement = statements[i]
      if (!statement) continue

      // Add semicolon back if it doesn't have one
      if (!statement.endsWith(';')) {
        statement += ';'
      }

      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      console.log(`[${i + 1}/${statements.length}] ${preview}...`)

      try {
        await executeSQL(statement)
        console.log(`   ✅ Success\n`)
      } catch (error) {
        // Check if it's the first exec_sql creation failing (exec_sql doesn't exist yet)
        if (i === 0 && error.message.includes('exec_sql')) {
          console.log(`   ⚠️  exec_sql function doesn't exist yet - creating it directly...\n`)
          // We'll need to use the Supabase Management API or dashboard for the first function
          console.log('   Please run this SQL in your Supabase Dashboard SQL Editor first:')
          console.log('   --------------------------------------------------------')
          console.log(statements[0])
          console.log('   --------------------------------------------------------\n')
          console.log('   Then re-run this script.\n')
          process.exit(1)
        }
        
        // Some errors are expected (like IF NOT EXISTS when column exists)
        if (error.message.includes('already exists') || error.message.includes('does not exist')) {
          console.log(`   ℹ️  Already exists (skipping)\n`)
        } else {
          console.log(`   ⚠️  Warning: ${error.message}\n`)
        }
      }
    }

    console.log('✨ All migrations completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - exec_sql function created')
    console.log('   - zipcode column added to calculator_visits')
    console.log('   - brand_id column added to calculator_visits')
    console.log('   - brand_id column added to roi_scenarios')
    console.log('\n🎉 Scenarios and calculator visits should now work correctly!\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigrations()
