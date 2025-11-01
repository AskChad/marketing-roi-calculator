import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const demoScenarioSchema = z.object({
  company_name: z.string().min(1),
  scenario_name: z.string().min(1),
  time_period: z.enum(['weekly', 'monthly']),
  current_leads: z.number().int().positive(),
  current_sales: z.number().int().nonnegative(),
  current_ad_spend: z.number().positive(),
  current_revenue: z.number().nonnegative(),
  current_conversion_rate: z.number(),
  current_cpl: z.number(),
  current_cpa: z.number(),
  avg_revenue_per_sale: z.number(),
  target_conversion_rate: z.number(),
  adjusted_leads: z.number().int().optional().nullable(),
  adjusted_ad_spend: z.number().optional().nullable(),
  new_sales: z.number().int(),
  new_cpl: z.number(),
  new_cpa: z.number(),
  new_revenue: z.number(),
  sales_increase: z.number().int(),
  revenue_increase: z.number(),
  cpa_improvement_percent: z.number(),
})

/**
 * POST /api/admin/demo-scenarios
 * Create a new demo scenario (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = demoScenarioSchema.parse(body)

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

    // Insert demo scenario
    const { data: demo, error } = await supabase
      .from('demo_scenarios')
      // @ts-ignore - Supabase type inference issue
      .insert([{
        ...validatedData,
        admin_id: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating demo scenario:', error)
      return NextResponse.json(
        { error: 'Failed to create demo scenario: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Demo scenario created successfully',
      demo,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Demo scenario creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/demo-scenarios
 * Get all demo scenarios (admin only)
 */
export async function GET() {
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

    // Fetch all demo scenarios
    const { data: demos, error } = await supabase
      .from('demo_scenarios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching demo scenarios:', error)
      return NextResponse.json(
        { error: 'Failed to fetch demo scenarios' },
        { status: 500 }
      )
    }

    return NextResponse.json(demos)
  } catch (error) {
    console.error('Demo scenarios GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
