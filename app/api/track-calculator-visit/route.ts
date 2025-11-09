import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrCreateTrackingId, setTrackingCookie } from '@/lib/tracking'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

// Use Node runtime (needed for crypto and fetch with geolocation)
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

    // Parallelize brand and user lookups only (fast operations)
    const [brand, { data: { user } }] = await Promise.all([
      getBrandFromRequest(),
      supabase.auth.getUser(),
    ])
    const userId = user?.id || null

    // Build visit record without geo data (will be added in background)
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

    // Insert visit immediately for fast response
    const { data: insertedVisit, error: insertError } = await supabase
      .from('calculator_visits')
      .insert([visitData] as any)
      .select('id')
      .single()

    if (insertError) {
      console.error('Error tracking calculator visit:', insertError)
    }

    // Create response and set tracking cookie immediately
    const response = NextResponse.json({ success: true })
    setTrackingCookie(response, trackingId)

    // Update geolocation in background (non-blocking)
    if (insertedVisit && (insertedVisit as any)?.id) {
      void (async () => {
        try {
          console.log('[Geolocation] Starting lookup for IP:', ipAddress, 'Visit ID:', (insertedVisit as any).id)
          const geoData = await getIPGeolocation(ipAddress)
          if (geoData) {
            console.log('[Geolocation] Data received:', {
              city: geoData.city,
              state: geoData.state_prov,
              zipcode: geoData.zipcode,
              country: geoData.country_name
            })
            const geoFields = extractGeolocationFields(geoData)
            // Update the visit record with geo data
            const { error: updateError } = await (supabase
              .from('calculator_visits') as any)
              .update({
                country: geoData.country_name || null,
                region: geoData.state_prov || null,
                city: geoData.city || null,
                zipcode: geoData.zipcode || null,
                latitude: geoData.latitude ? parseFloat(geoData.latitude) : null,
                longitude: geoData.longitude ? parseFloat(geoData.longitude) : null,
                timezone: geoData.time_zone?.name || null,
              })
              .eq('id', (insertedVisit as any).id)

            if (updateError) {
              console.error('[Geolocation] Failed to update visit record:', updateError)
            } else {
              console.log('[Geolocation] Successfully updated visit:', (insertedVisit as any).id)
            }
          } else {
            console.log('[Geolocation] No data returned for IP:', ipAddress)
          }
        } catch (geoError) {
          console.error('[Geolocation] Error (non-fatal):', geoError)
        }
      })()
    }

    return response
  } catch (error) {
    console.error('Error in track-calculator-visit:', error)
    // Return success even if tracking fails to not disrupt user experience
    return NextResponse.json({ success: true })
  }
}
