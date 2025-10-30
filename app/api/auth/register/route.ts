import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'
import { getTrackingId } from '@/lib/tracking'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const supabase = await createClient()

    // Get brand from request
    const brand = await getBrandFromRequest()

    // Get tracking ID from cookie (if user was anonymous before)
    const trackingId = getTrackingId(request)

    // Capture IP and fetch geolocation
    const ipAddress = getIPAddress(request)
    const geoData = await getIPGeolocation(ipAddress)
    const geoFields = extractGeolocationFields(geoData)

    // Step 1: Create lead_capture entry first (for non-admin users)
    // This ensures all registered users are in the leads table
    const { data: leadCapture, error: leadError } = await (supabase
      .from('lead_captures') as any)
      .insert([{
        first_name: validatedData.firstName || 'Unknown',
        last_name: validatedData.lastName || 'User',
        email: validatedData.email,
        phone: validatedData.phone,
        company_name: validatedData.companyName || 'Not Provided',
        ip_address: ipAddress,
        tracking_id: trackingId,
        brand_id: brand.id,
        visit_count: 1,
        ...geoFields,
      }])
      .select('id')
      .single()

    if (leadError) {
      console.error('Lead capture creation error:', leadError)
      return NextResponse.json(
        { error: 'Failed to create contact record' },
        { status: 500 }
      )
    }

    const leadCaptureId = (leadCapture as any)?.id

    // Log the visit
    try {
      await (supabase
        .from('visit_logs') as any)
        .insert({
          lead_capture_id: leadCaptureId,
          ip_address: getIPAddress(request),
          user_agent: getUserAgent(request),
          page_path: '/register',
          referrer: getReferrer(request),
        })
    } catch (visitLogError) {
      console.error('Visit log error (non-fatal):', visitLogError)
    }

    // Step 2: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Step 3: Create user record in users table with lead_capture_id and tracking_id
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: validatedData.email,
        phone: validatedData.phone,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        company_name: validatedData.companyName,
        password_hash: '', // Auth handles this
        is_admin: false,
        brand_id: brand.id,  // Attribute user to signup brand
        lead_capture_id: leadCaptureId,  // Link to lead_captures
        tracking_id: trackingId,  // Preserve anonymous visitor tracking
      }] as any)

    if (userError) {
      console.error('User record creation error:', userError)
      // Don't fail registration if user record fails
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
