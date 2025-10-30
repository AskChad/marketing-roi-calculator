import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    // Delete all GHL-related settings
    const ghlSettingKeys = [
      'ghl_access_token',
      'ghl_refresh_token',
      'ghl_token_type',
      'ghl_expires_in',
      'ghl_token_expires_at',
      'ghl_scope',
      'ghl_location_id',
      'ghl_company_id',
      'ghl_user_type',
      'ghl_connected',
      'ghl_connected_at',
      'ghl_connected_by',
      'ghl_oauth_state',
    ]

    await (supabase
      .from('admin_settings') as any)
      .delete()
      .in('setting_key', ghlSettingKeys)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GHL disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
