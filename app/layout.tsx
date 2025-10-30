import type { Metadata } from 'next'
import './globals.css'
import { getBrandFromRequest } from '@/lib/brand/getBrand'
import { BrandProvider } from '@/lib/brand/BrandContext'
import BrandTheme from '@/components/BrandTheme'

export const metadata: Metadata = {
  title: 'Marketing ROI Calculator | Optimize Your Ad Spend',
  description: 'Calculate and optimize your marketing ROI with AI-powered insights. Compare platforms, track scenarios, and maximize your advertising performance.',
  keywords: 'marketing ROI, ROI calculator, ad spend optimization, marketing analytics, conversion rate optimization',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get brand configuration based on request domain
  const brand = await getBrandFromRequest()

  return (
    <html lang="en">
      <body className="font-sans">
        <BrandProvider brand={brand}>
          <BrandTheme />
          {children}
        </BrandProvider>
      </body>
    </html>
  )
}
