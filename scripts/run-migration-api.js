/**
 * Run migration using Supabase REST API approach
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read env file
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch {
            resolve({ success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runMigration() {
  console.log('Testing Supabase connection and attempting migration...\n');

  try {
    // Test 1: Check if we can read the tables
    console.log('1. Testing connection to lead_captures table...');
    const leadTest = await makeRequest('GET', '/rest/v1/lead_captures?select=id&limit=1');
    console.log('   ✓ Connected! Can read lead_captures');

    console.log('2. Testing connection to users table...');
    const userTest = await makeRequest('GET', '/rest/v1/users?select=id&limit=1');
    console.log('   ✓ Connected! Can read users');

    // Test 2: Check if tracking_id column already exists
    console.log('\n3. Checking if tracking_id already exists...');
    try {
      const trackingTest = await makeRequest('GET', '/rest/v1/lead_captures?select=tracking_id&limit=1');
      console.log('   ✓ tracking_id column already exists!');
      console.log('\n✅ Migration already completed!');
      return;
    } catch (error) {
      if (error.message.includes('tracking_id')) {
        console.log('   → tracking_id column does not exist, migration needed');
      } else {
        throw error;
      }
    }

    // The REST API cannot execute DDL statements
    console.log('\n❌ Cannot execute ALTER TABLE via REST API');
    console.log('\nThe Supabase REST API does not support DDL operations for security.');
    console.log('You need to run the SQL in the Supabase Dashboard SQL Editor:');
    console.log('\n--- Copy this SQL ---');
    console.log('ALTER TABLE lead_captures ADD COLUMN IF NOT EXISTS tracking_id UUID;');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS tracking_id UUID;');
    console.log('CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking_id ON lead_captures(tracking_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_users_tracking_id ON users(tracking_id);');
    console.log('--- End SQL ---\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
