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

async function addTrackingIdColumn() {
  console.log('🔧 Adding tracking_id column to roi_scenarios...\n')

  const commands = [
    {
      name: 'Add tracking_id to roi_scenarios',
      sql: 'ALTER TABLE roi_scenarios ADD COLUMN IF NOT EXISTS tracking_id TEXT'
    },
    {
      name: 'Add index on roi_scenarios.tracking_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_roi_scenarios_tracking_id ON roi_scenarios(tracking_id)'
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
      } else {
        console.log(`   ❌ Error: ${error.message}\n`)
      }
    }
  }

  console.log('✨ Tracking ID column added successfully!\n')
}

addTrackingIdColumn()
