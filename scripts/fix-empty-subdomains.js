/**
 * Fix Empty Subdomains Migration
 * Converts empty subdomain strings to NULL to prevent unique constraint violations
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

async function fixEmptySubdomains() {
  console.log('🔧 Starting migration: Fix empty subdomains...\n')

  try {
    // First, let's see what brands currently exist
    console.log('📊 Fetching current brands...')
    const { data: brandsBefore, error: fetchError } = await supabase
      .from('brands')
      .select('id, name, subdomain')
      .order('created_at', { ascending: true })

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${brandsBefore.length} brand(s):\n`)
    brandsBefore.forEach(brand => {
      const subdomainDisplay = brand.subdomain === '' ? '(empty string)' :
                               brand.subdomain === null ? '(NULL)' :
                               `"${brand.subdomain}"`
      console.log(`  - ${brand.name}: subdomain = ${subdomainDisplay}`)
    })

    // Count brands with empty subdomains
    const emptySubdomains = brandsBefore.filter(b => b.subdomain === '' || (b.subdomain && b.subdomain.trim() === ''))
    console.log(`\n🔍 Found ${emptySubdomains.length} brand(s) with empty subdomain strings\n`)

    if (emptySubdomains.length === 0) {
      console.log('✅ No empty subdomains found. Migration not needed.')
      return
    }

    // Update brands with empty subdomains to NULL
    console.log('🔄 Updating empty subdomains to NULL...')

    for (const brand of emptySubdomains) {
      const { error: updateError } = await supabase
        .from('brands')
        .update({ subdomain: null })
        .eq('id', brand.id)

      if (updateError) {
        console.error(`❌ Error updating brand ${brand.name}:`, updateError)
        throw updateError
      }

      console.log(`  ✓ Updated "${brand.name}"`)
    }

    // Verify the changes
    console.log('\n📊 Verifying changes...')
    const { data: brandsAfter, error: verifyError } = await supabase
      .from('brands')
      .select('id, name, subdomain')
      .order('created_at', { ascending: true })

    if (verifyError) {
      throw verifyError
    }

    console.log('\nBrands after migration:\n')
    brandsAfter.forEach(brand => {
      const subdomainDisplay = brand.subdomain === '' ? '(empty string)' :
                               brand.subdomain === null ? '(NULL)' :
                               `"${brand.subdomain}"`
      console.log(`  - ${brand.name}: subdomain = ${subdomainDisplay}`)
    })

    console.log('\n✅ Migration completed successfully!')
    console.log('   You can now create brands without subdomains without conflicts.')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
    process.exit(1)
  }
}

// Run the migration
fixEmptySubdomains()
