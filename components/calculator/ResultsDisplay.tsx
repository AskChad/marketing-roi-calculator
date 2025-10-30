'use client'

import { BaselineMetrics, DualTimeframeResult, formatCurrency, formatPercent, formatNumber } from '@/lib/calculations'
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, Target, RefreshCw, TrendingDown } from 'lucide-react'

// Helper to determine if a metric change is positive (good) or negative (bad)
function getMetricImpact(metricType: 'decrease-good' | 'increase-good', change: number) {
  const isIncrease = change > 0
  const isDecrease = change < 0

  if (metricType === 'decrease-good') {
    // For CPA, CPL, Spend: decrease = good (green), increase = bad (red)
    return {
      isPositive: isDecrease,
      color: isDecrease ? 'text-success-dark' : 'text-error',
      bgColor: isDecrease ? 'bg-success/10 border-success' : 'bg-error/10 border-error',
      Icon: isDecrease ? TrendingDown : ArrowUp,
    }
  } else {
    // For Leads, Revenue, Sales: increase = good (green), decrease = bad (red)
    return {
      isPositive: isIncrease,
      color: isIncrease ? 'text-success-dark' : 'text-error',
      bgColor: isIncrease ? 'bg-success/10 border-success' : 'bg-error/10 border-error',
      Icon: isIncrease ? ArrowUp : ArrowDown,
    }
  }
}

interface ResultsDisplayProps {
  results: DualTimeframeResult
  currentMetrics: BaselineMetrics
  onReset: () => void
  initialScenarioName?: string
  onScenarioSaved?: () => void
}

