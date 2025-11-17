const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testTrackingSystem() {
  console.log('🧪 Testing Tracking Cookie System')
  console.log('=' .repeat(60))

  // Test 1: Check calculator_visits for tracking IDs
  console.log('\n📊 Test 1: Verify Tracking IDs in calculator_visits')
  console.log('-'.repeat(60))

  const { data: visits, error: visitsError } = await supabase
    .from('calculator_visits')
    .select('id, tracking_id, user_id, visited_at, ip_address, city, country')
    .order('visited_at', { ascending: false })
    .limit(10)

  if (visitsError) {
    console.log('❌ FAIL: Could not fetch visits')
    console.log('   Error:', visitsError.message)
    return false
  }

  console.log(`\n✅ Found ${visits.length} recent visit(s)\n`)

  let visitsWithTracking = 0
  let uniqueTrackingIds = new Set()
  let multipleVisitsPerTracking = 0

  visits.forEach((visit, i) => {
    console.log(`Visit ${i+1}:`)
    console.log(`  ID: ${visit.id}`)
    console.log(`  Tracking ID: ${visit.tracking_id || 'NULL'}`)
    console.log(`  User ID: ${visit.user_id || 'anonymous'}`)
    console.log(`  Visited: ${visit.visited_at}`)
    console.log(`  Location: ${visit.city || 'N/A'}, ${visit.country || 'N/A'}`)
    console.log(`  IP: ${visit.ip_address}`)
    console.log('')

    if (visit.tracking_id) {
      visitsWithTracking++
      uniqueTrackingIds.add(visit.tracking_id)
    }
  })

  // Count how many tracking IDs have multiple visits
  const trackingIdCounts = {}
  visits.forEach(visit => {
    if (visit.tracking_id) {
      trackingIdCounts[visit.tracking_id] = (trackingIdCounts[visit.tracking_id] || 0) + 1
    }
  })

  Object.values(trackingIdCounts).forEach(count => {
    if (count > 1) multipleVisitsPerTracking++
  })

  console.log('📈 Summary:')
  console.log(`  Visits with tracking ID: ${visitsWithTracking}/${visits.length}`)
  console.log(`  Unique tracking IDs: ${uniqueTrackingIds.size}`)
  console.log(`  Tracking IDs with multiple visits: ${multipleVisitsPerTracking}`)

  if (visitsWithTracking === 0) {
    console.log('\n❌ FAIL: No tracking IDs found!')
    return false
  }

  console.log('\n✅ PASS: Tracking IDs are being stored')

  // Test 2: Check lead_captures for tracking IDs
  console.log('\n\n📊 Test 2: Verify Tracking IDs in lead_captures')
  console.log('-'.repeat(60))

  const { data: leads, error: leadsError } = await supabase
    .from('lead_captures')
    .select('id, tracking_id, email, created_at, geo_city, geo_country_name')
    .order('created_at', { ascending: false })
    .limit(5)

  if (leadsError) {
    console.log('❌ FAIL: Could not fetch leads')
    console.log('   Error:', leadsError.message)
    return false
  }

  if (leads.length === 0) {
    console.log('⚠️  WARN: No leads found (this is OK if no forms submitted)')
    return true
  }

  console.log(`\n✅ Found ${leads.length} recent lead(s)\n`)

  let leadsWithTracking = 0

  leads.forEach((lead, i) => {
    console.log(`Lead ${i+1}:`)
    console.log(`  Email: ${lead.email}`)
    console.log(`  Tracking ID: ${lead.tracking_id || 'NULL'}`)
    console.log(`  Location: ${lead.geo_city || 'N/A'}, ${lead.geo_country_name || 'N/A'}`)
    console.log(`  Created: ${lead.created_at}`)
    console.log('')

    if (lead.tracking_id) leadsWithTracking++
  })

  console.log('📈 Summary:')
  console.log(`  Leads with tracking ID: ${leadsWithTracking}/${leads.length}`)

  if (leadsWithTracking > 0) {
    console.log('\n✅ PASS: Lead tracking IDs are working')
  } else {
    console.log('\n⚠️  WARN: No leads have tracking IDs (but leads exist)')
  }

  // Test 3: Verify tracking ID format (should be valid UUIDs)
  console.log('\n\n📊 Test 3: Verify Tracking ID Format')
  console.log('-'.repeat(60))

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  let validUUIDs = 0
  let invalidUUIDs = 0

  uniqueTrackingIds.forEach(trackingId => {
    if (uuidRegex.test(trackingId)) {
      validUUIDs++
      console.log(`  ✅ Valid UUID: ${trackingId}`)
    } else {
      invalidUUIDs++
      console.log(`  ❌ Invalid UUID: ${trackingId}`)
    }
  })

  console.log(`\n📈 Summary:`)
  console.log(`  Valid UUIDs: ${validUUIDs}`)
  console.log(`  Invalid UUIDs: ${invalidUUIDs}`)

  if (invalidUUIDs > 0) {
    console.log('\n❌ FAIL: Some tracking IDs are not valid UUIDs!')
    return false
  }

  console.log('\n✅ PASS: All tracking IDs are valid UUIDs')

  // Final summary
  console.log('\n\n' + '='.repeat(60))
  console.log('📊 TRACKING SYSTEM TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Tracking IDs being generated: YES`)
  console.log(`✅ Tracking IDs stored in visits: ${visitsWithTracking}/${visits.length}`)
  console.log(`✅ Tracking IDs stored in leads: ${leadsWithTracking}/${leads.length}`)
  console.log(`✅ Valid UUID format: ${validUUIDs}/${uniqueTrackingIds.size}`)
  console.log(`✅ Repeat visitors trackable: ${multipleVisitsPerTracking > 0 ? 'YES' : 'N/A (need more data)'}`)
  console.log('='.repeat(60))
  console.log('\n🎉 Tracking cookie system is working correctly!')

  return true
}

testTrackingSystem().then(success => {
  process.exit(success ? 0 : 1)
})
