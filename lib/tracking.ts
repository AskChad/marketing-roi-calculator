import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const TRACKING_COOKIE_NAME = 'visitor_tracking_id'
const TRACKING_COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 days in seconds

/**
 * Get or create tracking ID for anonymous visitors
 * Returns the tracking ID and whether it was newly created
 */
export function getOrCreateTrackingId(request: NextRequest): { trackingId: string; isNew: boolean } {
  // Try to get existing tracking ID from cookie
  const existingTrackingId = request.cookies.get(TRACKING_COOKIE_NAME)?.value

  if (existingTrackingId) {
    return { trackingId: existingTrackingId, isNew: false }
  }

  // Generate new tracking ID using Node.js crypto
  const newTrackingId = randomUUID()
  return { trackingId: newTrackingId, isNew: true }
}

/**
 * Set tracking cookie in response
 */
export function setTrackingCookie(response: NextResponse, trackingId: string): void {
  response.cookies.set(TRACKING_COOKIE_NAME, trackingId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TRACKING_COOKIE_MAX_AGE,
    path: '/',
  })
}

/**
 * Get tracking ID from request cookies
 */
export function getTrackingId(request: NextRequest): string | null {
  return request.cookies.get(TRACKING_COOKIE_NAME)?.value || null
}
