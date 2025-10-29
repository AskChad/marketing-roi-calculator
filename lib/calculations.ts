// ROI Calculation Functions
// Based on CALCULATION_LOGIC.md

// =====================================================
// Current Metrics Calculations
// =====================================================

export function calculateCurrentConversionRate(sales: number, leads: number): number {
  if (leads === 0) return 0
  return (sales / leads) * 100
}

export function calculateCurrentCPL(adSpend: number, leads: number): number {
  if (leads === 0) return 0
  return adSpend / leads
}

export function calculateCurrentCPA(adSpend: number, sales: number): number {
  if (sales === 0) return 0
  return adSpend / sales
}

export function calculateAvgRevenuePerSale(revenue: number, sales: number): number {
  if (sales === 0) return 0
  return revenue / sales
}

// =====================================================
// Prospective Scenario Calculations
// =====================================================

export function calculateNewSales(leads: number, targetConversionRate: number): number {
  return Math.round((leads * targetConversionRate) / 100)
}

export function calculateNewCPL(adSpend: number, leads: number): number {
  if (leads === 0) return 0
  return adSpend / leads
}

export function calculateNewCPA(adSpend: number, newSales: number): number {
  if (newSales === 0) return 0
  return adSpend / newSales
}

export function calculateNewRevenue(newSales: number, avgRevenuePerSale: number): number {
  return newSales * avgRevenuePerSale
}

// =====================================================
// Comparison Metrics
// =====================================================

export function calculateRevenueIncrease(newRevenue: number, currentRevenue: number): number {
  return newRevenue - currentRevenue
}

export function calculateCPAImprovement(currentCPA: number, newCPA: number): number {
  if (currentCPA === 0) return 0
  return ((currentCPA - newCPA) / currentCPA) * 100
}

export function calculateSalesIncrease(newSales: number, currentSales: number): number {
  return newSales - currentSales
}

// =====================================================
// Dual Timeframe Conversion
// =====================================================

const WEEKS_PER_MONTH = 4.345 // 365.25 days ÷ 12 months ÷ 7 days

export function convertWeeklyToMonthly(weeklyMetrics: {
  leads: number
  sales: number
  adSpend: number
  revenue: number
}) {
  return {
    leads: Math.round(weeklyMetrics.leads * WEEKS_PER_MONTH),
    sales: Math.round(weeklyMetrics.sales * WEEKS_PER_MONTH),
    adSpend: weeklyMetrics.adSpend * WEEKS_PER_MONTH,
    revenue: weeklyMetrics.revenue * WEEKS_PER_MONTH,
  }
}

export function convertMonthlyToWeekly(monthlyMetrics: {
  leads: number
  sales: number
  adSpend: number
  revenue: number
}) {
  return {
    leads: Math.round(monthlyMetrics.leads / WEEKS_PER_MONTH),
    sales: Math.round(monthlyMetrics.sales / WEEKS_PER_MONTH),
    adSpend: monthlyMetrics.adSpend / WEEKS_PER_MONTH,
    revenue: monthlyMetrics.revenue / WEEKS_PER_MONTH,
  }
}

// =====================================================
// Master ROI Calculation
// =====================================================

export interface BaselineMetrics {
  leads: number
  sales: number
  adSpend: number
  revenue: number
  timePeriod: 'weekly' | 'monthly'
}

export interface TargetScenario {
  targetType: 'conversionRate' | 'cpl' | 'cpa'
  targetConversionRate?: number
  targetCPL?: number
  targetCPA?: number
  adjustedLeads?: number
  adjustedAdSpend?: number
}

export interface CalculatedMetrics {
  // Current metrics
  currentConversionRate: number
  currentCPL: number
  currentCPA: number
  avgRevenuePerSale: number

  // Prospective metrics
  targetConversionRate: number
  newSales: number
  newCPL: number
  newCPA: number
  newRevenue: number

  // Comparison metrics
  salesIncrease: number
  revenueIncrease: number
  cpaImprovementPercent: number
}

export interface DualTimeframeResult {
  inputPeriod: 'weekly' | 'monthly'
  weekly: {
    current: BaselineMetrics
    prospective: BaselineMetrics & CalculatedMetrics
  }
  monthly: {
    current: BaselineMetrics
    prospective: BaselineMetrics & CalculatedMetrics
  }
}

