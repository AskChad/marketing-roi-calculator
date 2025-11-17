/**
 * Check Lead Capture Schema
 * Verifies that brand_id column exists in lead_captures table
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLeadCaptureSchema() {
  console.log('🔍 Checking lead_captures table schema...\n')

  try {
    // Try to query lead_captures with brand_id
    console.log('📋 Test 1: Query lead_captures table')
    const { data: leads, error: queryError } = await supabase
      .from('lead_captures')
      .select('id, email, brand_id, created_at')
      .limit(3)

    if (queryError) {
      console.log(`   ❌ Error querying lead_captures:`)
      console.log(`      ${queryError.message}`)

      if (queryError.message.includes('column') && queryError.message.includes('brand_id')) {
        console.log('\n⚠️  brand_id column does NOT exist in lead_captures table!')
        console.log('   The brands migration has not been applied.\n')
        console.log('📋 To fix:')
        console.log('   1. Run the brands migration:')
        console.log('      File: supabase/migrations/20250107000000_create_brands_table.sql')
        console.log('   2. Or run: node scripts/apply-brands-migration.js')
        return false
      }

      throw queryError
    }

    console.log(`   ✅ Successfully queried lead_captures table`)
    console.log(`      Found ${leads.length} lead(s)`)

    if (leads.length > 0) {
      console.log('\n   Sample records:')
      leads.forEach(lead => {
        const brandIdDisplay = lead.brand_id === null ? 'NULL' : lead.brand_id
        console.log(`   - ${lead.email}: brand_id = ${brandIdDisplay}`)
      })
    }

    // Check if default brand exists
    console.log('\n📋 Test 2: Check for default brand')
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, subdomain, is_active')
      .order('created_at', { ascending: true })

    if (brandsError) {
      console.log(`   ❌ Error querying brands:`)
      console.log(`      ${brandsError.message}`)
      throw brandsError
    }

    console.log(`   ✅ Found ${brands.length} brand(s):`)
    brands.forEach(brand => {
      const subdomainDisplay = brand.subdomain === null ? 'NULL' : `"${brand.subdomain}"`
      const activeDisplay = brand.is_active ? '✓' : '✗'
      console.log(`      ${activeDisplay} ${brand.name} (subdomain: ${subdomainDisplay})`)
      console.log(`         ID: ${brand.id}`)
    })

    // Check for default brand specifically
    const defaultBrand = brands.find(b => b.subdomain === 'default')
    if (!defaultBrand) {
      console.log('\n   ⚠️  No brand with subdomain "default" found')
      console.log('      This is needed for the fallback in getBrandFromRequest()')
    } else {
      console.log(`\n   ✅ Default brand found:`)
      console.log(`      ID: ${defaultBrand.id}`)
      console.log(`      Name: ${defaultBrand.name}`)
    }

    // Test inserting a lead with brand_id
    console.log('\n📋 Test 3: Test insert with brand_id')

    if (brands.length === 0) {
      console.log('   ⚠️  No brands in database, skipping insert test')
      return true
    }

    const testBrandId = brands[0].id
    const testEmail = `test-${Date.now()}@example.com`

    const { data: newLead, error: insertError } = await supabase
      .from('lead_captures')
      .insert([{
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        company_name: 'Test Company',
        brand_id: testBrandId,
        visit_count: 1
      }])
      .select('id, email, brand_id')
      .single()

    if (insertError) {
      console.log(`   ❌ Insert failed:`)
      console.log(`      ${insertError.message}`)
      throw insertError
    }

    console.log(`   ✅ Successfully inserted lead with brand_id`)
    console.log(`      Lead ID: ${newLead.id}`)
    console.log(`      Brand ID: ${newLead.brand_id}`)

    // Clean up
    await supabase.from('lead_captures').delete().eq('id', newLead.id)
    console.log(`   🧹 Cleaned up test lead`)

    console.log('\n✅ All schema checks passed!')
    console.log('   The lead_captures table is properly configured.')

    return true

  } catch (error) {
    console.error('\n❌ Schema check failed:', error.message)
    return false
  }
}

checkLeadCaptureSchema()
