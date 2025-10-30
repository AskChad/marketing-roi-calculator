import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!(userData as any)?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get GHL OAuth credentials from environment
    const clientId = process.env.GHL_CLIENT_ID
    const redirectUri = process.env.GHL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/ghl/callback`

    if (!clientId) {
      return NextResponse.json(
        { error: 'GHL OAuth credentials not configured' },
        { status: 500 }
      )
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
    })).toString('base64')

    // Store state in admin_settings for verification
    await (supabase
      .from('admin_settings') as any)
      .upsert({
        setting_key: 'ghl_oauth_state',
        setting_value: state,
      })

    // Construct GHL OAuth authorization URL
    const authUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation')
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('state', state)

    // Scopes for GHL API access
    // Reference: https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview
    const scopes = [
      'contacts.readonly',
      'contacts.write',
      'opportunities.readonly',
      'opportunities.write',
      'locations/customFields.readonly',
      'locations/customFields.write',
    ]
    authUrl.searchParams.append('scope', scopes.join(' '))

    // Redirect to GHL OAuth page
    return NextResponse.redirect(authUrl.toString())

  } catch (error: any) {
    console.error('GHL OAuth authorization error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow', details: error.message },
      { status: 500 }
    )
  }
}
