import { NextRequest } from 'next/server'

/**
 * Extract the real IP address from a Next.js request
 * Handles common reverse proxy headers and falls back to socket address
 */
export function getIPAddress(request: NextRequest): string {
  // Check common headers set by reverse proxies / load balancers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Vercel-specific header
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp

  // Fastly
  const fastlyClientIp = request.headers.get('fastly-client-ip')
  if (fastlyClientIp) return fastlyClientIp

  // Other common headers
  const trueClientIp = request.headers.get('true-client-ip')
  if (trueClientIp) return trueClientIp

  const xClientIp = request.headers.get('x-client-ip')
  if (xClientIp) return xClientIp

  // Fallback to 'unknown' if no IP could be determined
  return 'unknown'
}

/**
 * Get user agent string from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Get referrer from request
 */
export function getReferrer(request: NextRequest): string | null {
  return request.headers.get('referer') || request.headers.get('referrer') || null
}
