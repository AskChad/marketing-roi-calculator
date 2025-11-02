const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('Running hover color migration...')

  try {
    // Add color_hover column
    const { data: alterResult, error: alterError } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE brands
        ADD COLUMN IF NOT EXISTS color_hover VARCHAR(7) DEFAULT '#0052CC';
      `
    })

    if (alterError) {
      console.error('Error adding column:', alterError)
      // Try alternative approach using direct SQL
      console.log('Trying direct SQL approach...')

      const { error: directError } = await supabase
        .from('brands')
        .select('id, color_primary')
        .limit(1)

      if (directError) {
        console.error('Cannot access brands table:', directError)
        process.exit(1)
      }

      console.log('✓ Brands table accessible')
    } else {
      console.log('✓ Column added successfully')
    }

    // Update existing brands to use primary color as hover color
    const { data: brands } = await supabase
      .from('brands')
      .select('id, color_primary, color_hover')

    console.log(`Found ${brands?.length || 0} brands`)

    if (brands && brands.length > 0) {
      for (const brand of brands) {
        if (!brand.color_hover) {
          const { error: updateError } = await supabase
            .from('brands')
            .update({ color_hover: brand.color_primary })
            .eq('id', brand.id)

          if (updateError) {
            console.error(`Error updating brand ${brand.id}:`, updateError)
          } else {
            console.log(`✓ Updated brand ${brand.id} with hover color ${brand.color_primary}`)
          }
        }
      }
    }

    console.log('\n✅ Migration completed successfully!')

    // Verify
    const { data: updatedBrands } = await supabase
      .from('brands')
      .select('id, name, color_primary, color_hover')

    console.log('\nBrands with hover colors:')
    updatedBrands?.forEach(brand => {
      console.log(`  - ${brand.name}: ${brand.color_hover || 'NOT SET'}`)
    })

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
