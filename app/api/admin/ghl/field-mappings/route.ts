import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const fieldMappingsSchema = z.object({
  mappings: z.record(z.string(), z.string()),
  notesEnabled: z.boolean(),
  notesTemplate: z.string(),
})

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

    // Get field mappings and notes config
    const { data: settings } = await (supabase
      .from('admin_settings') as any)
      .select('setting_key, setting_value')
      .in('setting_key', ['ghl_field_mappings', 'ghl_notes_enabled', 'ghl_notes_template'])

    const settingsMap = ((settings as any[]) || []).reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    const mappings = settingsMap.ghl_field_mappings
      ? JSON.parse(settingsMap.ghl_field_mappings)
      : {
          currentLeads: 'roi_current_leads',
          currentSales: 'roi_current_sales',
          currentAdSpend: 'roi_current_ad_spend',
          currentRevenue: 'roi_current_revenue',
          currentCR: 'roi_current_cr',
          currentCPL: 'roi_current_cpl',
          currentCPA: 'roi_current_cpa',
          scenarioName: 'roi_scenario_name',
          targetCR: 'roi_target_cr',
          newSales: 'roi_new_sales',
          newRevenue: 'roi_new_revenue',
          salesIncrease: 'roi_sales_increase',
          revenueIncrease: 'roi_revenue_increase',
          cpaImprovement: 'roi_cpa_improvement',
        }

    return NextResponse.json({
      mappings,
      notesEnabled: settingsMap.ghl_notes_enabled === 'true',
      notesTemplate: settingsMap.ghl_notes_template || '',
    })
  } catch (error: any) {
    console.error('Get field mappings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch field mappings' },
      { status: 500 }
    )
  }
}

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
    const validatedData = fieldMappingsSchema.parse(body)

    // Save field mappings and notes config
    const settings = [
      { setting_key: 'ghl_field_mappings', setting_value: JSON.stringify(validatedData.mappings) },
      { setting_key: 'ghl_notes_enabled', setting_value: validatedData.notesEnabled.toString() },
      { setting_key: 'ghl_notes_template', setting_value: validatedData.notesTemplate },
    ]

    await (supabase
      .from('admin_settings') as any)
      .upsert(settings, { onConflict: 'setting_key' })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Save field mappings error:', error)
    return NextResponse.json(
      { error: 'Failed to save field mappings' },
      { status: 500 }
    )
  }
}
