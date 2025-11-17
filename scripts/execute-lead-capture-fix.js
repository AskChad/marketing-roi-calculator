/**
 * Execute Lead Capture Fix SQL
 * Directly executes SQL to add missing columns
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQL(sql, description) {
  console.log(`⚙️  ${description}...`)

  try {
    // Try using rpc to execute SQL
    const { data, error } = await supabase.rpc('exec', { query: sql })

    if (error) {
      // If rpc fails, try another method
      console.log(`   ⚠️  RPC method not available, trying direct execution...`)

      // Use REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: sql })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text}`)
      }

      console.log(`   ✅ Success`)
      return true
    }

    console.log(`   ✅ Success`)
    return true

  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`)
    return false
  }
}

async function executeFix() {
  console.log('🔧 Executing Lead Capture Fix SQL...\n')

  const statements = [
    {
      sql: `ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;`,
      desc: 'Adding visit_count column'
    },
    {
      sql: `ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);`,
      desc: 'Adding ip_address column'
    },
    {
      sql: `ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;`,
      desc: 'Adding brand_id column'
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);`,
      desc: 'Creating ip_address index'
    },
    {
      sql: `CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);`,
      desc: 'Creating brand_id index'
    }
  ]

  let successCount = 0
  let failCount = 0

  for (const stmt of statements) {
    const success = await executeSQL(stmt.sql, stmt.desc)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed\n`)

  if (failCount > 0) {
    console.log('⚠️  Some SQL statements could not be executed via API')
    console.log('   This is expected - trying alternative method...\n')
    return false
  }

  return true
}

// Run the fix
executeFix().then(async (success) => {
  if (!success) {
    console.log('🔄 Trying alternative approach with combined SQL...\n')

    const combinedSQL = `
      ALTER TABLE lead_captures
      ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
      ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
    `

    const worked = await executeSQL(combinedSQL, 'Executing combined ALTER TABLE')

    if (!worked) {
      console.log('\n❌ Could not execute SQL via API')
      console.log('📋 Manual approach required:')
      console.log('   1. Open: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new')
      console.log('   2. Run: APPLY-LEAD-CAPTURE-FIXES.sql')
      process.exit(1)
    }
  }

  // Verify the fix
  console.log('🔍 Verifying columns were added...\n')

  const { data, error } = await supabase
    .from('lead_captures')
    .select('id, email, visit_count, ip_address, brand_id')
    .limit(1)

  if (error) {
    console.log('❌ Verification failed:', error.message)
    process.exit(1)
  }

  console.log('✅ All columns verified!')
  console.log('   Lead capture form should now work!\n')

  // Try test insert
  const { data: brands } = await supabase.from('brands').select('id').limit(1).single()

  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test-${Date.now()}@example.com`,
    company_name: 'Test Company',
    visit_count: 1,
    ip_address: '127.0.0.1',
    brand_id: brands?.id || null
  }

  const { data: lead, error: insertError } = await supabase
    .from('lead_captures')
    .insert([testData])
    .select('id')
    .single()

  if (insertError) {
    console.log('❌ Test insert failed:', insertError.message)
    process.exit(1)
  }

  console.log('✅ Test insert successful!')
  console.log('   Lead ID:', lead.id)

  // Clean up
  await supabase.from('lead_captures').delete().eq('id', lead.id)
  console.log('   🧹 Cleaned up test lead\n')

  console.log('🎉 SUCCESS! Lead capture is now fully functional!\n')
})
