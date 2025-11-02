'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Global page view tracker component
 * Tracks all page visits for both logged-in and anonymous users
 */
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/track-calculator-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname
          }),
        })
      } catch (error) {
        // Silent fail - don't disrupt user experience if tracking fails
        console.error('Error tracking page visit:', error)
      }
    }

    trackVisit()
  }, [pathname]) // Track on every route change

  return null // This component doesn't render anything
}
