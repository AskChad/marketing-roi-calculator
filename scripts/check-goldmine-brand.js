/**
 * Check Goldmine AI Brand Configuration
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGoldmineBrand() {
  console.log('🔍 Checking Goldmine AI Brand Configuration...\n')

  try {
    // Get all brands
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, name, domain, subdomain, is_active')
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    console.log(`Found ${brands.length} brand(s):\n`)

    brands.forEach(brand => {
      const subdomainDisplay = brand.subdomain === null ? 'NULL' : `"${brand.subdomain}"`
      const activeDisplay = brand.is_active ? '✓' : '✗'
      console.log(`${activeDisplay} ${brand.name}`)
      console.log(`   ID: ${brand.id}`)
      console.log(`   Domain: ${brand.domain}`)
      console.log(`   Subdomain: ${subdomainDisplay}`)
      console.log('')
    })

    // Check specifically for Goldmine
    const goldmine = brands.find(b => b.name === 'Goldmine AI')

    if (!goldmine) {
      console.log('⚠️  Goldmine AI brand not found!')
      return
    }

    console.log('📋 Goldmine AI Brand Details:')
    console.log(`   Domain: ${goldmine.domain}`)
    console.log(`   Subdomain: ${goldmine.subdomain}`)
    console.log('')

    // Test what getBrandFromRequest would look for
    const host = 'roi.goldminedata.io'
    console.log(`🧪 Testing brand lookup for host: ${host}`)
    console.log('')

    // 1. Check by exact domain match
    console.log('   Step 1: Looking for exact domain match...')
    const { data: byDomain } = await supabase
      .from('brands')
      .select('*')
      .eq('domain', host)
      .eq('is_active', true)
      .single()

    if (byDomain) {
      console.log(`   ✅ Found by domain: ${byDomain.name}`)
    } else {
      console.log(`   ❌ No brand found with domain "${host}"`)
    }

    // 2. Check by subdomain
    const subdomain = host.split('.')[0] // 'roi'
    console.log(`\n   Step 2: Looking for subdomain "${subdomain}"...`)

    const { data: bySubdomain } = await supabase
      .from('brands')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single()

    if (bySubdomain) {
      console.log(`   ✅ Found by subdomain: ${bySubdomain.name}`)
      console.log(`      ID: ${bySubdomain.id}`)
    } else {
      console.log(`   ❌ No brand found with subdomain "${subdomain}"`)
    }

    console.log('')

    // Recommend fix
    if (!byDomain && goldmine.domain !== host) {
      console.log('💡 ISSUE FOUND:')
      console.log(`   The Goldmine AI brand has domain: "${goldmine.domain}"`)
      console.log(`   But requests are coming from: "${host}"`)
      console.log('')
      console.log('🔧 FIX:')
      console.log(`   Update Goldmine AI brand domain to: "${host}"`)
      console.log('')
      console.log('   Run this SQL:')
      console.log(`   UPDATE brands SET domain = '${host}' WHERE id = '${goldmine.id}';`)
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkGoldmineBrand()
