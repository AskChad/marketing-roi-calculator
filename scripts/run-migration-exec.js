const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
})

async function runMigration() {
  console.log('Running hover color migration using exec SQL...\n')

  const sql = `
    -- Add hover color to brands table
    ALTER TABLE brands
      ADD COLUMN IF NOT EXISTS color_hover VARCHAR(7) DEFAULT '#0052CC';

    -- Update existing brands to have a hover color based on their primary color
    UPDATE brands
    SET color_hover = color_primary
    WHERE color_hover IS NULL;

    -- Return the updated brands
    SELECT id, name, color_primary, color_hover FROM brands ORDER BY name;
  `

  try {
    // Execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('Error executing SQL:', error)
      process.exit(1)
    }

    console.log('✅ Migration completed successfully!')
    console.log('\nResult:', data)

    // Verify by querying brands
    const { data: brands, error: queryError } = await supabase
      .from('brands')
      .select('id, name, color_primary, color_hover')
      .order('name')

    if (queryError) {
      console.error('Error querying brands:', queryError)
    } else {
      console.log('\n--- Verification ---')
      brands?.forEach(brand => {
        const status = brand.color_hover ? '✓' : '✗'
        console.log(`${status} ${brand.name}:`)
        console.log(`   Primary: ${brand.color_primary}`)
        console.log(`   Hover:   ${brand.color_hover || 'NOT SET'}`)
      })
    }

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
