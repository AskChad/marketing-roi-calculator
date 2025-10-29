import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
