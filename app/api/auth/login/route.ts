import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Track visit for non-admin users
    try {
      const { data: userData } = await (supabase
        .from('users') as any)
        .select('lead_capture_id, is_admin')
        .eq('id', data.user.id)
        .single()

      if (userData && !(userData as any).is_admin && (userData as any).lead_capture_id) {
        const ipAddress = getIPAddress(request)
        const userAgent = getUserAgent(request)
        const referrer = getReferrer(request)

        // Fetch geolocation data
        const geoData = await getIPGeolocation(ipAddress)
        const geoFields = extractGeolocationFields(geoData)

        const leadCaptureId = (userData as any).lead_capture_id

        // Get current visit count
        const { data: leadData } = await (supabase
          .from('lead_captures') as any)
          .select('visit_count')
          .eq('id', leadCaptureId)
          .single()

        const currentVisitCount = leadData?.visit_count || 0

        // Update visit count, IP, and geolocation for the lead_capture
        await (supabase
          .from('lead_captures') as any)
          .update({
            visit_count: currentVisitCount + 1,
            ip_address: ipAddress,
            ...geoFields,
          })
          .eq('id', leadCaptureId)

        // Log the visit
        await (supabase
          .from('visit_logs') as any)
          .insert({
            lead_capture_id: leadCaptureId,
            ip_address: ipAddress,
            user_agent: userAgent,
            page_path: '/login',
            referrer: referrer,
          })
      }
    } catch (trackingError) {
      console.error('Visit tracking error (non-fatal):', trackingError)
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
