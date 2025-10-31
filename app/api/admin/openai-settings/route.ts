import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const openaiSettingsSchema = z.object({
  api_key: z.string().min(1).optional().nullable(),
  model: z.string().min(1).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(100).max(4000).optional(),
  system_instructions: z.string().min(1).optional(),
})

/**
 * GET /api/admin/openai-settings
 * Get OpenAI configuration (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = (userData as any)?.is_admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch OpenAI settings
    const { data: settings, error } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'openai_api_key',
        'openai_model',
        'openai_temperature',
        'openai_max_tokens',
        'openai_system_instructions',
      ])

    if (error) {
      console.error('Error fetching OpenAI settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Transform array to object
    const settingsObj: Record<string, any> = {}
    settings?.forEach((s: any) => {
      const key = s.setting_key.replace('openai_', '')

      // Parse numeric values
      if (key === 'temperature' && s.setting_value) {
        settingsObj[key] = parseFloat(s.setting_value)
      } else if (key === 'max_tokens' && s.setting_value) {
        settingsObj[key] = parseInt(s.setting_value)
      } else {
        settingsObj[key] = s.setting_value
      }
    })

    // Mask API key (show only last 4 characters)
    if (settingsObj.api_key) {
      const key = settingsObj.api_key
      settingsObj.api_key_masked = '***...' + key.slice(-4)
      settingsObj.api_key_exists = true
      delete settingsObj.api_key // Don't send full key to frontend
    } else {
      settingsObj.api_key_exists = false
    }

    return NextResponse.json({
      success: true,
      settings: settingsObj,
    })
  } catch (error) {
    console.error('OpenAI settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/openai-settings
 * Update OpenAI configuration (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = openaiSettingsSchema.parse(body)

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = (userData as any)?.is_admin
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Update settings
    const updates: Array<{ setting_key: string; setting_value: string | null }> = []

    if (validatedData.api_key !== undefined) {
      updates.push({
        setting_key: 'openai_api_key',
        setting_value: validatedData.api_key,
      })
    }

    if (validatedData.model !== undefined) {
      updates.push({
        setting_key: 'openai_model',
        setting_value: validatedData.model,
      })
    }

    if (validatedData.temperature !== undefined) {
      updates.push({
        setting_key: 'openai_temperature',
        setting_value: validatedData.temperature.toString(),
      })
    }

    if (validatedData.max_tokens !== undefined) {
      updates.push({
        setting_key: 'openai_max_tokens',
        setting_value: validatedData.max_tokens.toString(),
      })
    }

    if (validatedData.system_instructions !== undefined) {
      updates.push({
        setting_key: 'openai_system_instructions',
        setting_value: validatedData.system_instructions,
      })
    }

    // Update each setting
    for (const update of updates) {
      const { error } = await supabase
        .from('admin_settings')
        // @ts-ignore - Type mismatch due to table not existing yet
        .update({ setting_value: update.setting_value })
        .eq('setting_key', update.setting_key)

      if (error) {
        console.error(`Error updating ${update.setting_key}:`, error)
        return NextResponse.json(
          { error: `Failed to update ${update.setting_key}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OpenAI settings updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('OpenAI settings PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
