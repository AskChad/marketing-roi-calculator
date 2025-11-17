import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/types/database'
import { ghlClient } from '@/lib/ghl-client'
import { getIPAddress, getUserAgent, getReferrer, getIPGeolocation, extractGeolocationFields } from '@/lib/get-ip-address'
import { getOrCreateTrackingId, setTrackingCookie } from '@/lib/tracking'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

const leadCaptureSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  smsOptInMarketing: z.boolean().optional(),
  smsOptInTransactional: z.boolean().optional(),
  // Optional ROI data for GHL sync
  roiData: z.object({
    currentLeads: z.number().optional(),
    currentSales: z.number().optional(),
    currentAdSpend: z.number().optional(),
    currentRevenue: z.number().optional(),
    currentCR: z.number().optional(),
    currentCPL: z.number().optional(),
    currentCPA: z.number().optional(),
    scenarioName: z.string().optional(),
    targetCR: z.number().optional(),
    newSales: z.number().optional(),
    newRevenue: z.number().optional(),
    salesIncrease: z.number().optional(),
    revenueIncrease: z.number().optional(),
    cpaImprovement: z.number().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Lead Capture] Received request with data:', JSON.stringify(body))

    // Validate input
    const validatedData = leadCaptureSchema.parse(body)
    console.log('[Lead Capture] Validation passed')

    // Create Supabase client
    const supabase = await createClient()

    // Get brand from request
    const brand = await getBrandFromRequest()
    console.log('[Lead Capture] Brand resolved:', brand.id, brand.name)

    // Check if this email already exists in lead_captures
    const { data: existingLead } = await (supabase
      .from('lead_captures') as any)
      .select('tracking_id')
      .eq('email', validatedData.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Use existing tracking_id if email exists, otherwise create new one
    let trackingId: string
    if (existingLead && existingLead.tracking_id) {
      trackingId = existingLead.tracking_id
      console.log('Reusing existing tracking_id for email:', validatedData.email, trackingId)
    } else {
      const result = getOrCreateTrackingId(request)
      trackingId = result.trackingId
      console.log('Created new tracking_id for email:', validatedData.email, trackingId)
    }

    // Capture IP address and tracking info
    const ipAddress = getIPAddress(request)
    const userAgent = getUserAgent(request)
    const referrer = getReferrer(request)

    // Prepare SMS consent data if user opted in (A2P 10DLC compliance)
    const smsConsentData: any = {}
    const timestamp = new Date().toISOString()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.roicalculator.app'

    // Marketing SMS consent
    if (validatedData.smsOptInMarketing === true) {
      smsConsentData.sms_opt_in_marketing = true
      smsConsentData.sms_marketing_opted_in_at = timestamp
      smsConsentData.sms_marketing_consent_ip = ipAddress
      smsConsentData.sms_marketing_consent_text = 'I agree to receive automated marketing text messages from AskChad at the phone number provided. Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.'
      console.log('[Lead Capture] User opted in to MARKETING SMS')
    }

    // Transactional SMS consent
    if (validatedData.smsOptInTransactional === true) {
      smsConsentData.sms_opt_in_transactional = true
      smsConsentData.sms_transactional_opted_in_at = timestamp
      smsConsentData.sms_transactional_consent_ip = ipAddress
      smsConsentData.sms_transactional_consent_text = 'I agree to receive automated transactional and service-based text messages from AskChad at the phone number provided. Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.'
      console.log('[Lead Capture] User opted in to TRANSACTIONAL SMS')
    }

    // Store legacy sms_opt_in for backward compatibility (true if either is checked)
    if (validatedData.smsOptInMarketing || validatedData.smsOptInTransactional) {
      smsConsentData.sms_opt_in = true
      smsConsentData.sms_opted_in_at = timestamp
      smsConsentData.sms_consent_ip = ipAddress
      smsConsentData.sms_consent_user_agent = userAgent
      smsConsentData.sms_terms_url = `${appUrl}/sms-terms`
      smsConsentData.sms_privacy_url = `${appUrl}/privacy`
    }

    // Insert lead capture without geolocation (will be added in background)
    const insertData: any = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone || null,
      company_name: validatedData.companyName,
      website_url: validatedData.websiteUrl || null,
      ip_address: ipAddress,
      tracking_id: trackingId,
      brand_id: brand.id,
      visit_count: 1,
      ...smsConsentData, // Include SMS consent fields if user opted in
    }

    console.log('[Lead Capture] Attempting insert with brand_id:', brand.id, 'tracking_id:', trackingId)

    const { data, error } = await supabase
      .from('lead_captures')
      .insert([insertData] as any)
      .select('id')
      .single()

    if (error) {
      console.error('[Lead Capture] Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        brand_id: brand.id,
        tracking_id: trackingId
      })
      return NextResponse.json(
        { error: 'Failed to save lead information', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Lead Capture] Insert successful, ID:', (data as any)?.id)

    const leadCaptureId = (data as any)?.id

    // Create response and set tracking cookie immediately for fast response
    const response = NextResponse.json({
      success: true,
      leadCaptureId: (data as any)?.id || null,
      trackingId: trackingId, // Return tracking_id so frontend can update localStorage
    })

    setTrackingCookie(response, trackingId)

    // Run background tasks without blocking the response (non-blocking)
    void (async () => {
      // Log the visit
      try {
        await (supabase
          .from('visit_logs') as any)
          .insert({
            lead_capture_id: leadCaptureId,
            ip_address: ipAddress,
            user_agent: userAgent,
            page_path: '/lead-capture',
            referrer: referrer,
          })
      } catch (visitLogError) {
        console.error('[Background] Visit log error (non-fatal):', visitLogError)
      }

      // Update geolocation data in background
      try {
        const geoData = await getIPGeolocation(ipAddress)
        if (geoData) {
          const geoFields = extractGeolocationFields(geoData)
          await (supabase
            .from('lead_captures') as any)
            .update(geoFields)
            .eq('id', leadCaptureId)
          console.log('[Background] Geolocation data added for lead:', leadCaptureId)
        }
      } catch (geoError) {
        console.error('[Background] Geolocation error (non-fatal):', geoError)
      }

      // Sync to GHL (admin's account) if connected
      try {
        // Check if GHL is connected
        const { data: ghlSettings } = await (supabase
          .from('admin_settings') as any)
          .select('setting_key, setting_value')
          .in('setting_key', ['ghl_connected', 'ghl_location_id'])

        const settingsMap = ((ghlSettings as any[]) || []).reduce((acc: Record<string, string>, setting: any) => {
          acc[setting.setting_key] = setting.setting_value
          return acc
        }, {} as Record<string, string>)

        const isConnected = settingsMap.ghl_connected === 'true'
        const locationId = settingsMap.ghl_location_id

        if (isConnected && locationId) {
          // Prepare SMS consent data for GHL sync (A2P 10DLC compliance)
          const smsDataForGHL: any = {}

          // Marketing SMS
          if (validatedData.smsOptInMarketing === true) {
            smsDataForGHL.smsOptInMarketing = true
            smsDataForGHL.smsMarketingConsentText = 'I agree to receive automated marketing text messages from AskChad at the phone number provided. Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.'
            smsDataForGHL.smsMarketingOptedInAt = timestamp
            smsDataForGHL.smsMarketingConsentIp = ipAddress
          }

          // Transactional SMS
          if (validatedData.smsOptInTransactional === true) {
            smsDataForGHL.smsOptInTransactional = true
            smsDataForGHL.smsTransactionalConsentText = 'I agree to receive automated transactional and service-based text messages from AskChad at the phone number provided. Message frequency varies. Message & data rates may apply. Reply HELP for help, STOP to end.'
            smsDataForGHL.smsTransactionalOptedInAt = timestamp
            smsDataForGHL.smsTransactionalConsentIp = ipAddress
          }

          // Sync to GHL with ROI data and SMS consent data
          await ghlClient.syncROIData(locationId, {
            email: validatedData.email,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            companyName: validatedData.companyName,
            ...(validatedData.roiData || {}),
            ...smsDataForGHL, // Include SMS consent data
          })

          const smsStatus = []
          if (validatedData.smsOptInMarketing) smsStatus.push('Marketing SMS')
          if (validatedData.smsOptInTransactional) smsStatus.push('Transactional SMS')
          console.log('[Background] Successfully synced lead to GoHighLevel:', validatedData.email, smsStatus.length > 0 ? `(with ${smsStatus.join(' + ')})` : '')
        } else {
          console.log('[Background] GHL not connected, skipping sync')
        }
      } catch (ghlError) {
        // Log GHL sync error but don't fail the lead capture
        console.error('[Background] GHL sync error (non-fatal):', ghlError)
      }
    })()

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('[Lead Capture] Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('[Lead Capture] Unexpected error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
