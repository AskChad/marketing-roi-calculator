const { createClient } = require('@supabase/supabase-js')
const { randomUUID } = require('crypto')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
  console.log('🧪 Testing full lead capture insert with all fields...\n')

  // Get first brand
  const { data: brands } = await supabase.from('brands').select('id').limit(1).single()

  // Exact same data structure as the API uses
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test-full-${Date.now()}@example.com`,
    phone: '+1234567890',
    company_name: 'Test Company',
    website_url: 'https://example.com',
    ip_address: '8.8.8.8',
    tracking_id: randomUUID(), // Use proper UUID
    brand_id: brands?.id || null,
    visit_count: 1,
    geo_country_name: 'United States',
    geo_country_code2: 'US',
    geo_state_prov: 'California',
    geo_city: 'Mountain View',
    geo_zipcode: '94043',
    geo_latitude: 37.386,
    geo_longitude: -122.084,
    geo_timezone: 'America/Los_Angeles',
    geo_isp: 'Google LLC',
    geo_organization: 'Google LLC',
    geo_continent_name: 'North America',
    geo_continent_code: 'NA',
    geo_currency_code: 'USD',
    geo_currency_name: 'US Dollar',
    geo_calling_code: '+1',
    geo_languages: 'en-US,es-US',
    geo_data: { test: 'data' },
  }

  console.log('📝 Attempting to insert lead with all fields...\n')

  const { data, error } = await supabase
    .from('lead_captures')
    .insert([testData])
    .select('id, email')
    .single()

  if (error) {
    console.error('❌ Insert failed!')
    console.error('   Error:', error.message)
    console.error('   Details:', error.details)
    console.error('   Hint:', error.hint)
    console.error('   Code:', error.code)

    // Check if it's a column error
    if (error.message.includes('column') || error.code === '42703') {
      const match = error.message.match(/"([^"]+)"/)
      if (match) {
        console.error(`\n⚠️  Missing column: ${match[1]}`)
      }
    }

    process.exit(1)
  }

  console.log('✅ Insert successful!')
  console.log(`   Lead ID: ${data.id}`)
  console.log(`   Email: ${data.email}`)

  // Clean up
  await supabase.from('lead_captures').delete().eq('id', data.id)
  console.log('   🧹 Cleaned up test lead\n')

  console.log('🎉 All fields inserted successfully!')
}

testInsert()
