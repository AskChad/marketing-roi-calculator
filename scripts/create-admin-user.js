/**
 * Script to create platform admin user: chad@askchad.net
 * Run with: node scripts/create-admin-user.js
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
const ADMIN_PASSWORD = 'Admin2025!Secure#Platform'; // Change this after first login
const ADMIN_PHONE = '+1234567890'; // Update with real phone

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
          const response = JSON.parse(body);
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

async function createAdminUser() {
  console.log('🚀 Creating platform admin user...');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log('');

  try {
    // Step 1: Create auth user
    console.log('Step 1: Creating Supabase Auth user...');
    let authUser;
    try {
      authUser = await makeRequest('POST', '/auth/v1/admin/users', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE,
        email_confirm: true,
        user_metadata: {
          first_name: 'Chad',
          last_name: 'Lukens',
          company_name: 'AskChad'
        }
      });
      console.log('✅ Auth user created:', authUser.id);
    } catch (error) {
      if (error.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists, fetching user...');
        const users = await makeRequest('GET', `/auth/v1/admin/users?email=${encodeURIComponent(ADMIN_EMAIL)}`);
        authUser = users.users?.[0];
        if (!authUser) {
          throw new Error('User exists but could not fetch user data');
        }
        console.log('✅ Found existing auth user:', authUser.id);
      } else {
        throw error;
      }
    }

    // Step 2: Insert/update users table
    console.log('\nStep 2: Updating users table...');

    // First, create lead capture if needed
    await makeRequest('POST', '/rest/v1/lead_captures', {
      first_name: 'Chad',
      last_name: 'Lukens',
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      company_name: 'AskChad'
    }).catch(e => console.log('Note: Lead capture may already exist'));

    // Get lead capture ID
    const leadCaptures = await makeRequest('GET', `/rest/v1/lead_captures?email=eq.${encodeURIComponent(ADMIN_EMAIL)}&select=id`);
    const leadCaptureId = leadCaptures[0]?.id;

    // Insert or update user record
    const userRecord = {
      id: authUser.id,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      first_name: 'Chad',
      last_name: 'Lukens',
      company_name: 'AskChad',
      is_admin: true,
      lead_capture_id: leadCaptureId
    };

    try {
      await makeRequest('POST', '/rest/v1/users', userRecord);
      console.log('✅ User record created in users table');
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        // Update existing user
        await makeRequest('PATCH', `/rest/v1/users?id=eq.${authUser.id}`, {
          is_admin: true,
          first_name: 'Chad',
          last_name: 'Lukens',
          company_name: 'AskChad'
        });
        console.log('✅ User record updated in users table');
      } else {
        throw error;
      }
    }

    console.log('\n✨ SUCCESS! Platform admin created.');
    console.log('');
    console.log('Login credentials:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');
    console.log(`🌐 Login at: ${SUPABASE_URL.replace('ferlaleutrxxsjpjwrcn.supabase.co', 'marketing-roi-calculator-sigma.vercel.app')}/login`);

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
