const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('Running hover color migration...\n')

  try {
    // First, get all brands
    const { data: brands, error: fetchError } = await supabase
      .from('brands')
      .select('id, name, color_primary')

    if (fetchError) {
      console.error('Error fetching brands:', fetchError)
      process.exit(1)
    }

    console.log(`Found ${brands.length} brands\n`)

    // Update each brand with hover color
    for (const brand of brands) {
      const hoverColor = brand.color_primary // Use primary color as hover color

      const { error: updateError } = await supabase
        .from('brands')
        .update({ color_hover: hoverColor })
        .eq('id', brand.id)

      if (updateError) {
        console.error(`✗ Error updating ${brand.name}:`, updateError.message)
      } else {
        console.log(`✓ Updated ${brand.name} with hover color: ${hoverColor}`)
      }
    }

    // Verify the results
    console.log('\n--- Verification ---')
    const { data: updatedBrands } = await supabase
      .from('brands')
      .select('id, name, color_primary, color_hover')

    updatedBrands?.forEach(brand => {
      const status = brand.color_hover ? '✓' : '✗'
      console.log(`${status} ${brand.name}: primary=${brand.color_primary}, hover=${brand.color_hover || 'NOT SET'}`)
    })

    console.log('\n✅ Migration completed!')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
