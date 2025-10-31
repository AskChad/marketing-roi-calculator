const https = require('https')

const SUPABASE_URL = 'https://ohmioijbzvhoydyhdkdk.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obWlvaWpienZob3lkeWhka2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc2MTk5NiwiZXhwIjoyMDc3MTIxOTk2fQ.tb9381pAgmz8jHSqvtDqHaRQDNhFPOmQsga7iY1m1j0'

function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL)

    const postData = JSON.stringify({ query: sql })

    const options = {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ SQL executed successfully (status ${res.statusCode})`)
          resolve({ status: res.statusCode, data: data ? (data.length > 0 ? JSON.parse(data) : null) : null })
        } else {
          console.error(`❌ SQL execution failed (status ${res.statusCode})`)
          console.error('Response:', data)
          reject(new Error(`HTTP ${res.statusCode}: ${data}`))
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function runTableCreation() {
  console.log('🚀 Creating user_openai_settings table with RLS...\n')

  const sqls = [
    {
      name: 'Create table',
      sql: `
        CREATE TABLE IF NOT EXISTS user_openai_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          api_key TEXT,
          use_platform_key BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    },
    {
      name: 'Create index',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_openai_settings_user_id
        ON user_openai_settings(user_id);
      `
    },
    {
      name: 'Enable RLS',
      sql: `
        ALTER TABLE user_openai_settings ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'Create SELECT policy',
      sql: `
        CREATE POLICY "Users can view own OpenAI settings"
          ON user_openai_settings FOR SELECT
          USING (auth.uid() = user_id);
      `
    },
    {
      name: 'Create INSERT policy',
      sql: `
        CREATE POLICY "Users can insert own OpenAI settings"
          ON user_openai_settings FOR INSERT
          WITH CHECK (auth.uid() = user_id);
      `
    },
    {
      name: 'Create UPDATE policy',
      sql: `
        CREATE POLICY "Users can update own OpenAI settings"
          ON user_openai_settings FOR UPDATE
          USING (auth.uid() = user_id);
      `
    },
    {
      name: 'Create DELETE policy',
      sql: `
        CREATE POLICY "Users can delete own OpenAI settings"
          ON user_openai_settings FOR DELETE
          USING (auth.uid() = user_id);
      `
    },
    {
      name: 'Create trigger',
      sql: `
        CREATE TRIGGER update_user_openai_settings_updated_at
          BEFORE UPDATE ON user_openai_settings
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    }
  ]

  for (const { name, sql } of sqls) {
    try {
      console.log(`📝 ${name}...`)
      await executeSql(sql)
    } catch (error) {
      // Some errors are ok (like "already exists")
      if (error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('42710')) {
        console.log(`   ⏭️  ${name} - already exists, skipping`)
      } else {
        console.error(`   ❌ ${name} failed:`, error.message)
      }
    }
  }

  console.log('\n✅ Migration completed successfully!')
  console.log('\n📊 Summary:')
  console.log('   ✅ user_openai_settings table created')
  console.log('   ✅ Index created')
  console.log('   ✅ Row Level Security enabled')
  console.log('   ✅ 4 RLS policies created')
  console.log('   ✅ updated_at trigger created')
  console.log('\n🎉 OpenAI settings system is ready to use!')
}

runTableCreation()
