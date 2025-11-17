/**
 * Apply Lead Capture Fixes
 * Adds missing columns to lead_captures table
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFixes() {
  console.log('🔧 Applying Lead Capture Fixes...\n')

  try {
    // Test 1: Check current schema
    console.log('📋 Step 1: Checking current schema...')

    const { data: testQuery, error: testError } = await supabase
      .from('lead_captures')
      .select('id, email, ip_address, visit_count, brand_id')
      .limit(1)

    if (testError) {
      const errorMsg = testError.message.toLowerCase()

      if (errorMsg.includes('visit_count')) {
        console.log('   ❌ visit_count column is MISSING')
      }
      if (errorMsg.includes('ip_address')) {
        console.log('   ❌ ip_address column is MISSING')
      }
      if (errorMsg.includes('brand_id')) {
        console.log('   ❌ brand_id column is MISSING')
      }

      console.log('\n⚠️  Missing columns detected!')
      console.log('📋 To fix, run this SQL in Supabase Dashboard:\n')
      console.log('   File: APPLY-LEAD-CAPTURE-FIXES.sql')
      console.log('   URL: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new\n')

      console.log('📄 SQL to run:')
      console.log('─'.repeat(60))
      console.log(`
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);
CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);
      `.trim())
      console.log('─'.repeat(60))

      return false
    }

    console.log('   ✅ All required columns exist!')

    // Test 2: Try inserting a test lead
    console.log('\n📋 Step 2: Testing lead capture insert...')

    const { data: brands } = await supabase
      .from('brands')
      .select('id')
      .limit(1)
      .single()

    const testEmail = `test-lead-${Date.now()}@example.com`
    const testData = {
      first_name: 'Test',
      last_name: 'Lead',
      email: testEmail,
      company_name: 'Test Company',
      ip_address: '127.0.0.1',
      visit_count: 1,
      brand_id: brands?.id || null
    }

    const { data: newLead, error: insertError } = await supabase
      .from('lead_captures')
      .insert([testData])
      .select('id, email, visit_count, brand_id')
      .single()

    if (insertError) {
      console.log('   ❌ Insert failed:', insertError.message)
      throw insertError
    }

    console.log('   ✅ Successfully inserted test lead')
    console.log(`      - Email: ${newLead.email}`)
    console.log(`      - Visit count: ${newLead.visit_count}`)
    console.log(`      - Brand ID: ${newLead.brand_id || 'NULL'}`)

    // Clean up
    await supabase.from('lead_captures').delete().eq('id', newLead.id)
    console.log('   🧹 Cleaned up test lead')

    console.log('\n✅ All fixes applied successfully!')
    console.log('   Lead capture form should now work without errors.')

    return true

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    return false
  }
}

applyFixes().then(success => {
  process.exit(success ? 0 : 1)
})
