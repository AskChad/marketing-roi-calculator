const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  console.log('🔍 Checking calculator_visits table...\n')

  // Check if table exists and get recent records
  const { data, error } = await supabase
    .from('calculator_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error accessing calculator_visits table:')
    console.error('   Message:', error.message)
    console.error('   Code:', error.code)

    if (error.code === '42P01') {
      console.error('\n⚠️  Table does not exist!')
    }
    return
  }

  console.log(`✅ calculator_visits table exists!`)
  console.log(`   Found ${data.length} recent visit(s)\n`)

  if (data.length > 0) {
    console.log('Recent visits:')
    data.forEach((visit, i) => {
      console.log(`\n${i+1}. Visit at ${visit.visited_at}`)
      console.log(`   - tracking_id: ${visit.tracking_id || 'NULL'}`)
      console.log(`   - user_id: ${visit.user_id || 'NULL'}`)
      console.log(`   - brand_id: ${visit.brand_id || 'NULL'}`)
      console.log(`   - page_path: ${visit.page_path || 'NULL'}`)
      console.log(`   - ip_address: ${visit.ip_address || 'NULL'}`)
      console.log(`   - city: ${visit.city || 'NULL'}`)
    })
  } else {
    console.log('⚠️  No visits recorded yet')
  }

  // Check visit_logs table too
  console.log('\n\n🔍 Checking visit_logs table...\n')

  const { data: visitLogs, error: visitLogsError } = await supabase
    .from('visit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (visitLogsError) {
    console.error('❌ Error accessing visit_logs table:')
    console.error('   Message:', visitLogsError.message)
    return
  }

  console.log(`✅ visit_logs table exists!`)
  console.log(`   Found ${visitLogs.length} recent log(s)\n`)

  if (visitLogs.length > 0) {
    console.log('Recent visit logs:')
    visitLogs.forEach((log, i) => {
      console.log(`\n${i+1}. Visit at ${log.created_at}`)
      console.log(`   - page_path: ${log.page_path}`)
      console.log(`   - lead_capture_id: ${log.lead_capture_id || 'NULL'}`)
      console.log(`   - ip_address: ${log.ip_address || 'NULL'}`)
    })
  } else {
    console.log('⚠️  No visit logs recorded yet')
  }
}

checkTable()
