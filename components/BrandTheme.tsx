'use client'

import { useBrand } from '@/lib/brand/BrandContext'

export default function BrandTheme() {
  const brand = useBrand()

  return (
    <style jsx global>{`
      :root {
        --brand-primary: ${brand.color_primary};
        --brand-secondary: ${brand.color_secondary};
        --brand-accent: ${brand.color_accent};
        --brand-success: ${brand.color_success};
        --brand-error: ${brand.color_error};
      }
    `}</style>
  )
}
