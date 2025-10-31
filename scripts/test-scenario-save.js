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

async function testScenarioSave() {
  console.log('🔍 Testing scenario save functionality...\n')
  
  // Check if brand_id column exists in roi_scenarios
  const { data: scenarios, error: scenariosError } = await supabase
    .from('roi_scenarios')
    .select('*')
    .limit(1)
  
  if (scenariosError) {
    console.log('❌ Error querying roi_scenarios:', scenariosError.message)
  } else {
    console.log('✅ roi_scenarios table accessible')
    if (scenarios && scenarios.length > 0) {
      console.log('   Columns in table:', Object.keys(scenarios[0]).join(', '))
    }
  }
  
  // Check if brand_id column exists in calculator_visits
  const { data: visits, error: visitsError } = await supabase
    .from('calculator_visits')
    .select('*')
    .limit(1)
  
  if (visitsError) {
    console.log('❌ Error querying calculator_visits:', visitsError.message)
  } else {
    console.log('✅ calculator_visits table accessible')
    if (visits && visits.length > 0) {
      console.log('   Columns in table:', Object.keys(visits[0]).join(', '))
    }
  }
  
  // Check if any brands exist
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .limit(1)
  
  if (brandsError) {
    console.log('❌ Error querying brands:', brandsError.message)
  } else {
    console.log('✅ brands table accessible')
    if (brands && brands.length > 0) {
      console.log('   Found brand:', brands[0].name, '(ID:', brands[0].id + ')')
    } else {
      console.log('   ⚠️  No brands found in database')
    }
  }
  
  console.log('\n📊 Diagnosis complete!')
}

testScenarioSave()