export function calculateDualTimeframeROI(
  baseline: BaselineMetrics,
  target: TargetScenario
): DualTimeframeResult {
  // Determine leads and ad spend (use adjusted values if provided)
  let leads = target.adjustedLeads ?? baseline.leads
  let adSpend = target.adjustedAdSpend ?? baseline.adSpend

  // Calculate current metrics
  const currentConversionRate = calculateCurrentConversionRate(baseline.sales, baseline.leads)
  const currentCPL = calculateCurrentCPL(baseline.adSpend, baseline.leads)
  const currentCPA = calculateCurrentCPA(baseline.adSpend, baseline.sales)
  const avgRevenuePerSale = calculateAvgRevenuePerSale(baseline.revenue, baseline.sales)

  // Determine target conversion rate based on target type
  let targetConversionRate: number

  if (target.targetType === 'conversionRate') {
    // User specified conversion rate directly
    targetConversionRate = target.targetConversionRate!
  } else if (target.targetType === 'cpl') {
    // User specified target CPL - adjust ad spend to achieve it
    // CPL = adSpend / leads, so adSpend = CPL * leads
    adSpend = target.targetCPL! * leads
    // Keep the same conversion rate as current
    targetConversionRate = currentConversionRate
  } else {
    // target.targetType === 'cpa'
    // User specified target CPA - calculate required conversion rate
    // CPA = adSpend / sales = adSpend / (leads * CR / 100)
    // So: CR = (adSpend / targetCPA) / leads * 100
    targetConversionRate = (adSpend / (target.targetCPA! * leads)) * 100
  }

  // Calculate prospective metrics
  const newSales = calculateNewSales(leads, targetConversionRate)
  const newCPL = calculateNewCPL(adSpend, leads)
  const newCPA = calculateNewCPA(adSpend, newSales)
  const newRevenue = calculateNewRevenue(newSales, avgRevenuePerSale)

  // Calculate comparison metrics
  const salesIncrease = calculateSalesIncrease(newSales, baseline.sales)
  const revenueIncrease = calculateRevenueIncrease(newRevenue, baseline.revenue)
  const cpaImprovementPercent = calculateCPAImprovement(currentCPA, newCPA)

  const calculatedMetrics: CalculatedMetrics = {
    currentConversionRate,
    currentCPL,
    currentCPA,
    avgRevenuePerSale,
    targetConversionRate,
    newSales,
    newCPL,
    newCPA,
    newRevenue,
    salesIncrease,
    revenueIncrease,
    cpaImprovementPercent,
  }

  // Current metrics only (for display in "Current" column)
  const currentMetricsOnly = {
    currentConversionRate,
    currentCPL,
    currentCPA,
  }

  // Convert to both timeframes
  if (baseline.timePeriod === 'weekly') {
    const monthlyBaseline = convertWeeklyToMonthly(baseline)
    const monthlyProspective = {
      leads,
      sales: newSales,
      adSpend,
      revenue: newRevenue,
    }
    const monthlyProspectiveConverted = convertWeeklyToMonthly(monthlyProspective)

    return {
      inputPeriod: 'weekly',
      weekly: {
        current: {
          ...baseline,
          ...currentMetricsOnly,
        },
        prospective: {
          ...baseline,
          leads,
          sales: newSales,
          adSpend,
          revenue: newRevenue,
          ...calculatedMetrics,
        },
      },
      monthly: {
        current: {
          ...monthlyBaseline,
          timePeriod: 'monthly' as const,
          ...currentMetricsOnly,
        },
        prospective: {
          ...monthlyProspectiveConverted,
          timePeriod: 'monthly' as const,
          ...calculatedMetrics,
        },
      },
    }
  } else {
    // Input is monthly
    const weeklyBaseline = convertMonthlyToWeekly(baseline)
    const weeklyProspective = {
      leads,
      sales: newSales,
      adSpend,
      revenue: newRevenue,
    }
    const weeklyProspectiveConverted = convertMonthlyToWeekly(weeklyProspective)

    return {
      inputPeriod: 'monthly',
      weekly: {
        current: {
          ...weeklyBaseline,
          timePeriod: 'weekly' as const,
          ...currentMetricsOnly,
        },
        prospective: {
          ...weeklyProspectiveConverted,
          timePeriod: 'weekly' as const,
          ...calculatedMetrics,
        },
      },
      monthly: {
        current: {
          ...baseline,
          ...currentMetricsOnly,
        },
        prospective: {
          ...baseline,
          leads,
          sales: newSales,
          adSpend,
          revenue: newRevenue,
          ...calculatedMetrics,
        },
      },
    }
  }
}

// =====================================================
// Platform-Specific Calculations
// =====================================================

export function calculatePlatformROI(revenue: number, adSpend: number): number {
  if (adSpend === 0) return 0
  return (revenue / adSpend) * 100
}

export interface PlatformMetrics {
  platformLeads: number
  platformSales: number
  platformAdSpend: number
  platformRevenue: number
}

export interface CalculatedPlatformMetrics extends PlatformMetrics {
  platformConversionRate: number
  platformCPL: number
  platformCPA: number
  platformROI: number
}

export function calculatePlatformMetrics(metrics: PlatformMetrics): CalculatedPlatformMetrics {
  return {
    ...metrics,
    platformConversionRate: calculateCurrentConversionRate(metrics.platformSales, metrics.platformLeads),
    platformCPL: calculateCurrentCPL(metrics.platformAdSpend, metrics.platformLeads),
    platformCPA: calculateCurrentCPA(metrics.platformAdSpend, metrics.platformSales),
    platformROI: calculatePlatformROI(metrics.platformRevenue, metrics.platformAdSpend),
  }
}

// =====================================================
// Formatting Utilities
// =====================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
