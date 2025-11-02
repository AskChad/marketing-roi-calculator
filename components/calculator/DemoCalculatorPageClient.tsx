'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'
import DemoCalculatorContent from '@/components/calculator/DemoCalculatorContent'

interface DemoCalculatorPageClientProps {
  userId: string
  userName: string
  isAdmin: boolean
  existingDemos: any[]
}

export default function DemoCalculatorPageClient({
  userId,
  userName,
  isAdmin,
  existingDemos
}: DemoCalculatorPageClientProps) {
  // Track calculator page visit
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/track-calculator-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        // Silent fail - don't disrupt user experience if tracking fails
        console.error('Error tracking demo calculator visit:', error)
      }
    }

    trackVisit()
  }, [])

  return (
    <>
      <Header
        showLogin={false}
        showDashboard={false}
        userName={userName}
        isAdmin={isAdmin}
      />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center space-x-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
              <svg className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Brand Name
              </h1>
              <p className="text-neutral-600">
                Create demo scenarios for prospective clients with company name tracking
              </p>
            </div>
          </div>

          <DemoCalculatorContent
            userId={userId}
            existingDemos={existingDemos}
          />
        </div>
      </main>
    </>
  )
}
