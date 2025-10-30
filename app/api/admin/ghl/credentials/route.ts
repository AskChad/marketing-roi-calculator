import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const credentialsSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
})

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

    // Validate request body
    const body = await request.json()
    const validatedData = credentialsSchema.parse(body)

    // Save credentials to admin_settings
    const settings = [
      { setting_key: 'ghl_client_id', setting_value: validatedData.clientId },
      { setting_key: 'ghl_client_secret', setting_value: validatedData.clientSecret },
    ]

    await (supabase
      .from('admin_settings') as any)
      .upsert(settings, { onConflict: 'setting_key' })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid credentials data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Save credentials error:', error)
    return NextResponse.json(
      { error: 'Failed to save credentials' },
      { status: 500 }
    )
  }
}
