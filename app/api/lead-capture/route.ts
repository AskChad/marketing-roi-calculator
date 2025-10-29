import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/types/database'

const leadCaptureSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = leadCaptureSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Insert lead capture
    const insertData: Database['public']['Tables']['lead_captures']['Insert'] = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone || null,
      company_name: validatedData.companyName,
      website_url: validatedData.websiteUrl || null,
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

    // TODO: Sync to GHL (admin's account)
    // This will be implemented in the GHL integration phase

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