export default function ResultsDisplay({ results, currentMetrics, onReset, initialScenarioName = '', onScenarioSaved }: ResultsDisplayProps) {
  const { weekly, monthly, inputPeriod } = results

  // Use the input period as primary display
  const primary = inputPeriod === 'weekly' ? weekly : monthly
  const secondary = inputPeriod === 'weekly' ? monthly : weekly

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your ROI Analysis</h2>
          <p className="text-neutral-600">
            {initialScenarioName && (
              <span className="font-medium text-brand-primary">{initialScenarioName} - </span>
            )}
            Results shown in both weekly and monthly timeframes
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center px-4 py-2 text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition font-medium"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Calculation
        </button>
      </div>

      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sales Increase */}
        <div className="bg-gradient-to-br from-success-light/20 to-success/10 border border-success rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="h-8 w-8 text-success-dark" />
            <ArrowUp className="h-6 w-6 text-success-dark" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Sales Increase</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1">
            +{formatNumber(primary.prospective.salesIncrease)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatPercent((primary.prospective.salesIncrease / currentMetrics.sales) * 100, 1)} growth per {inputPeriod === 'weekly' ? 'week' : 'month'}
          </p>
        </div>

        {/* Revenue Increase */}
        <div className="bg-gradient-to-br from-success-light/20 to-success/10 border border-success rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="h-8 w-8 text-success-dark" />
            <ArrowUp className="h-6 w-6 text-success-dark" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">Revenue Increase</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1">
            +{formatCurrency(primary.prospective.revenueIncrease)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatPercent((primary.prospective.revenueIncrease / currentMetrics.revenue) * 100, 1)} growth per {inputPeriod === 'weekly' ? 'week' : 'month'}
          </p>
        </div>

        {/* CPA Improvement */}
        <div className="bg-gradient-to-br from-success-light/20 to-success/10 border border-success rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <Target className="h-8 w-8 text-success-dark" />
            <TrendingDown className="h-6 w-6 text-success-dark" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">CPA Reduction</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1">
            -{formatCurrency(primary.prospective.currentCPA - primary.prospective.newCPA)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCurrency(primary.prospective.currentCPA)} → {formatCurrency(primary.prospective.newCPA)} <span className="text-success-dark font-medium">({formatPercent(primary.prospective.cpaImprovementPercent, 1)} ↓)</span>
          </p>
        </div>
      </div>

      {/* Dual Timeframe Comparison Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Weekly Results</h3>
            {inputPeriod === 'weekly' && (
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                Input Period
              </span>
            )}
          </div>
          <ComparisonTable
            current={weekly.current}
            prospective={weekly.prospective}
            period="weekly"
          />
        </div>

        {/* Monthly Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Monthly Results</h3>
            {inputPeriod === 'monthly' && (
              <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                Input Period
              </span>
            )}
          </div>
          <ComparisonTable
            current={monthly.current}
            prospective={monthly.prospective}
            period="monthly"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-3">Ready to Save This Scenario?</h3>
        <p className="mb-6 text-white/90">
          Create a free account to save unlimited scenarios, compare performance, and access AI-powered insights
        </p>
        <div className="flex items-center justify-center space-x-4">
          <a
            href="/register"
            className="px-6 py-3 bg-white text-brand-primary rounded-lg hover:bg-neutral-100 transition font-medium"
          >
            Create Free Account
          </a>
          <a
            href="/login"
            className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg hover:bg-white/20 transition font-medium"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  )
}

interface ComparisonTableProps {
  current: any
  prospective: any
  period: 'weekly' | 'monthly'
}

function ComparisonTable({ current, prospective, period }: ComparisonTableProps) {
  const cplChange = prospective.newCPL - current.currentCPL
  const cpaChange = prospective.newCPA - current.currentCPA
  const cpaPercent = Math.abs((cpaChange / current.currentCPA) * 100)
  const cplPercent = Math.abs((cplChange / current.currentCPL) * 100)
  const leadsChange = prospective.leads - current.leads
  const conversionChange = prospective.targetConversionRate - current.currentConversionRate

  const rows = [
    {
      metric: 'Leads',
      current: formatNumber(current.leads),
      improved: formatNumber(prospective.leads),
      change: leadsChange > 0 ? `+${formatNumber(leadsChange)}` : formatNumber(leadsChange),
      positive: leadsChange > 0,
      arrow: leadsChange > 0 ? '↑' : leadsChange < 0 ? '↓' : '',
    },
    {
      metric: 'Sales',
      current: formatNumber(current.sales),
      improved: formatNumber(prospective.newSales),
      change: `+${formatNumber(prospective.salesIncrease)}`,
      positive: true,
      arrow: '↑',
    },
    {
      metric: 'Conversion Rate',
      current: formatPercent(current.currentConversionRate, 2),
      improved: formatPercent(prospective.targetConversionRate, 2),
      change: conversionChange > 0 ? `+${formatPercent(conversionChange, 2)}` : formatPercent(conversionChange, 2),
      positive: conversionChange > 0,
      arrow: conversionChange > 0 ? '↑' : '↓',
    },
    {
      metric: 'CPL',
      current: formatCurrency(current.currentCPL),
      improved: formatCurrency(prospective.newCPL),
      change: cplChange < 0 ?
        `-${formatCurrency(Math.abs(cplChange))} (${formatPercent(cplPercent, 1)} ↓)` :
        `+${formatCurrency(cplChange)} (${formatPercent(cplPercent, 1)} ↑)`,
      positive: cplChange < 0,
      arrow: cplChange < 0 ? '↓' : '↑',
    },
    {
      metric: 'CPA',
      current: formatCurrency(current.currentCPA),
      improved: formatCurrency(prospective.newCPA),
      change: `-${formatCurrency(Math.abs(cpaChange))} (${formatPercent(cpaPercent, 1)} ↓)`,
      positive: true,
      arrow: '↓',
    },
    {
      metric: 'Revenue',
      current: formatCurrency(current.revenue),
      improved: formatCurrency(prospective.newRevenue),
      change: `+${formatCurrency(prospective.revenueIncrease)}`,
      positive: true,
      arrow: '↑',
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider pb-3">
              Metric
            </th>
            <th className="text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider pb-3">
              Current
            </th>
            <th className="text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider pb-3">
              Improved
            </th>
            <th className="text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider pb-3">
              Change
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="py-3 text-sm font-medium text-neutral-900">{row.metric}</td>
              <td className="py-3 text-sm text-neutral-700 text-right font-mono">{row.current}</td>
              <td className="py-3 text-sm text-neutral-900 text-right font-mono font-semibold">
                {row.improved}
              </td>
              <td className="py-3 text-sm text-right font-mono">
                {row.change ? (
                  <span className={row.positive ? 'text-success-dark font-semibold' : 'text-error font-semibold'}>
                    {row.change}
                  </span>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
