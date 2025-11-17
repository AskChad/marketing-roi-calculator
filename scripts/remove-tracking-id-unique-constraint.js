const { createClient } = require('@supabase/supabase-js')
const { randomUUID } = require('crypto')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeUniqueConstraint() {
  console.log('🔧 Removing UNIQUE constraint from tracking_id...\n')

  const sql = `
    -- Drop the unique constraint/index on tracking_id
    DROP INDEX IF EXISTS idx_lead_captures_tracking_id_unique;

    -- Keep the regular index for performance (non-unique)
    CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);
  `

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: sql.trim() })

    if (error) {
      console.error('❌ Failed:', error.message)
      return false
    }

    console.log('✅ Successfully removed UNIQUE constraint!')
    console.log('   tracking_id can now repeat (as it should)\n')
    return true
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

removeUniqueConstraint().then(async (success) => {
  if (!success) {
    process.exit(1)
  }

  // Test that we can insert duplicate tracking_ids
  console.log('🧪 Testing duplicate tracking_id inserts...\n')

  const testTrackingId = randomUUID() // Use proper UUID

  // Insert first record
  const { data: lead1, error: error1 } = await supabase
    .from('lead_captures')
    .insert([{
      first_name: 'Test',
      last_name: 'User',
      email: `test1-${Date.now()}@example.com`,
      company_name: 'Test Co',
      tracking_id: testTrackingId,
      visit_count: 1
    }])
    .select('id')
    .single()

  if (error1) {
    console.error('❌ First insert failed:', error1.message)
    process.exit(1)
  }

  console.log('✅ First insert succeeded')

  // Insert second record with SAME tracking_id
  const { data: lead2, error: error2 } = await supabase
    .from('lead_captures')
    .insert([{
      first_name: 'Test',
      last_name: 'User',
      email: `test2-${Date.now()}@example.com`,
      company_name: 'Test Co',
      tracking_id: testTrackingId, // Same tracking_id!
      visit_count: 2
    }])
    .select('id')
    .single()

  if (error2) {
    console.error('❌ Second insert failed:', error2.message)
    console.error('   This means the constraint still exists!')
    // Clean up first record
    await supabase.from('lead_captures').delete().eq('id', lead1.id)
    process.exit(1)
  }

  console.log('✅ Second insert succeeded (same tracking_id)')
  console.log('   Both records share tracking_id:', testTrackingId)

  // Clean up
  await supabase.from('lead_captures').delete().eq('id', lead1.id)
  await supabase.from('lead_captures').delete().eq('id', lead2.id)
  console.log('   🧹 Cleaned up test records\n')

  console.log('🎉 SUCCESS! tracking_id constraint fixed!')
  console.log('   Visitors can now submit the form multiple times.')
})
