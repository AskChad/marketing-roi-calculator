/**
 * Script to set admin role for existing user
 * Run with: node scripts/set-admin-role.js
 */

const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const ADMIN_EMAIL = 'chad@askchad.net';
const USER_ID = process.env.ADMIN_USER_ID || 'c89eebc1-acd1-422e-a858-80af4afdd76e';

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}, Body: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function setAdminRole() {
  console.log('🚀 Setting admin role for user...');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`User ID: ${USER_ID}`);
  console.log('');

  try {
    // Update user metadata to include is_admin flag
    await makeRequest('PUT', `/auth/v1/admin/users/${USER_ID}`, {
      app_metadata: {
        is_admin: true,
        role: 'admin'
      },
      user_metadata: {
        is_admin: true,
        first_name: 'Chad',
        last_name: 'Lukens',
        company_name: 'AskChad'
      }
    });

    console.log('✅ Admin role set successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run database migrations to create tables');
    console.log('2. Login to the app and the user record will be created automatically');
    console.log('');
    console.log('Login credentials:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: Admin2025!Secure#Platform`);
    console.log('');
    console.log('🌐 Login at: https://marketing-roi-calculator-sigma.vercel.app/login');

  } catch (error) {
    console.error('\n❌ Error setting admin role:', error.message);
    process.exit(1);
  }
}

setAdminRole();
