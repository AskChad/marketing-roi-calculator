/**
 * Update Supabase Auth Configuration
 * This script updates the Site URL and Redirect URLs in Supabase Auth settings
 */

const https = require('https');

const SUPABASE_PROJECT_REF = 'ohmioijbzvhoydyhdkdk';
const PRODUCTION_URL = 'https://www.roicalculator.app';

// You'll need a Supabase Management API token from:
// https://supabase.com/dashboard/account/tokens
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  console.log('\n⚠️  SUPABASE_MANAGEMENT_TOKEN not found!');
  console.log('\nTo update Supabase auth config programmatically, you need a Management API token.');
  console.log('\n📋 Steps to get your Management API token:');
  console.log('1. Go to: https://supabase.com/dashboard/account/tokens');
  console.log('2. Click "Generate New Token"');
  console.log('3. Give it a name (e.g., "CLI Access")');
  console.log('4. Copy the token');
  console.log('5. Run: export SUPABASE_MANAGEMENT_TOKEN=<your-token>');
  console.log('6. Run this script again\n');
  console.log('\n🔄 Alternative: Update manually in dashboard');
  console.log('Go to: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/auth/url-configuration');
  console.log('Update Site URL to:', PRODUCTION_URL);
  console.log('Add redirect URLs:');
  console.log('  -', PRODUCTION_URL + '/**');
  console.log('  - https://roicalculator.app/**');
  console.log('  - https://*.vercel.app/**\n');
  process.exit(1);
}

async function updateAuthConfig() {
  const config = {
    SITE_URL: PRODUCTION_URL,
    URI_ALLOW_LIST: [
      `${PRODUCTION_URL}/**`,
      'https://roicalculator.app/**',
      'https://*.vercel.app/**'
    ].join(',')
  };

  console.log('🔄 Updating Supabase Auth Configuration...\n');
  console.log('Project:', SUPABASE_PROJECT_REF);
  console.log('Site URL:', config.SITE_URL);
  console.log('Redirect URLs:', config.URI_ALLOW_LIST.split(',').join('\n               '));
  console.log('');

  const data = JSON.stringify(config);

  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Successfully updated Supabase auth configuration!');
          console.log('\n📧 Email confirmation links will now point to:', PRODUCTION_URL);
          resolve(JSON.parse(responseData || '{}'));
        } else {
          console.error('❌ Failed to update auth configuration');
          console.error('Status:', res.statusCode);
          console.error('Response:', responseData);
          reject(new Error(responseData));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

updateAuthConfig().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
