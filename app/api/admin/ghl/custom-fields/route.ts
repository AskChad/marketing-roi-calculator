import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ghlClient } from '@/lib/ghl-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!(userData as any)?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get location ID from settings
    const { data: locationData } = await (supabase
      .from('admin_settings') as any)
      .select('setting_value')
      .eq('setting_key', 'ghl_location_id')
      .single()

    const locationId = (locationData as any)?.setting_value

    if (!locationId) {
      return NextResponse.json(
        { error: 'GHL not connected or location ID not found' },
        { status: 400 }
      )
    }

    // Fetch custom fields from GHL
    const customFields = await ghlClient.getCustomFields(locationId)

    return NextResponse.json({ customFields })
  } catch (error: any) {
    console.error('Get custom fields error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch custom fields' },
      { status: 500 }
    )
  }
}
