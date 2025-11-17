const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTrackingIds() {
  console.log('🔍 Checking for invalid tracking_ids in lead_captures...\n')

  const { data, error } = await supabase
    .from('lead_captures')
    .select('id, email, tracking_id')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  console.log(`Found ${data.length} lead(s)\n`)

  let invalidCount = 0
  let nullCount = 0
  let validCount = 0

  data.forEach(lead => {
    if (lead.tracking_id === null) {
      nullCount++
      console.log(`⚠️  ${lead.email}: tracking_id is NULL`)
    } else {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(lead.tracking_id)) {
        validCount++
        console.log(`✅ ${lead.email}: ${lead.tracking_id}`)
      } else {
        invalidCount++
        console.log(`❌ ${lead.email}: INVALID tracking_id = "${lead.tracking_id}"`)
      }
    }
  })

  console.log('\n📊 Summary:')
  console.log(`   Valid UUIDs: ${validCount}`)
  console.log(`   NULL tracking_ids: ${nullCount}`)
  console.log(`   Invalid tracking_ids: ${invalidCount}`)

  if (invalidCount > 0 || nullCount > 0) {
    console.log('\n⚠️  Found issues! These records may cause 500 errors.')
  } else {
    console.log('\n✅ All tracking_ids are valid UUIDs!')
  }
}

checkTrackingIds()
