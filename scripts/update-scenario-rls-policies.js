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

async function updateRLSPolicies() {
  console.log('🔧 Updating RLS policies for anonymous scenarios...\n')

  const commands = [
    {
      name: 'Enable RLS on roi_scenarios',
      sql: 'ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY'
    },
    {
      name: 'Enable RLS on calculator_sessions',
      sql: 'ALTER TABLE calculator_sessions ENABLE ROW LEVEL SECURITY'
    },
    {
      name: 'Drop old scenarios INSERT policy (if exists)',
      sql: 'DROP POLICY IF EXISTS "Users can create their own scenarios" ON roi_scenarios'
    },
    {
      name: 'Drop old sessions INSERT policy (if exists)',
      sql: 'DROP POLICY IF EXISTS "Users can create their own sessions" ON calculator_sessions'
    },
    {
      name: 'Allow anyone to INSERT scenarios (anonymous or authenticated)',
      sql: `CREATE POLICY "Anyone can create scenarios"
        ON roi_scenarios FOR INSERT
        TO public
        WITH CHECK (true)`
    },
    {
      name: 'Allow anyone to INSERT calculator sessions',
      sql: `CREATE POLICY "Anyone can create calculator sessions"
        ON calculator_sessions FOR INSERT
        TO public
        WITH CHECK (true)`
    },
    {
      name: 'Allow users to view their own scenarios',
      sql: `CREATE POLICY "Users can view their own scenarios"
        ON roi_scenarios FOR SELECT
        TO authenticated
        USING (user_id = auth.uid())`
    },
    {
      name: 'Allow admins to view all scenarios (including anonymous)',
      sql: `CREATE POLICY "Admins can view all scenarios"
        ON roi_scenarios FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.is_admin = TRUE
          )
        )`
    }
  ]

  for (const cmd of commands) {
    console.log(`Running: ${cmd.name}...`)
    try {
      await executeSQL(cmd.sql)
      console.log(`   ✅ Success\n`)
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ℹ️  Already exists (skipping)\n`)
      } else if (error.message.includes('does not exist')) {
        console.log(`   ℹ️  Does not exist (skipping)\n`)
      } else {
        console.log(`   ⚠️  Warning: ${error.message}\n`)
      }
    }
  }

  console.log('✨ RLS policies updated successfully!\n')
  console.log('📋 Summary:')
  console.log('   - Anonymous users can INSERT scenarios and sessions')
  console.log('   - Authenticated users can VIEW their own scenarios')
  console.log('   - Admins can VIEW all scenarios (including anonymous)')
  console.log('')
}

updateRLSPolicies()
