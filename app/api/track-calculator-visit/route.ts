import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTrackingId, setTrackingCookie } from '@/lib/tracking'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

// Use edge runtime for faster cold starts
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get or create tracking ID
    const { trackingId } = getOrCreateTrackingId(request)

    // Get IP address and tracking info
    const ipAddress = getIPAddress(request)
    const userAgent = getUserAgent(request)
    const referrer = getReferrer(request)

    // Get page path from request body
    const body = await request.json().catch(() => ({}))
    const pagePath = body.page || null

    // Parallelize brand and user lookups for better performance
    const [brand, { data: { user } }] = await Promise.all([
      getBrandFromRequest(),
      supabase.auth.getUser()
    ])
    const userId = user?.id || null

    // Insert basic visit record first (fast response)
    const visitData: any = {
      tracking_id: trackingId,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
    }

    // Add optional fields
    if (brand?.id) {
      visitData.brand_id = brand.id
    }
    if (pagePath) {
      visitData.page_path = pagePath
    }

    // Insert immediately without waiting for geolocation
    const { error: insertError } = await supabase
      .from('calculator_visits')
      .insert([visitData] as any)

    if (insertError) {
      console.error('Error tracking calculator visit:', insertError)
    }

    // Fetch geolocation in background (don't await)
    // Update the record with geo data asynchronously
    getIPGeolocation(ipAddress).then(async geoData => {
      if (geoData && !insertError) {
        try {
          const supabaseForUpdate = await createClient()
          const geoUpdate: any = {
            country: geoData?.country_name || null,
            region: geoData?.state_prov || null,
            city: geoData?.city || null,
            zipcode: geoData?.zipcode || null,
            latitude: geoData?.latitude ? parseFloat(geoData.latitude) : null,
            longitude: geoData?.longitude ? parseFloat(geoData.longitude) : null,
            timezone: geoData?.time_zone?.name || null,
          }

          const { error: updateError } = await supabaseForUpdate
            .from('calculator_visits')
            // @ts-ignore - Supabase type inference issue with background update
            .update(geoUpdate)
            .eq('tracking_id', trackingId)
            .eq('ip_address', ipAddress)
            .order('visited_at', { ascending: false })
            .limit(1)

          if (updateError) {
            console.error('Error updating geolocation data:', updateError)
          }
        } catch (updateErr) {
          console.error('Error in geolocation update:', updateErr)
        }
      }
    }).catch(err => {
      console.error('Error fetching geolocation:', err)
    })

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
