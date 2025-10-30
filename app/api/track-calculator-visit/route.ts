import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTrackingId, setTrackingCookie } from '@/lib/tracking'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get or create tracking ID
    const { trackingId } = getOrCreateTrackingId(request)

    // Get IP address and tracking info
    const ipAddress = getIPAddress(request)
    const userAgent = getUserAgent(request)
    const referrer = getReferrer(request)

    // Fetch geolocation data
    const geoData = await getIPGeolocation(ipAddress)

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Insert visit record with mapped geo fields
    const { error: insertError } = await supabase
      .from('calculator_visits')
      .insert([{
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
      }] as any)

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
