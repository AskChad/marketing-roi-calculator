/**
 * Test Complete Brand Creation Workflow
 * Tests all functionality that has been fixed:
 * 1. Creating brands without subdomains (no duplicate key error)
 * 2. Storage bucket configuration
 * 3. Image upload system
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testBrandWorkflow() {
  console.log('🧪 Testing Complete Brand Creation Workflow\n')
  console.log('=' .repeat(60))

  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  }

  // Test 1: Check storage bucket exists
  console.log('\n📦 Test 1: Storage Bucket Configuration')
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const brandAssetsBucket = buckets.find(b => b.name === 'brand-assets')
    if (brandAssetsBucket) {
      console.log(`   ✅ PASS: brand-assets bucket exists`)
      console.log(`      - Public: ${brandAssetsBucket.public ? 'Yes' : 'No'}`)
      testResults.passed++
      testResults.tests.push({ name: 'Storage bucket exists', status: 'PASS' })
    } else {
      console.log(`   ❌ FAIL: brand-assets bucket not found`)
      testResults.failed++
      testResults.tests.push({ name: 'Storage bucket exists', status: 'FAIL' })
    }
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`)
    testResults.failed++
    testResults.tests.push({ name: 'Storage bucket exists', status: 'FAIL', error: error.message })
  }

  // Test 2: Check existing brands
  console.log('\n📋 Test 2: Query Existing Brands')
  try {
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, subdomain')
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`   ✅ PASS: Successfully queried brands`)
    console.log(`      - Found ${brands.length} brand(s)`)
    brands.forEach(b => {
      const subdomainDisplay = b.subdomain === null ? 'NULL' : `"${b.subdomain}"`
      console.log(`      - ${b.name}: subdomain = ${subdomainDisplay}`)
    })
    testResults.passed++
    testResults.tests.push({ name: 'Query existing brands', status: 'PASS' })
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`)
    testResults.failed++
    testResults.tests.push({ name: 'Query existing brands', status: 'FAIL', error: error.message })
  }

  // Test 3: Create brand WITHOUT subdomain (should not fail)
  console.log('\n➕ Test 3: Create Brand Without Subdomain')
  try {
    const testBrand = {
      name: `Test Brand ${Date.now()}`,
      domain: `test-${Date.now()}.example.com`,
      subdomain: null, // Explicitly NULL
      is_active: true,
      color_primary: '#FF0000',
      color_secondary: '#00FF00',
      color_accent: '#0000FF',
      color_success: '#10B981',
      color_error: '#EF4444',
      color_hover: '#CC0000',
      hero_title: 'Test Title',
      hero_subtitle: 'Test Subtitle',
      hero_cta_text: 'Test CTA',
      hero_secondary_cta_text: 'Test Secondary CTA',
      feature_1_title: 'Feature 1',
      feature_1_description: 'Description 1',
      feature_2_title: 'Feature 2',
      feature_2_description: 'Description 2',
      feature_3_title: 'Feature 3',
      feature_3_description: 'Description 3'
    }

    const { data: newBrand, error } = await supabase
      .from('brands')
      .insert([testBrand])
      .select()
      .single()

    if (error) throw error

    console.log(`   ✅ PASS: Brand created without subdomain`)
    console.log(`      - ID: ${newBrand.id}`)
    console.log(`      - Name: ${newBrand.name}`)
    console.log(`      - Subdomain: ${newBrand.subdomain === null ? 'NULL' : newBrand.subdomain}`)

    // Clean up - delete the test brand
    await supabase.from('brands').delete().eq('id', newBrand.id)
    console.log(`   🧹 Cleaned up test brand`)

    testResults.passed++
    testResults.tests.push({ name: 'Create brand without subdomain', status: 'PASS' })
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`)
    testResults.failed++
    testResults.tests.push({ name: 'Create brand without subdomain', status: 'FAIL', error: error.message })
  }

  // Test 4: Test image upload capability
  console.log('\n📤 Test 4: Image Upload System')
  try {
    // Create a minimal test SVG
    const testSVG = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0066CC"/></svg>'
    const testFileName = `workflow-test/test-${Date.now()}.svg`
    const buffer = Buffer.from(testSVG)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(testFileName, buffer, {
        contentType: 'image/svg+xml',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(testFileName)

    console.log(`   ✅ PASS: Image upload successful`)
    console.log(`      - File: ${uploadData.path}`)
    console.log(`      - URL: ${publicUrl}`)

    // Clean up
    await supabase.storage.from('brand-assets').remove([testFileName])
    console.log(`   🧹 Cleaned up test image`)

    testResults.passed++
    testResults.tests.push({ name: 'Image upload system', status: 'PASS' })
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`)
    if (error.message.includes('403') || error.message.includes('permission')) {
      console.log(`      ⚠️  This likely means storage policies are not yet applied`)
      console.log(`      📋 Run: APPLY-STORAGE-POLICIES.sql in Supabase Dashboard`)
    }
    testResults.failed++
    testResults.tests.push({ name: 'Image upload system', status: 'FAIL', error: error.message })
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`)
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log('')

  testResults.tests.forEach((test, i) => {
    const icon = test.status === 'PASS' ? '✅' : '❌'
    console.log(`${i + 1}. ${icon} ${test.name}`)
    if (test.error) {
      console.log(`   Error: ${test.error}`)
    }
  })

  console.log('\n' + '='.repeat(60))

  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('   Your brand management system is fully functional!')
  } else {
    console.log('⚠️  SOME TESTS FAILED')
    if (testResults.tests.find(t => t.name === 'Image upload system' && t.status === 'FAIL')) {
      console.log('\n📋 Next Steps:')
      console.log('   1. Open: APPLY-STORAGE-POLICIES.sql')
      console.log('   2. Copy the entire contents')
      console.log('   3. Run in Supabase Dashboard → SQL Editor')
      console.log('   4. Re-run this test: node scripts/test-brand-workflow.js')
    }
  }

  console.log('')
  process.exit(testResults.failed > 0 ? 1 : 0)
}

testBrandWorkflow()
