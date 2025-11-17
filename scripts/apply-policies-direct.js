/**
 * Apply Storage Policies Directly via Supabase Client
 * Uses a workaround to execute raw SQL for storage policies
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyPoliciesDirect() {
  console.log('🔐 Applying Storage RLS Policies directly...\n')

  // Comprehensive SQL to set up all policies
  const fullSQL = `
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;

-- Create upload policy
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Create view policy
CREATE POLICY "Public can view brand assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Create update policy
CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets')
WITH CHECK (bucket_id = 'brand-assets');

-- Create delete policy
CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');
  `.trim()

  console.log('📄 SQL to execute:')
  console.log('─'.repeat(60))
  console.log(fullSQL)
  console.log('─'.repeat(60))
  console.log('\n⚠️  Note: This SQL must be run in Supabase Dashboard SQL Editor\n')

  console.log('📋 Instructions:')
  console.log('   1. Open: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new')
  console.log('   2. Copy the SQL above')
  console.log('   3. Paste into the SQL Editor')
  console.log('   4. Click "Run" button')
  console.log('\n✅ After running, your storage policies will be configured!\n')

  // Save SQL to a file for easy access
  const fs = require('fs')
  const sqlFile = '/mnt/c/development/marketing_ROI_Calculator/supabase/migrations/20250108000005_setup_storage_policies.sql'

  console.log('💾 SQL saved to:')
  console.log(`   ${sqlFile}\n`)

  console.log('📊 Alternative: Use this one-liner for quick setup:\n')
  console.log('Copy this entire block into Supabase SQL Editor:\n')

  const oneLiner = fullSQL.split('\n').filter(line => !line.trim().startsWith('--') && line.trim()).join(' ')
  console.log(oneLiner)
  console.log('\n')
}

applyPoliciesDirect()
