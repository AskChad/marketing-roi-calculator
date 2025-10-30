import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('GHL OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/admin?error=missing_parameters', request.url)
      )
    }

    const supabase = await createClient()

    // Verify state parameter
    const { data: storedState } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'ghl_oauth_state')
      .single()

    if ((storedState as any)?.setting_value !== state) {
      return NextResponse.redirect(
        new URL('/admin?error=invalid_state', request.url)
      )
    }

    // Decode state to get user ID
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const userId = stateData.userId

    // Get GHL OAuth credentials from database (fallback to environment)
    const { data: credentials } = await (supabase
      .from('admin_settings') as any)
      .select('setting_key, setting_value')
      .in('setting_key', ['ghl_client_id', 'ghl_client_secret'])

    const credentialsMap = ((credentials as any[]) || []).reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    const clientId = credentialsMap.ghl_client_id || process.env.GHL_CLIENT_ID
    const clientSecret = credentialsMap.ghl_client_secret || process.env.GHL_CLIENT_SECRET
    const redirectUri = process.env.GHL_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/ghl/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/admin?error=missing_credentials', request.url)
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/admin?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    // Store tokens and location ID in admin_settings
    const settings = [
      { setting_key: 'ghl_access_token', setting_value: tokenData.access_token },
      { setting_key: 'ghl_refresh_token', setting_value: tokenData.refresh_token },
      { setting_key: 'ghl_token_type', setting_value: tokenData.token_type || 'Bearer' },
      { setting_key: 'ghl_expires_in', setting_value: String(tokenData.expires_in || 86400) },
      { setting_key: 'ghl_token_expires_at', setting_value: String(Date.now() + (tokenData.expires_in * 1000)) },
      { setting_key: 'ghl_scope', setting_value: tokenData.scope || '' },
      { setting_key: 'ghl_location_id', setting_value: tokenData.locationId || tokenData.location_id || '' },
      { setting_key: 'ghl_company_id', setting_value: tokenData.companyId || tokenData.company_id || '' },
      { setting_key: 'ghl_user_type', setting_value: tokenData.userType || tokenData.user_type || '' },
      { setting_key: 'ghl_connected', setting_value: 'true' },
      { setting_key: 'ghl_connected_at', setting_value: new Date().toISOString() },
      { setting_key: 'ghl_connected_by', setting_value: userId },
    ]

    // Use upsert to update or insert settings
    await (supabase
      .from('admin_settings') as any)
      .upsert(settings, { onConflict: 'setting_key' })

    // Clear OAuth state
    await (supabase
      .from('admin_settings') as any)
      .delete()
      .eq('setting_key', 'ghl_oauth_state')

    // Redirect back to admin page with success message
    return NextResponse.redirect(
      new URL('/admin?success=ghl_connected', request.url)
    )

  } catch (error: any) {
    console.error('GHL OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/admin?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
