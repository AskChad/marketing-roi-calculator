import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { locationId } = await request.json()

    const supabase = await createClient()

    // Update admin settings
    await (supabase
      .from('admin_settings')
      // @ts-ignore - Supabase type inference issue
      .upsert([
        { setting_key: 'ghl_connected', setting_value: 'true' },
        { setting_key: 'ghl_location_id', setting_value: locationId },
      ]))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GHL connect error:', error)
    return NextResponse.json(
      { error: 'Failed to connect' },
      { status: 500 }
    )
  }
}
