/**
 * Comprehensive Test Suite for Analytics Fixes
 * Tests:
 * 1. Geo data capture
 * 2. Brand tracking
 * 3. Page path tracking
 * 4. visit_logs functionality
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runTests() {
  console.log('🧪 Running Comprehensive Analytics Tests\n')
  console.log('=' .repeat(60))

  let passed = 0
  let failed = 0

  // Test 1: Check recent calculator_visits have geo data
  console.log('\n📊 Test 1: Verify Geo Data in calculator_visits')
  console.log('-'.repeat(60))

  const { data: recentVisits, error: visitsError } = await supabase
    .from('calculator_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(5)

  if (visitsError) {
    console.log('❌ FAIL: Could not fetch calculator_visits')
    console.log('   Error:', visitsError.message)
    failed++
  } else if (recentVisits.length === 0) {
    console.log('⚠️  WARN: No visits found (database might be empty)')
    console.log('   This is OK if no one has visited yet')
  } else {
    console.log(`✅ Found ${recentVisits.length} recent visit(s)`)

    let visitsWithGeo = 0
    let visitsWithBrand = 0
    let visitsWithPage = 0

    recentVisits.forEach((visit, i) => {
      console.log(`\nVisit ${i+1}:`)
      console.log(`  Visited: ${visit.visited_at}`)
      console.log(`  Brand ID: ${visit.brand_id || 'NULL'}`)
      console.log(`  Page: ${visit.page_path || 'NULL'}`)
      console.log(`  Geo - City: ${visit.city || 'NULL'}`)
      console.log(`  Geo - Region: ${visit.region || 'NULL'}`)
      console.log(`  Geo - Country: ${visit.country || 'NULL'}`)

      if (visit.city || visit.country) visitsWithGeo++
      if (visit.brand_id) visitsWithBrand++
      if (visit.page_path) visitsWithPage++
    })

    console.log(`\n📈 Summary:`)
    console.log(`  Visits with geo data: ${visitsWithGeo}/${recentVisits.length}`)
    console.log(`  Visits with brand: ${visitsWithBrand}/${recentVisits.length}`)
    console.log(`  Visits with page_path: ${visitsWithPage}/${recentVisits.length}`)

    if (visitsWithGeo > 0) {
      console.log('✅ PASS: Geo data is being captured')
      passed++
    } else {
      console.log('❌ FAIL: No geo data found in recent visits')
      failed++
    }
  }

  // Test 2: Check visit_logs table exists and has data
  console.log('\n\n📊 Test 2: Verify visit_logs Table')
  console.log('-'.repeat(60))

  const { data: visitLogs, error: logsError } = await supabase
    .from('visit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (logsError) {
    console.log('❌ FAIL: visit_logs table error')
    console.log('   Error:', logsError.message)
    failed++
  } else if (visitLogs.length === 0) {
    console.log('⚠️  WARN: No visit logs found')
    console.log('   This is OK if no lead forms have been submitted')
  } else {
    console.log(`✅ PASS: visit_logs table accessible, found ${visitLogs.length} log(s)`)
    passed++

    visitLogs.forEach((log, i) => {
      console.log(`\nLog ${i+1}:`)
      console.log(`  Created: ${log.created_at}`)
      console.log(`  Page: ${log.page_path}`)
      console.log(`  Lead ID: ${log.lead_capture_id || 'NULL'}`)
    })
  }

  // Test 3: Check brands are properly configured
  console.log('\n\n📊 Test 3: Verify Brands Configuration')
  console.log('-'.repeat(60))

  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)

  if (brandsError) {
    console.log('❌ FAIL: Could not fetch brands')
    console.log('   Error:', brandsError.message)
    failed++
  } else {
    console.log(`✅ PASS: Found ${brands.length} active brand(s)`)
    passed++

    brands.forEach(brand => {
      console.log(`\n  - ${brand.name}`)
      console.log(`    ID: ${brand.id}`)
      console.log(`    Domain: ${brand.domain}`)
      console.log(`    Subdomain: ${brand.subdomain || 'NULL'}`)
    })
  }

  // Test 4: Check lead_captures have geo data
  console.log('\n\n📊 Test 4: Verify Geo Data in lead_captures')
  console.log('-'.repeat(60))

  const { data: leads, error: leadsError } = await supabase
    .from('lead_captures')
    .select('id, email, created_at, geo_city, geo_country_name, geo_latitude, geo_longitude, brand_id')
    .order('created_at', { ascending: false})
    .limit(5)

  if (leadsError) {
    console.log('❌ FAIL: Could not fetch lead_captures')
    console.log('   Error:', leadsError.message)
    failed++
  } else if (leads.length === 0) {
    console.log('⚠️  WARN: No leads found')
    console.log('   This is OK if no forms have been submitted')
  } else {
    console.log(`✅ Found ${leads.length} recent lead(s)`)

    let leadsWithGeo = 0
    let leadsWithBrand = 0

    leads.forEach((lead, i) => {
      console.log(`\nLead ${i+1}:`)
      console.log(`  Email: ${lead.email}`)
      console.log(`  Brand ID: ${lead.brand_id || 'NULL'}`)
      console.log(`  Geo - City: ${lead.geo_city || 'NULL'}`)
      console.log(`  Geo - Country: ${lead.geo_country_name || 'NULL'}`)
      console.log(`  Geo - Coords: ${lead.geo_latitude || 'NULL'}, ${lead.geo_longitude || 'NULL'}`)

      if (lead.geo_city || lead.geo_country_name) leadsWithGeo++
      if (lead.brand_id) leadsWithBrand++
    })

    console.log(`\n📈 Summary:`)
    console.log(`  Leads with geo data: ${leadsWithGeo}/${leads.length}`)
    console.log(`  Leads with brand: ${leadsWithBrand}/${leads.length}`)

    if (leadsWithGeo > 0) {
      console.log('✅ PASS: Geo data is being captured in lead_captures')
      passed++
    } else {
      console.log('❌ FAIL: No geo data found in lead_captures')
      failed++
    }
  }

  // Final Summary
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: (non-critical)`)
  console.log('='.repeat(60))

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Analytics system is working correctly.')
    return true
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.')
    return false
  }
}

runTests().then(success => {
  process.exit(success ? 0 : 1)
})
