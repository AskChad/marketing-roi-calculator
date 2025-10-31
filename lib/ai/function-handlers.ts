/**
 * OpenAI Function Handlers
 * Execute database queries based on function calls
 */

import { SupabaseClient } from '@supabase/supabase-js'

type FunctionArgs = Record<string, any>

/**
 * USER FUNCTIONS
 */

export async function getMyScenarios(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const limit = args.limit || 50
  const sortBy = args.sortBy || 'created_at'
  const sortOrder = (args.sortOrder || 'desc') as 'asc' | 'desc'

  const { data, error } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      calculator_sessions(
        time_period,
        current_leads,
        current_sales,
        current_ad_spend,
        current_revenue,
        current_conversion_rate,
        current_cpl,
        current_cpa,
        avg_revenue_per_sale
      )
    `)
    .eq('user_id', userId)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .limit(limit)

  if (error) throw error
  return { scenarios: data || [], count: data?.length || 0 }
}

export async function getMyStats(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { data: scenarios, error } = await supabase
    .from('roi_scenarios')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  if (!scenarios || scenarios.length === 0) {
    return {
      totalScenarios: 0,
      message: 'No scenarios found for this user',
    }
  }

  const avgSalesIncrease = scenarios.reduce((sum, s) => sum + s.sales_increase, 0) / scenarios.length
  const avgRevenueIncrease = scenarios.reduce((sum, s) => sum + s.revenue_increase, 0) / scenarios.length
  const avgCPAImprovement = scenarios.reduce((sum, s) => sum + s.cpa_improvement_percent, 0) / scenarios.length

  const bestScenario = scenarios.reduce((best, current) =>
    current.revenue_increase > best.revenue_increase ? current : best
  )

  return {
    totalScenarios: scenarios.length,
    avgSalesIncrease: Math.round(avgSalesIncrease),
    avgRevenueIncrease: Math.round(avgRevenueIncrease),
    avgCPAImprovement: Math.round(avgCPAImprovement * 10) / 10,
    bestScenario: {
      name: bestScenario.scenario_name,
      salesIncrease: bestScenario.sales_increase,
      revenueIncrease: Math.round(bestScenario.revenue_increase),
      cpaImprovement: Math.round(bestScenario.cpa_improvement_percent * 10) / 10,
    },
  }
}

export async function compareScenarios(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { scenarioId1, scenarioId2 } = args

  const { data: scenario1, error: error1 } = await supabase
    .from('roi_scenarios')
    .select('*')
    .eq('id', scenarioId1)
    .eq('user_id', userId)
    .single()

  const { data: scenario2, error: error2 } = await supabase
    .from('roi_scenarios')
    .select('*')
    .eq('id', scenarioId2)
    .eq('user_id', userId)
    .single()

  if (error1 || error2 || !scenario1 || !scenario2) {
    return { error: 'One or both scenarios not found or not accessible' }
  }

  return {
    scenario1: {
      name: scenario1.scenario_name,
      targetCR: scenario1.target_conversion_rate,
      salesIncrease: scenario1.sales_increase,
      revenueIncrease: Math.round(scenario1.revenue_increase),
      cpaImprovement: scenario1.cpa_improvement_percent,
    },
    scenario2: {
      name: scenario2.scenario_name,
      targetCR: scenario2.target_conversion_rate,
      salesIncrease: scenario2.sales_increase,
      revenueIncrease: Math.round(scenario2.revenue_increase),
      cpaImprovement: scenario2.cpa_improvement_percent,
    },
    comparison: {
      betterSalesIncrease: scenario1.sales_increase > scenario2.sales_increase ? 'scenario1' : 'scenario2',
      betterRevenueIncrease: scenario1.revenue_increase > scenario2.revenue_increase ? 'scenario1' : 'scenario2',
      betterCPAImprovement: scenario1.cpa_improvement_percent > scenario2.cpa_improvement_percent ? 'scenario1' : 'scenario2',
    },
  }
}

export async function getScenarioDetails(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { scenarioId } = args

  const { data: scenario, error } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      calculator_sessions(*),
      scenario_platforms(
        *,
        platforms(name, slug)
      )
    `)
    .eq('id', scenarioId)
    .eq('user_id', userId)
    .single()

  if (error || !scenario) {
    return { error: 'Scenario not found or not accessible' }
  }

  return {
    scenario: {
      name: scenario.scenario_name,
      targetCR: scenario.target_conversion_rate,
      salesIncrease: scenario.sales_increase,
      revenueIncrease: Math.round(scenario.revenue_increase),
      cpaImprovement: scenario.cpa_improvement_percent,
      createdAt: scenario.created_at,
    },
    currentMetrics: scenario.calculator_sessions,
    platformBreakdown: scenario.scenario_platforms?.map((sp: any) => ({
      platform: sp.platforms.name,
      targetCR: sp.platform_target_cr,
      newSales: sp.platform_new_sales,
      newRevenue: Math.round(sp.platform_new_revenue),
      newROI: sp.platform_new_roi,
    })) || [],
  }
}

