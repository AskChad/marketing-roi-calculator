'use client'

import { useBrand } from '@/lib/brand/BrandContext'
import Image from 'next/image'

export default function HeroSection() {
  const brand = useBrand()

  return (
    <div className="mb-12">
      {/* Hero Section with Logo and Text */}
      <div className="flex items-center justify-center gap-6">
        {brand.logo_url && (
          <Image
            src={brand.logo_url}
            alt={brand.name}
            width={200}
            height={200}
            className="h-[200px] w-[200px] object-contain flex-shrink-0"
            priority
          />
        )}
        <div className="flex flex-col">
          <div className="mb-3">
            <span className="text-brand-primary font-semibold text-lg tracking-wide uppercase">
              AskChad
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 leading-tight text-left mb-4">
            {brand.hero_title}
          </h1>
          <p className="text-xl text-neutral-600 leading-relaxed text-left">
            {brand.hero_subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
