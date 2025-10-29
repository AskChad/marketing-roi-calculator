/**
 * Run Supabase migrations
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_PROJECT_ID = 'ohmioijbzvhoydyhdkdk';
const SUPABASE_ACCESS_TOKEN = 'sbp_c4e5823876bec847496de53a8194218a68d6f896';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  try {
    // Read the initial schema migration
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250101000000_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running: 20250101000000_initial_schema.sql');
    console.log(`   Size: ${sql.length} characters`);

    await executeSQL(sql);
    console.log('✅ Initial schema migration completed!\n');

    // Read the admin user migration
    const adminMigrationPath = path.join(__dirname, '../supabase/migrations/20250101000001_add_admin_user.sql');
    const adminSQL = fs.readFileSync(adminMigrationPath, 'utf8');

    console.log('📄 Running: 20250101000001_add_admin_user.sql');
    console.log(`   Size: ${adminSQL.length} characters`);

    await executeSQL(adminSQL);
    console.log('✅ Admin user migration completed!\n');

    console.log('🎉 All migrations completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Login at: https://marketing-roi-calculator-sigma.vercel.app/login');
    console.log('2. Email: chad@askchad.net');
    console.log('3. Password: Admin2025!Secure#Platform');

  } catch (error) {
    console.error('\n❌ Error running migrations:', error.message);
    process.exit(1);
  }
}

runMigrations();
