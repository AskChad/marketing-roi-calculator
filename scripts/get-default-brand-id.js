const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getDefaultBrand() {
  console.log('🔍 Looking for default brand...\n')

  const { data, error } = await supabase
    .from('brands')
    .select('id, name, domain, subdomain')
    .eq('subdomain', 'default')
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.log('❌ No default brand found in database')
    console.log('   We need to use the ID of an existing brand for the fallback\n')

    // Get all brands
    const { data: allBrands } = await supabase
      .from('brands')
      .select('id, name, subdomain')
      .eq('is_active', true)

    console.log('   Available brands:')
    allBrands.forEach(b => {
      console.log(`   - ${b.name} (subdomain: ${b.subdomain || 'NULL'})`)
      console.log(`     ID: ${b.id}`)
    })

    if (allBrands && allBrands.length > 0) {
      console.log(`\n   💡 Use this ID for the fallback: ${allBrands[0].id}`)
    }
  } else {
    console.log(`✅ Default brand found:`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Domain: ${data.domain}`)
    console.log(`   Subdomain: ${data.subdomain}`)
    console.log(`   ID: ${data.id}`)
    console.log(`\n   ✅ Use this ID for the fallback: ${data.id}`)
  }
}

getDefaultBrand()
