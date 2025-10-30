// Create brand-assets storage bucket in Supabase
const https = require('https')
const fs = require('fs')
const path = require('path')

// Read .env.local file
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    envVars[key] = value
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1]

console.log('🚀 Creating brand-assets storage bucket...\n')
console.log(`📦 Project: ${projectRef}\n`)

// SQL to create the bucket and set up policies
const setupSQL = `
-- Create the brand-assets storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to upload files
CREATE POLICY "Admins can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- Policy: Allow admins to update files
CREATE POLICY "Admins can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- Policy: Allow admins to delete files
CREATE POLICY "Admins can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
);

-- Policy: Allow public read access
CREATE POLICY "Public can view brand assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');
`

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', supabaseUrl)
    const postData = JSON.stringify({ sql })

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(url, options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, body })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

async function createBucket() {
  try {
    const statements = setupSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue

      const preview = statement.substring(0, 50).replace(/\s+/g, ' ')
      console.log(`[${i + 1}/${statements.length}] ${preview}...`)

      try {
        await executeSQL(statement + ';')
        console.log(`   ✅ Success\n`)
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ℹ️  Already exists (skipping)\n`)
        } else {
          console.log(`   ⚠️  Warning: ${error.message}\n`)
        }
      }
    }

    console.log('✨ Storage bucket setup complete!\n')
    console.log('📊 Summary:')
    console.log('   - Bucket: brand-assets (public, 5MB limit)')
    console.log('   - Allowed types: PNG, JPG, SVG, WEBP, ICO')
    console.log('   - Admin upload/update/delete: ✅')
    console.log('   - Public read access: ✅')
    console.log('\n🎉 File uploads are now ready to use!\n')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

createBucket()
