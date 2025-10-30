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

/**
 * IP Geolocation data structure
 */
export interface IPGeolocationData {
  country_name?: string
  country_code2?: string
  state_prov?: string
  city?: string
  zipcode?: string
  latitude?: string
  longitude?: string
  time_zone?: {
    name?: string
  }
  isp?: string
  organization?: string
  continent_name?: string
  continent_code?: string
  currency?: {
    code?: string
    name?: string
  }
  calling_code?: string
  languages?: string
  [key: string]: any  // Allow additional fields
}

/**
 * Fetch geolocation data from ipgeolocation.io API
 * API Key: 1205b2d5d21f46998615ea2330c60713
 */
export async function getIPGeolocation(ipAddress: string): Promise<IPGeolocationData | null> {
  // Skip geolocation for unknown IPs or localhost
  if (!ipAddress || ipAddress === 'unknown' || ipAddress === '::1' || ipAddress.startsWith('127.')) {
    return null
  }

  const apiKey = '1205b2d5d21f46998615ea2330c60713'
  const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAddress}`

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 1 hour to avoid excessive API calls for same IP
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.error('IP Geolocation API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data as IPGeolocationData
  } catch (error) {
    console.error('Failed to fetch IP geolocation:', error)
    return null
  }
}

/**
 * Extract geolocation fields for database storage
 */
export function extractGeolocationFields(geoData: IPGeolocationData | null) {
  if (!geoData) {
    return {
      geo_country_name: null,
      geo_country_code2: null,
      geo_state_prov: null,
      geo_city: null,
      geo_zipcode: null,
      geo_latitude: null,
      geo_longitude: null,
      geo_timezone: null,
      geo_isp: null,
      geo_organization: null,
      geo_continent_name: null,
      geo_continent_code: null,
      geo_currency_code: null,
      geo_currency_name: null,
      geo_calling_code: null,
      geo_languages: null,
      geo_data: null,
    }
  }

  return {
    geo_country_name: geoData.country_name || null,
    geo_country_code2: geoData.country_code2 || null,
    geo_state_prov: geoData.state_prov || null,
    geo_city: geoData.city || null,
    geo_zipcode: geoData.zipcode || null,
    geo_latitude: geoData.latitude ? parseFloat(geoData.latitude) : null,
    geo_longitude: geoData.longitude ? parseFloat(geoData.longitude) : null,
    geo_timezone: geoData.time_zone?.name || null,
    geo_isp: geoData.isp || null,
    geo_organization: geoData.organization || null,
    geo_continent_name: geoData.continent_name || null,
    geo_continent_code: geoData.continent_code || null,
    geo_currency_code: geoData.currency?.code || null,
    geo_currency_name: geoData.currency?.name || null,
    geo_calling_code: geoData.calling_code || null,
    geo_languages: geoData.languages || null,
    geo_data: geoData,  // Store full response as JSONB
  }
}
