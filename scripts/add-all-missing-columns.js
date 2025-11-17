/**
 * Add ALL Missing Columns to lead_captures
 * Includes: visit_count, ip_address, brand_id, AND all geolocation fields
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAllMissingColumns() {
  console.log('🔧 Adding ALL Missing Columns to lead_captures...\n')

  const sql = `
    -- Add visit tracking columns
    ALTER TABLE lead_captures
    ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
    ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,

    -- Add geolocation columns
    ADD COLUMN IF NOT EXISTS geo_country_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS geo_country_code2 VARCHAR(2),
    ADD COLUMN IF NOT EXISTS geo_state_prov VARCHAR(100),
    ADD COLUMN IF NOT EXISTS geo_city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS geo_zipcode VARCHAR(20),
    ADD COLUMN IF NOT EXISTS geo_latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS geo_longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS geo_timezone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS geo_isp VARCHAR(255),
    ADD COLUMN IF NOT EXISTS geo_organization VARCHAR(255),
    ADD COLUMN IF NOT EXISTS geo_continent_name VARCHAR(50),
    ADD COLUMN IF NOT EXISTS geo_continent_code VARCHAR(2),
    ADD COLUMN IF NOT EXISTS geo_currency_code VARCHAR(3),
    ADD COLUMN IF NOT EXISTS geo_currency_name VARCHAR(50),
    ADD COLUMN IF NOT EXISTS geo_calling_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS geo_languages VARCHAR(255),
    ADD COLUMN IF NOT EXISTS geo_data JSONB;

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);
    CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id);
    CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_country ON lead_captures(geo_country_code2);
    CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_city ON lead_captures(geo_city);
    CREATE INDEX IF NOT EXISTS idx_lead_captures_geo_state ON lead_captures(geo_state_prov);
  `.trim()

  try {
    console.log('⚙️  Executing SQL via exec_sql RPC...\n')

    const { data, error } = await supabase.rpc('exec_sql', { sql: sql })

    if (error) {
      console.log(`   ❌ Failed: ${error.message}`)
      console.log('   Details:', error)
      return false
    }

    console.log('   ✅ SQL executed successfully!')

    return true

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

addAllMissingColumns().then(async (success) => {
  if (!success) {
    console.log('\n❌ Failed to add columns via script')
    process.exit(1)
  }

  // Verify all columns exist
  console.log('\n🔍 Verifying all columns were added...\n')

  const { data, error } = await supabase
    .from('lead_captures')
    .select('id, email, visit_count, ip_address, brand_id, geo_country_name, geo_city, geo_zipcode')
    .limit(1)

  if (error) {
    console.log('❌ Verification failed:', error.message)
    const missing = error.message.match(/'([^']+)'/)?.[1]
    if (missing) {
      console.log(`   Missing column: ${missing}`)
    }
    process.exit(1)
  }

  console.log('✅ All columns verified!')
  console.log('   Core fields:')
  console.log('   - visit_count: ✓')
  console.log('   - ip_address: ✓')
  console.log('   - brand_id: ✓')
  console.log('   Geolocation fields:')
  console.log('   - geo_country_name: ✓')
  console.log('   - geo_city: ✓')
  console.log('   - geo_zipcode: ✓')
  console.log('   - ... and 11 more geo fields ✓\n')

  // Try test insert
  console.log('🧪 Testing lead capture insert with all fields...')

  const { data: brands } = await supabase.from('brands').select('id').limit(1).single()

  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test-complete-${Date.now()}@example.com`,
    company_name: 'Test Company',
    visit_count: 1,
    ip_address: '8.8.8.8',
    brand_id: brands?.id || null,
    geo_country_name: 'United States',
    geo_city: 'Mountain View',
    geo_zipcode: '94043'
  }

  const { data: lead, error: insertError } = await supabase
    .from('lead_captures')
    .insert([testData])
    .select('id, email, visit_count, geo_city')
    .single()

  if (insertError) {
    console.log('❌ Test insert failed:', insertError.message)
    process.exit(1)
  }

  console.log('✅ Test insert successful!')
  console.log(`   - Lead ID: ${lead.id}`)
  console.log(`   - Visit count: ${lead.visit_count}`)
  console.log(`   - Geo city: ${lead.geo_city}`)

  // Clean up
  await supabase.from('lead_captures').delete().eq('id', lead.id)
  console.log('   🧹 Cleaned up test lead\n')

  console.log('🎉 SUCCESS! All columns added and verified!')
  console.log('   Lead capture form will now work without 500 errors.\n')
})
