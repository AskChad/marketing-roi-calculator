// Run tracking_id migration
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local file manually
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    envVars[key] = value
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('Running tracking_id migration...\n')

  try {
    // Add tracking_id to lead_captures
    console.log('1. Adding tracking_id column to lead_captures...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS tracking_id UUID;'
    })

    if (error1) {
      console.log('Note: Column may already exist or RPC not available. Continuing...')
    } else {
      console.log('   ✓ Success')
    }

    // Add tracking_id to users
    console.log('2. Adding tracking_id column to users...')
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS tracking_id UUID;'
    })

    if (error2) {
      console.log('Note: Column may already exist or RPC not available. Continuing...')
    } else {
      console.log('   ✓ Success')
    }

    // Create index on lead_captures
    console.log('3. Creating index on lead_captures.tracking_id...')
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);'
    })

    if (error3) {
      console.log('Note: Index may already exist or RPC not available. Continuing...')
    } else {
      console.log('   ✓ Success')
    }

    // Create index on users
    console.log('4. Creating index on users.tracking_id...')
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);'
    })

    if (error4) {
      console.log('Note: Index may already exist or RPC not available. Continuing...')
    } else {
      console.log('   ✓ Success')
    }

    // Verify the columns exist by trying to select them
    console.log('\n5. Verifying migration...')

    const { data: leadData, error: verifyError1 } = await supabase
      .from('lead_captures')
      .select('tracking_id')
      .limit(1)

    if (verifyError1) {
      console.error('   ✗ Could not verify lead_captures.tracking_id:', verifyError1.message)
      console.log('\n⚠️  Migration may not have completed successfully.')
      console.log('Please run the migration manually through Supabase Dashboard SQL Editor:')
      console.log('Copy contents from: supabase/migrations/20250105000000_add_tracking_id.sql')
      process.exit(1)
    } else {
      console.log('   ✓ lead_captures.tracking_id exists')
    }

    const { data: userData, error: verifyError2 } = await supabase
      .from('users')
      .select('tracking_id')
      .limit(1)

    if (verifyError2) {
      console.error('   ✗ Could not verify users.tracking_id:', verifyError2.message)
      console.log('\n⚠️  Migration may not have completed successfully.')
      console.log('Please run the migration manually through Supabase Dashboard SQL Editor:')
      console.log('Copy contents from: supabase/migrations/20250105000000_add_tracking_id.sql')
      process.exit(1)
    } else {
      console.log('   ✓ users.tracking_id exists')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('Anonymous user tracking is now enabled.')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\nPlease run the migration manually through Supabase Dashboard SQL Editor:')
    console.log('Copy contents from: supabase/migrations/20250105000000_add_tracking_id.sql')
    process.exit(1)
  }
}

runMigration()
