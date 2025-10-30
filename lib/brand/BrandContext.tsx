'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface Brand {
  id: string
  name: string
  domain: string
  subdomain: string | null
  is_active: boolean

  // Theme colors
  color_primary: string
  color_secondary: string
  color_accent: string
  color_success: string
  color_error: string

  // Branding assets
  logo_url: string | null
  logo_dark_url: string | null
  favicon_url: string | null

  // Landing page copy
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_secondary_cta_text: string

  // Features
  feature_1_title: string
  feature_1_description: string
  feature_2_title: string
  feature_2_description: string
  feature_3_title: string
  feature_3_description: string

  // Footer & legal
  company_name: string | null
  support_email: string | null
  privacy_policy_url: string | null
  terms_of_service_url: string | null

  // Domain verification
  domain_verified?: boolean
  domain_verification_checked_at?: string
  dns_records?: any
}

const BrandContext = createContext<Brand | null>(null)

export function BrandProvider({ brand, children }: { brand: Brand; children: ReactNode }) {
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const context = useContext(BrandContext)
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider')
  }
  return context
}
