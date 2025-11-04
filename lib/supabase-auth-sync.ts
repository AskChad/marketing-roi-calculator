/**
 * Supabase Auth URL Synchronization
 * Automatically syncs brand domains to Supabase auth redirect URLs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || ''
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN || ''
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.roicalculator.app'

interface BrandDomain {
  domain: string
  subdomain: string | null
  is_active: boolean
}

/**
 * Get all active brand domains from the database
 */
export async function getAllBrandDomains(): Promise<string[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: brands, error } = await supabase
    .from('brands')
    .select('domain, subdomain, is_active')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  // Extract unique domains from brands
  const domains = new Set<string>()

  brands?.forEach((brand: BrandDomain) => {
    if (brand.domain) {
      // Add main domain
      domains.add(`https://${brand.domain}`)
      domains.add(`https://www.${brand.domain}`)

      // Add subdomain if exists
      if (brand.subdomain) {
        domains.add(`https://${brand.subdomain}.${brand.domain}`)
      }
    }
  })

  return Array.from(domains)
}

/**
 * Update Supabase auth configuration with all brand domains
 */
export async function syncAuthRedirectURLs(): Promise<{
  success: boolean
  message: string
  urls?: string[]
}> {
  if (!SUPABASE_MANAGEMENT_TOKEN) {
    return {
      success: false,
      message: 'SUPABASE_MANAGEMENT_TOKEN not configured. Add it to your environment variables.'
    }
  }

  try {
    // Get all brand domains
    const brandDomains = await getAllBrandDomains()

    // Build complete redirect URL list
    const redirectUrls = [
      // Base production URLs
      `${BASE_URL}/**`,
      'https://roicalculator.app/**',
      'https://www.roicalculator.app/**',

      // Vercel preview deployments
      'https://*.vercel.app/**',

      // All brand domains
      ...brandDomains.map(domain => `${domain}/**`)
    ]

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(redirectUrls))

    console.log('🔄 Syncing redirect URLs to Supabase...')
    console.log(`📋 Found ${brandDomains.length} brand domains`)
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
      const error = await response.text()
      throw new Error(`Failed to update Supabase config: ${error}`)
    }

    console.log('✅ Successfully synced redirect URLs!')

    return {
      success: true,
      message: `Successfully synced ${uniqueUrls.length} redirect URLs`,
      urls: uniqueUrls
    }
  } catch (error: any) {
    console.error('❌ Error syncing redirect URLs:', error)
    return {
      success: false,
      message: error.message || 'Unknown error occurred'
    }
  }
}

/**
 * Sync a single brand domain to Supabase auth
 * This is called automatically when a brand is created/updated
 */
export async function syncBrandDomain(brandDomain: string, subdomain?: string): Promise<void> {
  // Trigger a full sync to ensure all domains are included
  await syncAuthRedirectURLs()
}
