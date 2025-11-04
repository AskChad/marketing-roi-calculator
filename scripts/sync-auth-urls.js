/**
 * Sync Brand Domains to Supabase Auth Configuration
 *
 * This script fetches all active brand domains and updates the Supabase
 * auth redirect URLs to include them all.
 *
 * Usage:
 *   node scripts/sync-auth-urls.js
 */

// Try to load dotenv if available
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not available, use environment variables directly
}
const https = require('https')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.roicalculator.app'

// Extract project ref from URL
const SUPABASE_PROJECT_REF = SUPABASE_URL.split('//')[1].split('.')[0]

if (!SUPABASE_MANAGEMENT_TOKEN) {
  console.error('❌ Error: SUPABASE_MANAGEMENT_TOKEN not found in environment variables')
  console.log('\n📋 To get a Management API token:')
  console.log('1. Visit: https://supabase.com/dashboard/account/tokens')
  console.log('2. Click "Generate New Token"')
  console.log('3. Name it: "Brand Domain Management"')
  console.log('4. Add to .env.local: SUPABASE_MANAGEMENT_TOKEN=your_token_here')
  console.log('5. Run this script again\n')
  process.exit(1)
}

/**
 * Fetch all active brands from Supabase
 */
async function getAllBrands() {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/brands', SUPABASE_URL)
    url.searchParams.append('select', 'domain,subdomain,is_active')
    url.searchParams.append('is_active', 'eq.true')

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    https.get(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

/**
 * Update Supabase auth configuration
 */
async function updateAuthConfig(redirectUrls) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      SITE_URL: BASE_URL,
      URI_ALLOW_LIST: redirectUrls.join(',')
    })

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      res.on('data', chunk => responseData += chunk)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData || '{}'))
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔄 Fetching active brands from database...\n')

    // Get all brands
    const brands = await getAllBrands()
    console.log(`✅ Found ${brands.length} active brand(s)\n`)

    // Build domain list
    const domains = new Set()

    brands.forEach(brand => {
      if (brand.domain) {
        console.log(`📦 Brand: ${brand.domain}${brand.subdomain ? ` (subdomain: ${brand.subdomain})` : ''}`)

        // Add main domain variations
        domains.add(`https://${brand.domain}`)
        domains.add(`https://www.${brand.domain}`)

        // Add subdomain if exists
        if (brand.subdomain) {
          domains.add(`https://${brand.subdomain}.${brand.domain}`)
        }
      }
    })

    console.log(`\n📋 Extracted ${domains.size} unique domain(s)\n`)

    // Build complete redirect URL list
    const redirectUrls = [
      // Base production URLs
      `${BASE_URL}/**`,
      'https://roicalculator.app/**',
      'https://www.roicalculator.app/**',

      // Vercel preview deployments
      'https://*.vercel.app/**',

      // All brand domains
      ...Array.from(domains).map(domain => `${domain}/**`)
    ]

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(redirectUrls))

    console.log('🌐 Redirect URLs to be configured:')
    uniqueUrls.forEach(url => console.log(`   ${url}`))
    console.log(`\n📊 Total: ${uniqueUrls.length} redirect URLs\n`)

    // Update Supabase
    console.log('🚀 Updating Supabase auth configuration...\n')
    await updateAuthConfig(uniqueUrls)

    console.log('✅ SUCCESS! Auth configuration updated!\n')
    console.log('📧 Email confirmation links will now work for:')
    console.log(`   - Main site: ${BASE_URL}`)
    console.log(`   - All ${brands.length} brand domain(s)`)
    console.log(`   - All Vercel preview deployments\n`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
