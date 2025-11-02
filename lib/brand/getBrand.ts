import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { Brand } from './BrandContext'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

/**
 * Get brand configuration based on the current request domain
 * Checks Host header to determine which brand to load
 * Cached per request to prevent redundant DB queries
 */
const getBrandFromRequestUncached = async (): Promise<Brand> => {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'

  // Query brand by domain
  const { data: brand, error } = await supabase
    .from('brands')
    .select('*')
    .eq('domain', host)
    .eq('is_active', true)
    .single()

  if (error || !brand) {
    // If not found, try to find by subdomain
    const subdomain = host.split('.')[0]
    const { data: subdomainBrand } = await supabase
      .from('brands')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single()

    if (subdomainBrand) {
      return subdomainBrand as Brand
    }

    // Fall back to default brand
    const { data: defaultBrand } = await supabase
      .from('brands')
      .select('*')
      .eq('subdomain', 'default')
      .eq('is_active', true)
      .single()

    if (!defaultBrand) {
      // Return a fallback brand if nothing found in database
      return {
        id: 'default',
        name: 'Marketing ROI Calculator',
        domain: 'localhost:3000',
        subdomain: 'default',
        is_active: true,
        color_primary: '#0066CC',
        color_secondary: '#7C3AED',
        color_accent: '#F59E0B',
        color_success: '#10B981',
        color_error: '#EF4444',
        logo_url: null,
        logo_dark_url: null,
        favicon_url: null,
        hero_title: 'Marketing ROI Calculator',
        hero_subtitle: 'Calculate your current marketing performance and model prospective scenarios',
        hero_cta_text: 'Get Started Free',
        hero_secondary_cta_text: 'View Demo',
        feature_1_title: 'Real-Time Analysis',
        feature_1_description: 'Calculate ROI instantly',
        feature_2_title: 'Scenario Modeling',
        feature_2_description: 'Model what-if scenarios',
        feature_3_title: 'AI-Powered Insights',
        feature_3_description: 'Get intelligent recommendations',
        company_name: null,
        support_email: null,
        privacy_policy_url: null,
        terms_of_service_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Brand
    }

    return defaultBrand as Brand
  }

  return brand as Brand
}

// Wrap with React cache for request-level deduplication
export const getBrandFromRequest = cache(getBrandFromRequestUncached)

/**
 * Get brand by ID
 */
export async function getBrandById(brandId: string): Promise<Brand | null> {
  const supabase = await createClient()

  const { data: brand, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single()

  if (error || !brand) {
    return null
  }

  return brand as Brand
}

/**
 * Get all active brands (admin only)
 */
export async function getAllBrands(): Promise<Brand[]> {
  const supabase = await createClient()

  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error || !brands) {
    return []
  }

  return brands as Brand[]
}
