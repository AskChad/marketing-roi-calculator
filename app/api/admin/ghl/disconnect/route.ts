import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Update admin settings
    await (supabase
      .from('admin_settings')
      // @ts-ignore - Supabase type inference issue
      .update({ setting_value: 'false' })
      .eq('setting_key', 'ghl_connected'))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GHL disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
