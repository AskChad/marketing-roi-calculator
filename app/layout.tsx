import type { Metadata } from 'next'
import './globals.css'
import { getBrandFromRequest } from '@/lib/brand/getBrand'
import { BrandProvider } from '@/lib/brand/BrandContext'
import BrandTheme from '@/components/BrandTheme'
import PageViewTracker from '@/components/PageViewTracker'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandFromRequest()

  return {
    title: `${brand.hero_title} | ${brand.name}`,
    description: brand.hero_subtitle,
    keywords: 'marketing ROI, ROI calculator, ad spend optimization, marketing analytics, conversion rate optimization',
    icons: {
      icon: brand.favicon_url || '/favicon.ico',
      shortcut: brand.favicon_url || '/favicon.ico',
      apple: brand.favicon_url || '/favicon.ico',
    },
  }
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
      <head>
        {brand.favicon_url && (
          <>
            <link rel="icon" type="image/png" href={brand.favicon_url} />
            <link rel="shortcut icon" href={brand.favicon_url} />
            <link rel="apple-touch-icon" href={brand.favicon_url} />
          </>
        )}
      </head>
      <body className="font-sans">
        <BrandProvider brand={brand}>
          <BrandTheme />
          <PageViewTracker />
          {children}
        </BrandProvider>
      </body>
    </html>
  )
}
