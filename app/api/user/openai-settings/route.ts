import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const userOpenaiSettingsSchema = z.object({
  api_key: z.string().min(1).optional().nullable(),
  use_platform_key: z.boolean().optional(),
})

/**
 * GET /api/user/openai-settings
 * Get user's personal OpenAI settings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's OpenAI settings
    const { data: settings, error } = await supabase
      .from('user_openai_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user OpenAI settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          api_key_exists: false,
          use_platform_key: true,
        },
      })
    }

    // Mask API key
    const settingsData = settings as any
    const response: any = {
      use_platform_key: settingsData.use_platform_key,
      api_key_exists: !!settingsData.api_key,
    }

    if (settingsData.api_key) {
      response.api_key_masked = '***...' + settingsData.api_key.slice(-4)
    }

    return NextResponse.json({
      success: true,
      settings: response,
    })
  } catch (error) {
    console.error('User OpenAI settings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/openai-settings
 * Update user's personal OpenAI settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = userOpenaiSettingsSchema.parse(body)

    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('user_openai_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const updateData: any = {}

    if (validatedData.api_key !== undefined) {
      updateData.api_key = validatedData.api_key
    }

    if (validatedData.use_platform_key !== undefined) {
      updateData.use_platform_key = validatedData.use_platform_key
    }

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from('user_openai_settings')
        // @ts-ignore - Type mismatch due to table not existing yet
        .update(updateData)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating user OpenAI settings:', error)
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        )
      }
    } else {
      // Create new settings
      const { error} = await supabase
        .from('user_openai_settings')
        // @ts-ignore - Type mismatch due to table not existing yet
        .insert([{
          user_id: user.id,
          ...updateData,
        }])

      if (error) {
        console.error('Error creating user OpenAI settings:', error)
        return NextResponse.json(
          { error: 'Failed to create settings' },
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

    console.error('User OpenAI settings PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/openai-settings
 * Delete user's personal OpenAI API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear the API key (set to null) but keep the record
    const { error } = await supabase
      .from('user_openai_settings')
      // @ts-ignore - Type mismatch due to table not existing yet
      .update({ api_key: null, use_platform_key: true })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting user OpenAI key:', error)
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    })
  } catch (error) {
    console.error('User OpenAI settings DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
