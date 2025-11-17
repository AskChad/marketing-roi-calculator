/**
 * Check Supabase Storage Bucket Configuration
 * Verifies that the brand-assets bucket exists and is properly configured
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStorageBucket() {
  console.log('🔍 Checking Supabase Storage bucket configuration...\n')

  try {
    // List all buckets
    console.log('📦 Fetching storage buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw listError
    }

    console.log(`Found ${buckets.length} bucket(s):\n`)
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Check if brand-assets bucket exists
    const brandAssetsBucket = buckets.find(b => b.name === 'brand-assets')

    if (!brandAssetsBucket) {
      console.log('\n❌ "brand-assets" bucket NOT found!')
      console.log('\n📋 To create the bucket, run this in your Supabase dashboard:')
      console.log('\n1. Go to Storage in your Supabase dashboard')
      console.log('2. Click "Create a new bucket"')
      console.log('3. Name: brand-assets')
      console.log('4. Public: Yes (checked)')
      console.log('5. Click "Create bucket"')
      console.log('\nOr create it programmatically with:')
      console.log('node scripts/create-storage-bucket.js')
      return
    }

    console.log(`\n✅ "brand-assets" bucket exists!`)
    console.log(`   - Public: ${brandAssetsBucket.public ? 'Yes ✓' : 'No ✗'}`)
    console.log(`   - ID: ${brandAssetsBucket.id}`)

    if (!brandAssetsBucket.public) {
      console.log('\n⚠️  WARNING: Bucket is private. Brand assets should be public.')
      console.log('   Users won\'t be able to see uploaded logos/favicons.')
    }

    // Try listing files in the bucket
    console.log('\n📁 Checking bucket contents...')
    const { data: files, error: filesError } = await supabase.storage
      .from('brand-assets')
      .list()

    if (filesError) {
      console.error('❌ Error listing files:', filesError.message)
    } else {
      console.log(`   Found ${files.length} file(s) in bucket`)
      if (files.length > 0) {
        console.log('\n   Recent files:')
        files.slice(0, 5).forEach(file => {
          console.log(`   - ${file.name}`)
        })
      }
    }

    console.log('\n✅ Storage configuration looks good!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    process.exit(1)
  }
}

// Run the check
checkStorageBucket()
