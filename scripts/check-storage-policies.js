/**
 * Check Storage Bucket RLS Policies
 * Verifies that proper policies exist for brand asset uploads
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStoragePolicies() {
  console.log('🔐 Checking Storage RLS Policies...\n')

  try {
    // Query storage.objects policies
    const { data: policies, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
        ORDER BY policyname;
      `
    })

    if (error) {
      // RPC might not exist, try direct query
      const { data: rawData, error: queryError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'storage')
        .eq('tablename', 'objects')

      if (queryError) {
        console.log('⚠️  Cannot query policies directly (this is normal)')
        console.log('   Storage policies can only be viewed in Supabase Dashboard\n')

        console.log('📋 Expected policies for brand-assets bucket:')
        console.log('\n1. Allow authenticated users to INSERT (upload):')
        console.log('   - Policy name: "Authenticated users can upload brand assets"')
        console.log('   - Target roles: authenticated')
        console.log('   - Operation: INSERT')
        console.log('   - Check: bucket_id = \'brand-assets\'')

        console.log('\n2. Allow public to SELECT (view):')
        console.log('   - Policy name: "Public can view brand assets"')
        console.log('   - Target roles: anon, authenticated')
        console.log('   - Operation: SELECT')
        console.log('   - Check: bucket_id = \'brand-assets\'')

        console.log('\n3. Allow authenticated users to UPDATE:')
        console.log('   - Policy name: "Authenticated users can update brand assets"')
        console.log('   - Target roles: authenticated')
        console.log('   - Operation: UPDATE')
        console.log('   - Check: bucket_id = \'brand-assets\'')

        console.log('\n4. Allow authenticated users to DELETE:')
        console.log('   - Policy name: "Authenticated users can delete brand assets"')
        console.log('   - Target roles: authenticated')
        console.log('   - Operation: DELETE')
        console.log('   - Check: bucket_id = \'brand-assets\'')

        console.log('\n📍 To verify/create these policies:')
        console.log('   1. Go to: Supabase Dashboard → Storage → brand-assets')
        console.log('   2. Click "Policies" tab')
        console.log('   3. Add the policies listed above if they don\'t exist')

        return
      }
    }

    if (policies && policies.length > 0) {
      console.log(`Found ${policies.length} storage policies:\n`)
      policies.forEach(policy => {
        console.log(`  ✓ ${policy.policyname}`)
        console.log(`    - Command: ${policy.cmd}`)
        console.log(`    - Roles: ${policy.roles}`)
      })
    } else {
      console.log('⚠️  No storage policies found')
      console.log('   You may need to add policies for the brand-assets bucket')
    }

  } catch (error) {
    console.log('⚠️  Could not check policies:', error.message)
    console.log('   This is normal - policies can be managed in Supabase Dashboard\n')
  }

  console.log('\n✅ For image uploads to work from the admin panel:')
  console.log('   1. User must be authenticated (logged in)')
  console.log('   2. User must have is_admin = true')
  console.log('   3. Storage policies must allow authenticated users to upload')
  console.log('   4. Bucket must be public for images to be viewable')
}

checkStoragePolicies()
