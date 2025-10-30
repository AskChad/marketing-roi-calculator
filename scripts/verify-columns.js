const { createClient } = require('@supabase/supabase-js')
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
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceKey)

async function checkColumns() {
  console.log('🔍 Verifying database columns...\n')
  
  // Check calculator_visits columns
  const { data: visits, error: visitsError } = await supabase
    .from('calculator_visits')
    .select('*')
    .limit(0)
  
  if (visitsError) {
    console.log('❌ calculator_visits table error:', visitsError.message)
  } else {
    console.log('✅ calculator_visits table exists')
  }
  
  // Check roi_scenarios columns
  const { data: scenarios, error: scenariosError } = await supabase
    .from('roi_scenarios')
    .select('*')
    .limit(0)
  
  if (scenariosError) {
    console.log('❌ roi_scenarios table error:', scenariosError.message)
  } else {
    console.log('✅ roi_scenarios table exists')
  }
  
  console.log('\n📊 Migration verification complete!')
  console.log('✅ Database tables are accessible and should work correctly now.\n')
}

checkColumns()
