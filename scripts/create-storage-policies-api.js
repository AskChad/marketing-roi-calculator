/**
 * Create Storage Policies via Supabase Management API
 * Applies RLS policies for brand-assets bucket
 */

const https = require('https')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Could not extract project reference from URL')
  process.exit(1)
}

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data: data })
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function createStoragePolicies() {
  console.log('🔐 Creating Storage RLS Policies...\n')
  console.log(`📍 Project: ${projectRef}\n`)

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
  let failCount = 0

  for (const policy of policies) {
    try {
      console.log(`⚙️  ${policy.name}...`)
      const result = await executeSQL(policy.sql)

      if (result.success) {
        console.log(`   ✓ Success`)
        successCount++
      } else {
        console.log(`   ⚠️  API call failed (statusCode: ${result.statusCode})`)
        // This is expected - we'll use psql instead
        failCount++
      }
    } catch (error) {
      console.log(`   ⚠️  ${error.message}`)
      failCount++
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed`)

  if (failCount > 0) {
    console.log('\n⚠️  Could not apply policies via API')
    console.log('   This is normal - Supabase doesn\'t expose storage policy creation via REST API\n')
    console.log('🔧 Applying policies via direct database connection...\n')
    return false
  }

  return true
}

// Run the script
createStoragePolicies().then(success => {
  if (!success) {
    console.log('Will use psql method instead...')
    process.exit(2) // Exit code 2 means "try psql"
  } else {
    console.log('\n✅ All policies created successfully!')
  }
}).catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
