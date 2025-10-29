import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Marketing ROI Calculator | Optimize Your Ad Spend',
  description: 'Calculate and optimize your marketing ROI with AI-powered insights. Compare platforms, track scenarios, and maximize your advertising performance.',
  keywords: 'marketing ROI, ROI calculator, ad spend optimization, marketing analytics, conversion rate optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
