import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/types/database'
import { ghlClient } from '@/lib/ghl-client'
import { getIPAddress, getUserAgent, getReferrer } from '@/lib/get-ip-address'

const leadCaptureSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal('')),
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

    // Validate input
    const validatedData = leadCaptureSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Capture IP address and tracking info
    const ipAddress = getIPAddress(request)
    const userAgent = getUserAgent(request)
    const referrer = getReferrer(request)

    // Insert lead capture with IP tracking
    const insertData: any = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone || null,
      company_name: validatedData.companyName,
      website_url: validatedData.websiteUrl || null,
      ip_address: ipAddress,
      visit_count: 1,
    }

    const { data, error } = await supabase
      .from('lead_captures')
      .insert([insertData] as any)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save lead information' },
        { status: 500 }
      )
    }

    const leadCaptureId = (data as any)?.id

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
      console.error('Visit log error (non-fatal):', visitLogError)
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
        // Sync to GHL with ROI data if provided
        await ghlClient.syncROIData(locationId, {
          email: validatedData.email,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone,
          companyName: validatedData.companyName,
          ...(validatedData.roiData || {}),
        })

        console.log('Successfully synced lead to GoHighLevel:', validatedData.email)
      } else {
        console.log('GHL not connected, skipping sync')
      }
    } catch (ghlError) {
      // Log GHL sync error but don't fail the lead capture
      console.error('GHL sync error (non-fatal):', ghlError)
    }

    return NextResponse.json({
      success: true,
      leadCaptureId: (data as any)?.id || null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
