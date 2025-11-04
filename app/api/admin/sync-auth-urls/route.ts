import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || ''
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN || ''
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.roicalculator.app'

/**
 * API endpoint to sync brand domains to Supabase auth configuration
 *
 * This should be called:
 * - Manually when needed: POST /api/admin/sync-auth-urls
 * - Automatically after brand create/update/delete operations
 */
export async function POST(request: Request) {
  try {
    // Optional: Add admin authentication check here
    // const session = await getServerSession()
    // if (!session?.user?.role === 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    if (!SUPABASE_MANAGEMENT_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_MANAGEMENT_TOKEN not configured',
        message: 'Add SUPABASE_MANAGEMENT_TOKEN to environment variables to enable automatic auth URL syncing'
      }, { status: 500 })
    }

    // Get all active brands
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('domain, subdomain, is_active')
      .eq('is_active', true)

    if (brandsError) {
      throw new Error(`Failed to fetch brands: ${brandsError.message}`)
    }

    // Build domain list
    const domains = new Set<string>()

    brands?.forEach(brand => {
      if (brand.domain) {
        // Add main domain variations
        domains.add(`https://${brand.domain}`)
        domains.add(`https://www.${brand.domain}`)

        // Add subdomain if exists
        if (brand.subdomain) {
          domains.add(`https://${brand.subdomain}.${brand.domain}`)
        }
      }
    })

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

    console.log('🔄 Syncing redirect URLs to Supabase...')
    console.log(`📋 Found ${brands?.length || 0} active brands`)
    console.log(`📝 Total redirect URLs: ${uniqueUrls.length}`)

    // Update Supabase auth config via Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          SITE_URL: BASE_URL,
          URI_ALLOW_LIST: uniqueUrls.join(',')
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase Management API error: ${errorText}`)
    }

    const result = await response.json()

    console.log('✅ Successfully synced redirect URLs!')

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${uniqueUrls.length} redirect URLs`,
      brandCount: brands?.length || 0,
      urlCount: uniqueUrls.length,
      urls: uniqueUrls,
      result
    })

  } catch (error: any) {
    console.error('❌ Error syncing redirect URLs:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred'
    }, { status: 500 })
  }
}

/**
 * GET endpoint to check current configuration
 */
export async function GET() {
  try {
    if (!SUPABASE_MANAGEMENT_TOKEN) {
      return NextResponse.json({
        configured: false,
        message: 'SUPABASE_MANAGEMENT_TOKEN not configured'
      })
    }

    return NextResponse.json({
      configured: true,
      projectRef: SUPABASE_PROJECT_REF,
      baseUrl: BASE_URL,
      message: 'Auth URL sync is configured and ready'
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      error: error.message
    }, { status: 500 })
  }
}
