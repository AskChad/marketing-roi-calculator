import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBrandFromRequest } from '@/lib/brand/getBrand'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get brand from request
    const brand = await getBrandFromRequest()

    // Get the authenticated user (optional for anonymous scenarios)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const {
      scenarioName,
      baselineMetrics,
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
      trackingId, // Optional tracking ID for anonymous users
    } = body

    // Validate required fields
    if (!scenarioName || !targetConversionRate || newSales === undefined || !baselineMetrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, create a calculator session to store baseline metrics
    const sessionData = {
      user_id: user?.id || null, // Allow null for anonymous users
      time_period: baselineMetrics.timePeriod,
      current_leads: Number(baselineMetrics.leads),
      current_sales: Number(baselineMetrics.sales),
      current_ad_spend: Number(baselineMetrics.adSpend),
      current_revenue: Number(baselineMetrics.revenue),
      current_conversion_rate: (baselineMetrics.sales / baselineMetrics.leads) * 100,
      current_cpl: baselineMetrics.adSpend / baselineMetrics.leads,
      current_cpa: baselineMetrics.adSpend / baselineMetrics.sales,
      avg_revenue_per_sale: baselineMetrics.revenue / baselineMetrics.sales,
    }

    const { data: session, error: sessionError } = await (supabase
      .from('calculator_sessions') as any)
      .insert(sessionData)
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating calculator session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Now create the scenario with reference to the session
    const scenarioData = {
      user_id: user?.id || null, // Allow null for anonymous users
      session_id: session.id,
      brand_id: brand.id,
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
      tracking_id: trackingId || null, // Store tracking ID for anonymous users
    }

    // Insert the scenario
    const { data: scenario, error: insertError } = await (supabase
      .from('roi_scenarios') as any)
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

    return NextResponse.json({ scenarios, isAdmin }, { status: 200 })

  } catch (error: any) {
    console.error('Error in GET /api/scenarios:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
