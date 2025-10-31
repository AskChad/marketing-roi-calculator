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

async function createBrandsTable() {
  console.log('🔧 Creating brands table and related structures...\n')

  const commands = [
    {
      name: 'Create brands table',
      sql: `CREATE TABLE IF NOT EXISTS brands (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        subdomain VARCHAR(100) UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        color_primary VARCHAR(7) DEFAULT '#0066CC',
        color_secondary VARCHAR(7) DEFAULT '#7C3AED',
        color_accent VARCHAR(7) DEFAULT '#F59E0B',
        color_success VARCHAR(7) DEFAULT '#10B981',
        color_error VARCHAR(7) DEFAULT '#EF4444',
        logo_url TEXT,
        logo_dark_url TEXT,
        favicon_url TEXT,
        hero_title TEXT DEFAULT 'Marketing ROI Calculator',
        hero_subtitle TEXT DEFAULT 'Calculate your current marketing performance and model prospective scenarios to maximize ROI',
        hero_cta_text VARCHAR(100) DEFAULT 'Get Started Free',
        hero_secondary_cta_text VARCHAR(100) DEFAULT 'View Demo',
        feature_1_title VARCHAR(100) DEFAULT 'Real-Time Analysis',
        feature_1_description TEXT DEFAULT 'Calculate ROI instantly with our advanced metrics engine',
        feature_2_title VARCHAR(100) DEFAULT 'Scenario Modeling',
        feature_2_description TEXT DEFAULT 'Model what-if scenarios to optimize your marketing spend',
        feature_3_title VARCHAR(100) DEFAULT 'AI-Powered Insights',
        feature_3_description TEXT DEFAULT 'Get intelligent recommendations powered by AI',
        company_name VARCHAR(255),
        support_email VARCHAR(255),
        privacy_policy_url TEXT,
        terms_of_service_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    },
    {
      name: 'Create index on brands.domain',
      sql: 'CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands(domain)'
    },
    {
      name: 'Create index on brands.subdomain',
      sql: 'CREATE INDEX IF NOT EXISTS idx_brands_subdomain ON brands(subdomain)'
    },
    {
      name: 'Create index on brands.is_active',
      sql: 'CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active)'
    },
    {
      name: 'Insert default brand',
      sql: `INSERT INTO brands (
        name, domain, subdomain, color_primary, color_secondary, color_accent, company_name, support_email
      ) VALUES (
        'Marketing ROI Calculator',
        'localhost:3000',
        'default',
        '#0066CC',
        '#7C3AED',
        '#F59E0B',
        'Marketing ROI Calculator',
        'support@marketingroicalculator.com'
      ) ON CONFLICT (domain) DO NOTHING`
    },
    {
      name: 'Add brand_id to users',
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL'
    },
    {
      name: 'Create index on users.brand_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_brand_id ON users(brand_id)'
    },
    {
      name: 'Add brand_id to lead_captures',
      sql: 'ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL'
    },
    {
      name: 'Create index on lead_captures.brand_id',
      sql: 'CREATE INDEX IF NOT EXISTS idx_lead_captures_brand_id ON lead_captures(brand_id)'
    },
    {
      name: 'Enable RLS on brands',
      sql: 'ALTER TABLE brands ENABLE ROW LEVEL SECURITY'
    },
    {
      name: 'Create get_brand_by_domain function',
      sql: `CREATE OR REPLACE FUNCTION get_brand_by_domain(p_domain TEXT)
RETURNS UUID AS $$
DECLARE
  v_brand_id UUID;
BEGIN
  SELECT id INTO v_brand_id
  FROM brands
  WHERE domain = p_domain AND is_active = TRUE
  LIMIT 1;

  IF v_brand_id IS NULL THEN
    SELECT id INTO v_brand_id
    FROM brands
    WHERE subdomain = p_domain AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_brand_id IS NULL THEN
    SELECT id INTO v_brand_id
    FROM brands
    WHERE subdomain = 'default' AND is_active = TRUE
    LIMIT 1;
  END IF;

  RETURN v_brand_id;
END;
$$ LANGUAGE plpgsql`
    }
  ]

  for (const cmd of commands) {
    console.log(`Running: ${cmd.name}...`)
    try {
      await executeSQL(cmd.sql)
      console.log(`   ✅ Success\n`)
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ℹ️  Already exists (skipping)\n`)
      } else {
        console.log(`   ⚠️  Warning: ${error.message}\n`)
      }
    }
  }

  // Create RLS policies separately (they may fail if they already exist)
  const policies = [
    {
      name: 'RLS Policy: Admins can view all brands',
      sql: `CREATE POLICY "Admins can view all brands"
        ON brands FOR SELECT
        USING (EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
        ))`
    },
    {
      name: 'RLS Policy: Admins can insert brands',
      sql: `CREATE POLICY "Admins can insert brands"
        ON brands FOR INSERT
        WITH CHECK (EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
        ))`
    },
    {
      name: 'RLS Policy: Admins can update brands',
      sql: `CREATE POLICY "Admins can update brands"
        ON brands FOR UPDATE
        USING (EXISTS (
          SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
        ))`
    },
    {
      name: 'RLS Policy: Anyone can view active brands',
      sql: `CREATE POLICY "Anyone can view active brands"
        ON brands FOR SELECT
        USING (is_active = TRUE)`
    }
  ]

  for (const policy of policies) {
    console.log(`Running: ${policy.name}...`)
    try {
      await executeSQL(policy.sql)
      console.log(`   ✅ Success\n`)
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ℹ️  Already exists (skipping)\n`)
      } else {
        console.log(`   ⚠️  Warning: ${error.message}\n`)
      }
    }
  }

  console.log('✨ Brands table creation complete!\n')
}

createBrandsTable()
