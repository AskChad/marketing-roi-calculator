'use client'

import { useState } from 'react'
import { BaselineMetrics, DualTimeframeResult, formatCurrency, formatPercent, formatNumber } from '@/lib/calculations'
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, Target, RefreshCw, Save } from 'lucide-react'

interface ResultsDisplayProps {
  results: DualTimeframeResult
  currentMetrics: BaselineMetrics
  onReset: () => void
  initialScenarioName?: string
}

export default function ResultsDisplay({ results, currentMetrics, onReset, initialScenarioName = '' }: ResultsDisplayProps) {
  const { weekly, monthly, inputPeriod } = results

  // Use the input period as primary display
  const primary = inputPeriod === 'weekly' ? weekly : monthly
  const secondary = inputPeriod === 'weekly' ? monthly : weekly

  const [scenarioName, setScenarioName] = useState(initialScenarioName)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) {
      setSaveError('Please enter a scenario name')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioName: scenarioName.trim(),
          targetConversionRate: primary.prospective.targetConversionRate,
          adjustedLeads: primary.prospective.leads !== currentMetrics.leads ? primary.prospective.leads : null,
          adjustedAdSpend: primary.prospective.adSpend !== currentMetrics.adSpend ? primary.prospective.adSpend : null,
          newSales: primary.prospective.newSales,
          newCPL: primary.prospective.newCPL,
          newCPA: primary.prospective.newCPA,
          newRevenue: primary.prospective.newRevenue,
          salesIncrease: primary.prospective.salesIncrease,
          revenueIncrease: primary.prospective.revenueIncrease,
          cpaImprovementPercent: primary.prospective.cpaImprovementPercent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save scenario')
      }

      setSaveSuccess(true)
      setShowSaveForm(false)
      setScenarioName('')

      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error saving scenario:', error)
      setSaveError(error.message || 'Failed to save scenario')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your ROI Analysis</h2>
          <p className="text-neutral-600">
            Results shown in both weekly and monthly timeframes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <div className="px-4 py-2 bg-success-light text-success-dark rounded-lg font-medium">
              ✓ Saved!
            </div>
          )}
          <button
            onClick={() => setShowSaveForm(true)}
            className="flex items-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success-dark transition font-medium"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Scenario
          </button>
          <button
            onClick={onReset}
            className="flex items-center px-4 py-2 text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            New Calculation
          </button>
        </div>
      </div>

      {/* Save Scenario Modal */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Save Scenario</h3>
            <p className="text-neutral-600 mb-6">
              Give your scenario a name to save it for later reference
            </p>

            <div className="mb-6">
              <label htmlFor="scenarioName" className="block text-sm font-medium text-neutral-700 mb-2">
                Scenario Name
              </label>
              <input
                type="text"
                id="scenarioName"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g., Q1 2025 Growth Plan"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                disabled={isSaving}
              />
              {saveError && (
                <p className="mt-2 text-sm text-red-600">{saveError}</p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveScenario}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowSaveForm(false)
                  setSaveError('')
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>

            <p className="mt-4 text-xs text-neutral-500 text-center">
              You must be logged in to save scenarios.{' '}
              <a href="/login" className="text-brand-primary hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      )}

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
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border border-brand-primary rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <Target className="h-8 w-8 text-brand-primary" />
            <ArrowDown className="h-6 w-6 text-success-dark" />
          </div>
          <p className="text-sm text-neutral-600 mb-1">CPA Improvement</p>
          <p className="text-3xl font-bold text-neutral-900 mb-1">
            {formatPercent(primary.prospective.cpaImprovementPercent, 1)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCurrency(primary.prospective.currentCPA)} → {formatCurrency(primary.prospective.newCPA)}
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
  const rows = [
    {
      metric: 'Leads',
      current: formatNumber(current.leads),
      improved: formatNumber(prospective.leads),
      change: null,
    },
    {
      metric: 'Sales',
      current: formatNumber(current.sales),
      improved: formatNumber(prospective.newSales),
      change: `+${formatNumber(prospective.salesIncrease)}`,
      positive: true,
    },
    {
      metric: 'Conversion Rate',
      current: formatPercent(current.currentConversionRate, 2),
      improved: formatPercent(prospective.targetConversionRate, 2),
      change: `+${formatPercent(prospective.targetConversionRate - current.currentConversionRate, 2)}`,
      positive: true,
    },
    {
      metric: 'CPL',
      current: formatCurrency(current.currentCPL),
      improved: formatCurrency(prospective.newCPL),
      change: null,
    },
    {
      metric: 'CPA',
      current: formatCurrency(current.currentCPA),
      improved: formatCurrency(prospective.newCPA),
      change: `-${formatPercent(prospective.cpaImprovementPercent, 1)}`,
      positive: true,
    },
    {
      metric: 'Revenue',
      current: formatCurrency(current.revenue),
      improved: formatCurrency(prospective.newRevenue),
      change: `+${formatCurrency(prospective.revenueIncrease)}`,
      positive: true,
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
                  <span className={row.positive ? 'text-success-dark font-semibold' : 'text-neutral-600'}>
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
