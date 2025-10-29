'use client'

import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations'
import { TrendingUp, Calendar } from 'lucide-react'

interface SavedScenariosProps {
  scenarios: any[]
  onLoadScenario: (scenario: any) => void
}

export default function SavedScenarios({ scenarios, onLoadScenario }: SavedScenariosProps) {
  if (scenarios.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Saved Scenarios</h2>
        <p className="text-neutral-600">
          Click on any scenario name to reload it in the calculator
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <button
                onClick={() => onLoadScenario(scenario)}
                className="text-left flex-1"
              >
                <h3 className="font-semibold text-lg text-brand-primary hover:underline mb-1">
                  {scenario.scenario_name}
                </h3>
              </button>
              <TrendingUp className="h-5 w-5 text-brand-secondary flex-shrink-0 ml-2" />
            </div>

            <div className="flex items-center text-xs text-neutral-500 mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(scenario.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Sales</span>
                <span className="font-semibold text-neutral-900">
                  {formatNumber(scenario.new_sales)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Sales Increase</span>
                <span className="font-semibold text-success-dark">
                  +{formatNumber(scenario.sales_increase)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Revenue</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(scenario.new_revenue)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Revenue Increase</span>
                <span className="font-semibold text-success-dark">
                  +{formatCurrency(scenario.revenue_increase)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-neutral-600">CPA</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(scenario.new_cpa)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mt-1">
                  <span className="text-xs text-neutral-500">Improvement</span>
                  <span className="text-sm font-semibold text-success-dark">
                    {formatPercent(scenario.cpa_improvement_percent, 1)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-neutral-600">Target CR</span>
                <span className="font-semibold text-neutral-900">
                  {formatPercent(scenario.target_conversion_rate, 2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
