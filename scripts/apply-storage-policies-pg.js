/**
 * Apply Storage Policies via Direct PostgreSQL Connection
 * Uses pg library to connect directly to Supabase database
 */

const { Client } = require('pg')

const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!dbPassword) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD')
  console.log('   Set it in your .env.local file')
  process.exit(1)
}

// Supabase connection configuration
const client = new Client({
  host: 'db.ohmioijbzvhoydyhdkdk.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: {
    rejectUnauthorized: false
  }
})

async function applyStoragePolicies() {
  console.log('🔐 Applying Storage RLS Policies via PostgreSQL...\n')

  try {
    console.log('🔌 Connecting to Supabase database...')
    await client.connect()
    console.log('✅ Connected!\n')

    const policies = [
      {
        name: 'Drop existing upload policy',
        sql: `DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;`
      },
      {
        name: 'Drop existing view policy',
        sql: `DROP POLICY IF EXISTS "Public can view brand assets" ON storage.objects;`
      },
      {
        name: 'Drop existing update policy',
        sql: `DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;`
      },
      {
        name: 'Drop existing delete policy',
        sql: `DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;`
      },
      {
        name: 'Create upload policy',
        sql: `CREATE POLICY "Authenticated users can upload brand assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-assets');`
      },
      {
        name: 'Create view policy',
        sql: `CREATE POLICY "Public can view brand assets" ON storage.objects FOR SELECT TO public USING (bucket_id = 'brand-assets');`
      },
      {
        name: 'Create update policy',
        sql: `CREATE POLICY "Authenticated users can update brand assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-assets') WITH CHECK (bucket_id = 'brand-assets');`
      },
      {
        name: 'Create delete policy',
        sql: `CREATE POLICY "Authenticated users can delete brand assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-assets');`
      }
    ]

    let successCount = 0

    for (const policy of policies) {
      try {
        console.log(`⚙️  ${policy.name}...`)
        await client.query(policy.sql)
        console.log(`   ✓ Success`)
        successCount++
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ✓ Already dropped (OK)`)
          successCount++
        } else {
          console.error(`   ❌ Error: ${error.message}`)
        }
      }
    }

    console.log(`\n📊 Successfully applied ${successCount}/${policies.length} policies\n`)

    // Verify policies were created
    console.log('🔍 Verifying created policies...')
    const verifySQL = `
      SELECT
        policyname,
        cmd,
        roles::text[]
      FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname LIKE '%brand assets%'
      ORDER BY policyname;
    `

    const result = await client.query(verifySQL)

    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} storage policies:\n`)
      result.rows.forEach(row => {
        console.log(`   ✓ ${row.policyname}`)
        console.log(`     - Command: ${row.cmd}`)
        console.log(`     - Roles: ${row.roles.join(', ')}\n`)
      })
    } else {
      console.log('⚠️  No policies found (they may not have been created)')
    }

    console.log('✅ Storage policies setup complete!')
    console.log('   Image uploads should now work in the admin panel\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code === 'ENOTFOUND') {
      console.error('   Could not connect to database')
      console.error('   Check your internet connection and database credentials')
    } else if (error.code === '28P01') {
      console.error('   Authentication failed')
      console.error('   Check your SUPABASE_DB_PASSWORD in .env.local')
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Run the script
applyStoragePolicies()
