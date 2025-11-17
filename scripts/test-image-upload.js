/**
 * Test Image Upload to Supabase Storage
 * Creates a simple test image and uploads it to verify the upload system works
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testImageUpload() {
  console.log('🧪 Testing image upload functionality...\n')

  try {
    // Create a minimal SVG test image
    const testSVG = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#0066CC"/>
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="24" dy="0.3em">TEST</text>
      </svg>
    `.trim()

    const testFileName = `test-brand/test-logo-${Date.now()}.svg`
    const buffer = Buffer.from(testSVG)

    console.log('📤 Uploading test image...')
    console.log(`   File: ${testFileName}`)
    console.log(`   Size: ${buffer.length} bytes\n`)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(testFileName, buffer, {
        contentType: 'image/svg+xml',
        upsert: true,
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      if (uploadError.statusCode === 403) {
        console.log('\n🔐 Permission error! This could mean:')
        console.log('   1. RLS policies are blocking the upload')
        console.log('   2. Storage bucket permissions need to be updated')
        console.log('\n📋 To fix:')
        console.log('   1. Go to Supabase Dashboard → Storage → brand-assets')
        console.log('   2. Click on "Policies"')
        console.log('   3. Add policy: "Allow authenticated users to upload"')
        console.log('      - Target roles: authenticated')
        console.log('      - Policy: INSERT with check true')
      }
      throw uploadError
    }

    console.log('✅ Upload successful!')
    console.log(`   Path: ${uploadData.path}\n`)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(testFileName)

    console.log('🌐 Public URL generated:')
    console.log(`   ${publicUrl}\n`)

    // Verify file exists
    console.log('🔍 Verifying upload...')
    const { data: files, error: listError } = await supabase.storage
      .from('brand-assets')
      .list('test-brand')

    if (listError) {
      throw listError
    }

    const uploadedFile = files.find(f => f.name.startsWith('test-logo-'))
    if (uploadedFile) {
      console.log('✅ File verified in storage!')
      console.log(`   Name: ${uploadedFile.name}`)
      console.log(`   Size: ${uploadedFile.metadata?.size || 'unknown'} bytes\n`)
    }

    // Clean up test file
    console.log('🧹 Cleaning up test file...')
    const { error: deleteError } = await supabase.storage
      .from('brand-assets')
      .remove([testFileName])

    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message)
    } else {
      console.log('✅ Test file cleaned up\n')
    }

    console.log('✅ Image upload test PASSED!')
    console.log('   Your brand image upload system is working correctly.')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    process.exit(1)
  }
}

// Run the test
testImageUpload()
