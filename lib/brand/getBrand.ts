import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { Brand } from './BrandContext'

/**
 * Get brand configuration based on the current request domain
 * Checks Host header to determine which brand to load
 */
export async function getBrandFromRequest(): Promise<Brand> {
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

    return defaultBrand as Brand
  }

  return brand as Brand
}

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
