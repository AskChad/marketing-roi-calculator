import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DEBUG endpoint to check OpenAI configuration
 * GET /api/debug/openai-config
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const debug: any = {
      timestamp: new Date().toISOString(),
      auth: {
        authenticated: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        authError: authError?.message || null
      },
      adminSettings: null,
      userSettings: null,
      envVars: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0
      }
    }

    if (user) {
      // Check admin settings
      const { data: adminSettings, error: adminError } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value, encrypted')
        .in('setting_key', [
          'openai_api_key',
          'openai_model',
          'openai_temperature',
          'openai_max_tokens',
          'openai_system_instructions'
        ])

      debug.adminSettings = {
        count: adminSettings?.length || 0,
        settings: adminSettings?.map((s: any) => ({
          key: s.setting_key,
          hasValue: !!s.setting_value,
          valueLength: s.setting_value?.length || 0,
          encrypted: s.encrypted
        })) || [],
        error: adminError?.message || null
      }

      // Check user settings
      const { data: userSettings, error: userError } = await supabase
        .from('user_openai_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      debug.userSettings = {
        exists: !!userSettings,
        hasApiKey: !!(userSettings as any)?.api_key,
        usePlatformKey: (userSettings as any)?.use_platform_key,
        error: userError?.message || null
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      debug.auth.isAdmin = !!(userData as any)?.is_admin
    }

    return NextResponse.json(debug)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
