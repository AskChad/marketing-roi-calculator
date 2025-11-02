import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTrackingId, setTrackingCookie } from '@/lib/tracking'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get brand from request
    const brand = await getBrandFromRequest()

    // Get or create tracking ID
    const { trackingId } = getOrCreateTrackingId(request)

    // Get IP address and tracking info
    const ipAddress = getIPAddress(request)
    const userAgent = getUserAgent(request)
    const referrer = getReferrer(request)

    // Get page path from request body
    const body = await request.json().catch(() => ({}))
    const pagePath = body.page || null

    // Fetch geolocation data
    const geoData = await getIPGeolocation(ipAddress)

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Insert visit record with mapped geo fields
    const visitData: any = {
      tracking_id: trackingId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      country: geoData?.country_name || null,
      region: geoData?.state_prov || null,
      city: geoData?.city || null,
      zipcode: geoData?.zipcode || null,
      latitude: geoData?.latitude ? parseFloat(geoData.latitude) : null,
      longitude: geoData?.longitude ? parseFloat(geoData.longitude) : null,
      timezone: geoData?.time_zone?.name || null,
    }

    // Add optional fields if they exist in the table
    if (brand?.id) {
      visitData.brand_id = brand.id
    }
    if (pagePath) {
      visitData.page_path = pagePath
    }

    const { error: insertError } = await supabase
      .from('calculator_visits')
      .insert([visitData] as any)

    if (insertError) {
      console.error('Error tracking calculator visit:', insertError)
      // Don't fail the request if tracking fails
    }

    // Create response and set tracking cookie
    const response = NextResponse.json({ success: true })
    setTrackingCookie(response, trackingId)

    return response
  } catch (error) {
    console.error('Error in track-calculator-visit:', error)
    // Return success even if tracking fails to not disrupt user experience
    return NextResponse.json({ success: true })
  }
}