/**
 * ADMIN FUNCTIONS
 */

export async function searchUsersByEmail(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { email } = args

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, created_at')
    .ilike('email', `%${email}%`)
    .limit(20)

  if (error) throw error

  return {
    users: data || [],
    count: data?.length || 0,
  }
}

export async function searchUsersByName(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { firstName, lastName } = args

  let query = supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, created_at')

  if (firstName) {
    query = query.ilike('first_name', `%${firstName}%`)
  }
  if (lastName) {
    query = query.ilike('last_name', `%${lastName}%`)
  }

  const { data, error } = await query.limit(20)

  if (error) throw error

  return {
    users: data || [],
    count: data?.length || 0,
  }
}

export async function searchUsersByCompany(
  supabase: SupabaseClient,
  userId: string,
  args: FunctionArgs
) {
  const { companyName } = args

  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name, created_at')
    .ilike('company_name', `%${companyName}%`)
    .limit(20)

  if (error) throw error

  return {
    users: data || [],
    count: data?.length || 0,
  }
}

export async function getUserScenarios(
  supabase: SupabaseClient,
  adminUserId: string,
  args: FunctionArgs
) {
  const { userId, limit = 50 } = args

  const { data, error } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      calculator_sessions(
        time_period,
        current_leads,
        current_sales,
        current_ad_spend,
        current_revenue,
        current_conversion_rate
      ),
      users(email, first_name, last_name, company_name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return {
    scenarios: data || [],
    count: data?.length || 0,
    userInfo: data?.[0]?.users || null,
  }
}

export async function getCompanyStats(
  supabase: SupabaseClient,
  adminUserId: string,
  args: FunctionArgs
) {
  const { companyName } = args

  // First get users from this company
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name')
    .ilike('company_name', `%${companyName}%`)

  if (usersError) throw usersError

  if (!users || users.length === 0) {
    return { error: 'No users found for this company' }
  }

  const userIds = users.map(u => u.id)

  // Get all scenarios for these users
  const { data: scenarios, error: scenariosError } = await supabase
    .from('roi_scenarios')
    .select('*')
    .in('user_id', userIds)

  if (scenariosError) throw scenariosError

  if (!scenarios || scenarios.length === 0) {
    return {
      companyName,
      totalUsers: users.length,
      totalScenarios: 0,
      message: 'No scenarios found for users at this company',
    }
  }

  const avgSalesIncrease = scenarios.reduce((sum, s) => sum + s.sales_increase, 0) / scenarios.length
  const avgRevenueIncrease = scenarios.reduce((sum, s) => sum + s.revenue_increase, 0) / scenarios.length
  const totalRevenue = scenarios.reduce((sum, s) => sum + s.revenue_increase, 0)

  return {
    companyName,
    totalUsers: users.length,
    totalScenarios: scenarios.length,
    avgSalesIncrease: Math.round(avgSalesIncrease),
    avgRevenueIncrease: Math.round(avgRevenueIncrease),
    totalRevenueIncrease: Math.round(totalRevenue),
  }
}

export async function getPlatformAnalytics(
  supabase: SupabaseClient,
  adminUserId: string,
  args: FunctionArgs
) {
  const timeRange = args.timeRange || '30days'

  let dateFilter = new Date()
  if (timeRange === '7days') {
    dateFilter.setDate(dateFilter.getDate() - 7)
  } else if (timeRange === '30days') {
    dateFilter.setDate(dateFilter.getDate() - 30)
  } else if (timeRange === '90days') {
    dateFilter.setDate(dateFilter.getDate() - 90)
  }

  let query = supabase
    .from('roi_scenarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (timeRange !== 'all') {
    query = query.gte('created_at', dateFilter.toISOString())
  }

  const { data: scenarios, error } = await query

  if (error) throw error

  if (!scenarios || scenarios.length === 0) {
    return { message: 'No scenarios found for this time range' }
  }

  // Get unique users
  const uniqueUsers = new Set(scenarios.map(s => s.user_id)).size

  const avgSalesIncrease = scenarios.reduce((sum, s) => sum + s.sales_increase, 0) / scenarios.length
  const avgRevenueIncrease = scenarios.reduce((sum, s) => sum + s.revenue_increase, 0) / scenarios.length
  const avgCPAImprovement = scenarios.reduce((sum, s) => sum + s.cpa_improvement_percent, 0) / scenarios.length
  const totalRevenue = scenarios.reduce((sum, s) => sum + s.revenue_increase, 0)

  return {
    timeRange,
    totalUsers: uniqueUsers,
    totalScenarios: scenarios.length,
    avgSalesIncrease: Math.round(avgSalesIncrease),
    avgRevenueIncrease: Math.round(avgRevenueIncrease),
    avgCPAImprovement: Math.round(avgCPAImprovement * 10) / 10,
    totalRevenueIncrease: Math.round(totalRevenue),
  }
}

export async function getTopPerformingUsers(
  supabase: SupabaseClient,
  adminUserId: string,
  args: FunctionArgs
) {
  const limit = args.limit || 10
  const sortBy = args.sortBy || 'revenue_increase'

  const { data: scenarios, error } = await supabase
    .from('roi_scenarios')
    .select(`
      user_id,
      sales_increase,
      revenue_increase,
      cpa_improvement_percent,
      users(email, first_name, last_name, company_name)
    `)
    .order(sortBy, { ascending: false })
    .limit(100)

  if (error) throw error

  if (!scenarios || scenarios.length === 0) {
    return { message: 'No scenarios found' }
  }

  // Group by user and calculate totals
  const userStats = new Map()
  scenarios.forEach(scenario => {
    const userId = scenario.user_id
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        userId,
        userInfo: scenario.users,
        totalSalesIncrease: 0,
        totalRevenueIncrease: 0,
        avgCPAImprovement: 0,
        scenarioCount: 0,
      })
    }
    const stats = userStats.get(userId)
    stats.totalSalesIncrease += scenario.sales_increase
    stats.totalRevenueIncrease += scenario.revenue_increase
    stats.avgCPAImprovement += scenario.cpa_improvement_percent
    stats.scenarioCount += 1
  })

  // Convert to array and calculate averages
  const topUsers = Array.from(userStats.values())
    .map(stats => ({
      email: stats.userInfo.email,
      firstName: stats.userInfo.first_name,
      lastName: stats.userInfo.last_name,
      companyName: stats.userInfo.company_name,
      totalSalesIncrease: stats.totalSalesIncrease,
      totalRevenueIncrease: Math.round(stats.totalRevenueIncrease),
      avgCPAImprovement: Math.round((stats.avgCPAImprovement / stats.scenarioCount) * 10) / 10,
      scenarioCount: stats.scenarioCount,
    }))
    .sort((a, b) => {
      if (sortBy === 'sales_increase') return b.totalSalesIncrease - a.totalSalesIncrease
      if (sortBy === 'cpa_improvement') return b.avgCPAImprovement - a.avgCPAImprovement
      return b.totalRevenueIncrease - a.totalRevenueIncrease
    })
    .slice(0, limit)

  return {
    topUsers,
    count: topUsers.length,
  }
}

/**
 * Function router - maps function names to handlers
 */
export const functionHandlers = {
  // User functions
  getMyScenarios,
  getMyStats,
  compareScenarios,
  getScenarioDetails,

  // Admin functions
  searchUsersByEmail,
  searchUsersByName,
  searchUsersByCompany,
  getUserScenarios,
  getCompanyStats,
  getPlatformAnalytics,
  getTopPerformingUsers,
}

export async function executeFunctionCall(
  functionName: string,
  args: FunctionArgs,
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean
): Promise<any> {
  // Check if function exists
  if (!(functionName in functionHandlers)) {
    throw new Error(`Unknown function: ${functionName}`)
  }

  // Check admin permission for admin-only functions
  const adminOnlyFunctions = [
    'searchUsersByEmail',
    'searchUsersByName',
    'searchUsersByCompany',
    'getUserScenarios',
    'getCompanyStats',
    'getPlatformAnalytics',
    'getTopPerformingUsers',
  ]

  if (adminOnlyFunctions.includes(functionName) && !isAdmin) {
    throw new Error('Admin access required for this function')
  }

  // Execute the function
  const handler = functionHandlers[functionName as keyof typeof functionHandlers]
  return await handler(supabase, userId, args)
}
