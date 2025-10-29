import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      scenarioName,
      sessionId,
      targetConversionRate,
      adjustedLeads,
      adjustedAdSpend,
      newSales,
      newCPL,
      newCPA,
      newRevenue,
      salesIncrease,
      revenueIncrease,
      cpaImprovementPercent,
    } = body

    // Validate required fields
    if (!scenarioName || !targetConversionRate || newSales === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare the scenario data with proper types
    const scenarioData = {
      user_id: user.id,
      session_id: (sessionId || null) as string | null,
      scenario_name: scenarioName as string,
      target_conversion_rate: Number(targetConversionRate),
      adjusted_leads: adjustedLeads ? Number(adjustedLeads) : null,
      adjusted_ad_spend: adjustedAdSpend ? Number(adjustedAdSpend) : null,
      new_sales: Number(newSales),
      new_cpl: Number(newCPL),
      new_cpa: Number(newCPA),
      new_revenue: Number(newRevenue),
      sales_increase: Number(salesIncrease),
      revenue_increase: Number(revenueIncrease),
      cpa_improvement_percent: Number(cpaImprovementPercent),
    }

    // Insert the scenario
    const { data: scenario, error: insertError } = await supabase
      .from('roi_scenarios')
      // @ts-expect-error - Supabase types are not properly inferred for insert
      .insert(scenarioData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting scenario:', insertError)
      return NextResponse.json(
        { error: 'Failed to save scenario', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ scenario }, { status: 201 })

  } catch (error: any) {
    console.error('Error in POST /api/scenarios:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = (userData as any)?.is_admin || false

    // Fetch scenarios (admins see all, users see their own)
    let query = supabase
      .from('roi_scenarios')
      .select('*, calculator_sessions(*)')
      .order('created_at', { ascending: false })

    // If not admin, filter to user's scenarios only
    if (!isAdmin) {
      query = query.eq('user_id', user.id)
    }

    const { data: scenarios, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching scenarios:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scenarios', details: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ scenarios }, { status: 200 })

  } catch (error: any) {
    console.error('Error in GET /api/scenarios:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
