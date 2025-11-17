/**
 * Execute Lead Capture Fix using exec_sql
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeFix() {
  console.log('🔧 Executing Lead Capture Fix using exec_sql...\n')

  const sql = `
    ALTER TABLE lead_captures
    ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
    ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);
    CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);
  `.trim()

  try {
    console.log('⚙️  Executing SQL via exec_sql RPC...')

    const { data, error } = await supabase.rpc('exec_sql', { sql: sql })

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`)
      console.log('   Details:', error)

      console.log('\n📋 Manual approach required:')
      console.log('   1. Open: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new')
      console.log('   2. Copy and run APPLY-LEAD-CAPTURE-FIXES.sql')
      return false
    }

    console.log('   ✅ SQL executed successfully!')
    console.log('   Result:', data)

    return true

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

executeFix().then(async (success) => {
  if (!success) {
    process.exit(1)
  }

  // Verify the fix
  console.log('\n🔍 Verifying columns were added...\n')

  const { data, error } = await supabase
    .from('lead_captures')
    .select('id, email, visit_count, ip_address, brand_id')
    .limit(1)

  if (error) {
    console.log('❌ Verification failed:', error.message)
    console.log('   Columns may not have been added')
    process.exit(1)
  }

  console.log('✅ All columns verified!')
  console.log('   - visit_count: ✓')
  console.log('   - ip_address: ✓')
  console.log('   - brand_id: ✓\n')

  // Try test insert
  console.log('🧪 Testing lead capture insert...')

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
    .select('id, email, visit_count, brand_id')
    .single()

  if (insertError) {
    console.log('❌ Test insert failed:', insertError.message)
    process.exit(1)
  }

  console.log('✅ Test insert successful!')
  console.log(`   - Lead ID: ${lead.id}`)
  console.log(`   - Email: ${lead.email}`)
  console.log(`   - Visit count: ${lead.visit_count}`)
  console.log(`   - Brand ID: ${lead.brand_id || 'NULL'}`)

  // Clean up
  await supabase.from('lead_captures').delete().eq('id', lead.id)
  console.log('   🧹 Cleaned up test lead\n')

  console.log('🎉 SUCCESS! Lead capture is now fully functional!')
  console.log('   Your landing page form will work without 500 errors.\n')
})
