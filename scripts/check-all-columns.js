const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
  console.log('🔍 Checking all columns in lead_captures table...\n')

  // Use information_schema to get column list
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'lead_captures'
      ORDER BY ordinal_position;
    `
  })

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log('📋 Columns in lead_captures table:\n')
  
  const requiredColumns = [
    'visit_count',
    'ip_address',
    'brand_id',
    'geo_country_name',
    'geo_country_code2',
    'geo_state_prov',
    'geo_city',
    'geo_zipcode',
    'geo_latitude',
    'geo_longitude',
    'geo_timezone',
    'geo_isp',
    'geo_organization',
    'geo_continent_name',
    'geo_continent_code',
    'geo_currency_code',
    'geo_currency_name',
    'geo_calling_code',
    'geo_languages',
    'geo_data'
  ]

  const existingColumns = data.map(col => col.column_name)
  
  console.log('✅ All columns (' + data.length + ' total):\n')
  data.forEach(col => {
    const mark = requiredColumns.includes(col.column_name) ? '🎯' : '  '
    console.log(`${mark} ${col.column_name} (${col.data_type})`)
  })

  console.log('\n🔍 Checking required columns:\n')
  
  const missing = []
  requiredColumns.forEach(col => {
    if (existingColumns.includes(col)) {
      console.log(`✅ ${col}`)
    } else {
      console.log(`❌ ${col} - MISSING!`)
      missing.push(col)
    }
  })

  if (missing.length > 0) {
    console.log(`\n⚠️  ${missing.length} column(s) are missing!`)
    console.log('Missing columns:', missing.join(', '))
  } else {
    console.log('\n🎉 All required columns exist!')
  }
}

checkColumns()
