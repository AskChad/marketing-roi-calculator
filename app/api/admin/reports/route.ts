import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin authentication
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

    if (!(userData as any)?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all tracking IDs with anonymous scenarios
    const { data: anonymousScenarios, error: scenariosError } = await supabase
      .from('roi_scenarios')
      .select(`
        id,
        tracking_id,
        user_id,
        scenario_name,
        target_conversion_rate,
        new_sales,
        new_revenue,
        sales_increase,
        revenue_increase,
        cpa_improvement_percent,
        created_at,
        calculator_sessions (
          current_leads,
          current_sales,
          current_ad_spend,
          current_revenue,
          current_conversion_rate,
          current_cpl,
          current_cpa
        )
      `)
      .not('tracking_id', 'is', null)
      .order('created_at', { ascending: false })

    if (scenariosError) {
      console.error('Error fetching anonymous scenarios:', scenariosError)
      return NextResponse.json(
        { error: 'Failed to fetch scenarios' },
        { status: 500 }
      )
    }

    // Fetch lead captures with tracking IDs
    const { data: leadCaptures, error: leadsError } = await supabase
      .from('lead_captures')
      .select(`
        tracking_id,
        email,
        first_name,
        last_name,
        company_name,
        phone,
        ip_address,
        country,
        region,
        city,
        zipcode,
        created_at
      `)
      .not('tracking_id', 'is', null)
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('Error fetching lead captures:', leadsError)
    }

    // Fetch calculator visits with tracking IDs
    const { data: visits, error: visitsError } = await supabase
      .from('calculator_visits')
      .select(`
        tracking_id,
        ip_address,
        user_agent,
        referrer,
        country,
        region,
        city,
        zipcode,
        visited_at
      `)
      .not('tracking_id', 'is', null)
      .order('visited_at', { ascending: false })

    if (visitsError) {
      console.error('Error fetching visits:', visitsError)
    }

    // Group data by tracking_id
    const trackingIdMap = new Map<string, any>()

    // Process scenarios
    ;(anonymousScenarios || []).forEach((scenario: any) => {
      const trackingId = scenario.tracking_id
      if (!trackingIdMap.has(trackingId)) {
        trackingIdMap.set(trackingId, {
          tracking_id: trackingId,
          scenarios: [],
          lead_capture: null,
          visits: [],
          first_seen: scenario.created_at,
          last_seen: scenario.created_at,
        })
      }
      const entry = trackingIdMap.get(trackingId)
      entry.scenarios.push(scenario)
      if (scenario.created_at < entry.first_seen) {
        entry.first_seen = scenario.created_at
      }
      if (scenario.created_at > entry.last_seen) {
        entry.last_seen = scenario.created_at
      }
    })

    // Process lead captures
    ;(leadCaptures || []).forEach((lead: any) => {
      const trackingId = lead.tracking_id
      if (!trackingIdMap.has(trackingId)) {
        trackingIdMap.set(trackingId, {
          tracking_id: trackingId,
          scenarios: [],
          lead_capture: lead,
          visits: [],
          first_seen: lead.created_at,
          last_seen: lead.created_at,
        })
      } else {
        trackingIdMap.get(trackingId).lead_capture = lead
      }
    })

    // Process visits
    ;(visits || []).forEach((visit: any) => {
      const trackingId = visit.tracking_id
      if (trackingIdMap.has(trackingId)) {
        trackingIdMap.get(trackingId).visits.push(visit)
      }
    })

    // Convert map to array and sort by last_seen
    const journeys = Array.from(trackingIdMap.values())
      .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())

    return NextResponse.json({
      success: true,
      journeys,
      stats: {
        total_journeys: journeys.length,
        with_lead_capture: journeys.filter(j => j.lead_capture).length,
        total_scenarios: journeys.reduce((sum, j) => sum + j.scenarios.length, 0),
        total_visits: journeys.reduce((sum, j) => sum + j.visits.length, 0),
      }
    })

  } catch (error: any) {
    console.error('Error in GET /api/admin/reports:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
