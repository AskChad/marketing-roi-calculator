/**
 * Apply Storage Policies Migration
 * Sets up RLS policies for brand-assets bucket
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyStoragePolicies() {
  console.log('🔐 Applying Storage RLS Policies...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250108000005_setup_storage_policies.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Reading migration file...')
    console.log(`   File: 20250108000005_setup_storage_policies.sql\n`)

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Found ${statements.length} SQL statement(s) to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      if (stmt.includes('DROP POLICY') || stmt.includes('CREATE POLICY') || stmt.includes('SELECT')) {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`)

        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: stmt + ';'
          })

          if (error) {
            // Try direct query if RPC doesn't exist
            const result = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ query: stmt })
            })

            if (!result.ok) {
              console.warn(`   ⚠️  Could not execute via API (this is normal)`)
            }
          } else {
            console.log(`   ✓ Executed successfully`)
          }
        } catch (err) {
          console.warn(`   ⚠️  ${err.message}`)
        }
      }
    }

    console.log('\n📋 NOTE: Storage policies need to be applied via Supabase Dashboard')
    console.log('   The SQL file has been created at:')
    console.log('   supabase/migrations/20250108000005_setup_storage_policies.sql\n')

    console.log('🔧 To apply manually:')
    console.log('   1. Go to Supabase Dashboard → SQL Editor')
    console.log('   2. Copy the contents of 20250108000005_setup_storage_policies.sql')
    console.log('   3. Paste and run the SQL')
    console.log('\n   OR\n')
    console.log('   1. Go to: Storage → brand-assets → Policies')
    console.log('   2. Click "New Policy" for each policy below:\n')

    console.log('   Policy 1: Upload')
    console.log('   - Name: Authenticated users can upload brand assets')
    console.log('   - Allowed operation: INSERT')
    console.log('   - Target roles: authenticated')
    console.log('   - WITH CHECK: bucket_id = \'brand-assets\'')

    console.log('\n   Policy 2: View')
    console.log('   - Name: Public can view brand assets')
    console.log('   - Allowed operation: SELECT')
    console.log('   - Target roles: public (or both anon and authenticated)')
    console.log('   - USING: bucket_id = \'brand-assets\'')

    console.log('\n   Policy 3: Update')
    console.log('   - Name: Authenticated users can update brand assets')
    console.log('   - Allowed operation: UPDATE')
    console.log('   - Target roles: authenticated')
    console.log('   - USING: bucket_id = \'brand-assets\'')

    console.log('\n   Policy 4: Delete')
    console.log('   - Name: Authenticated users can delete brand assets')
    console.log('   - Allowed operation: DELETE')
    console.log('   - Target roles: authenticated')
    console.log('   - USING: bucket_id = \'brand-assets\'')

    console.log('\n✅ After applying these policies, image uploads will work!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

applyStoragePolicies()
