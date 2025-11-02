'use client'

import { useState } from 'react'
import { TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import DemoROICalculator from './DemoROICalculator'

interface DemoCalculatorContentProps {
  userId: string
  existingDemos: any[]
}

export default function DemoCalculatorContent({ userId, existingDemos: initialDemos }: DemoCalculatorContentProps) {
  // Only show scenarios from current session (not from initialDemos)
  const [savedDemos, setSavedDemos] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDemoSaved = (newDemo: any) => {
    // Add new demo to the top of the list
    setSavedDemos([newDemo, ...savedDemos])
    setRefreshKey(prev => prev + 1)
  }

  const handleClearScenarios = () => {
    setSavedDemos([])
  }

  return (
    <div className="space-y-8">
      {/* Calculator - Full Width */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
        <DemoROICalculator
          userId={userId}
          existingDemos={savedDemos}
          onDemoSaved={handleDemoSaved}
        />
      </div>

      {/* Saved Demo Scenarios */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-neutral-900">My Scenarios</h2>
            {savedDemos.length > 0 && (
              <Link
                href="/roi-analytics"
                className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                This one takes to MY ROI analytics
              </Link>
            )}
          </div>
          {savedDemos.length > 0 && (
            <button
              onClick={handleClearScenarios}
              className="px-4 py-2 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-900 text-sm font-medium rounded-lg transition"
            >
              Clear Scenarios
            </button>
          )}
        </div>

        {savedDemos.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No scenarios yet
            </h3>
            <p className="text-neutral-600">
              Use the calculator above to create your first ROI scenario
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedDemos.map((demo) => (
              <DemoScenarioCard key={demo.id} scenario={demo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DemoScenarioCard({ scenario }: { scenario: any }) {
  // Format date consistently to avoid hydration errors
  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    return `${month} ${day}, ${year}`
  }

  const formatNumber = (num: number): string => {
    const absNum = Math.abs(num)
    if (absNum >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M'
    } else if (absNum >= 10000) {
      return '$' + Math.round(num / 1000) + 'k'
    } else if (absNum >= 1000) {
      return '$' + Math.round(num).toLocaleString()
    } else {
      return '$' + num.toFixed(2)
    }
  }

  return (
    <Link href={`/scenario/${scenario.id}`}>
      <div className="border border-neutral-200 rounded-lg p-6 hover:shadow-md hover:border-brand-primary transition cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-neutral-900 text-lg mb-1 hover:text-brand-primary transition">
              {scenario.company_name}
            </h4>
            <p className="text-sm text-neutral-600 mb-1">{scenario.scenario_name}</p>
            <p className="text-sm text-neutral-500">
              {formatLongDate(scenario.created_at)}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-brand-primary" />
        </div>

      <div className="grid grid-cols-7 gap-3 mb-4">
        <div>
          <p className="text-xs text-neutral-600 mb-1">Leads</p>
          <p className="font-semibold text-neutral-900">{scenario.current_leads.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Sales</p>
          <p className="font-semibold text-neutral-900">{scenario.new_sales.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Ad Spend</p>
          <p className="font-semibold text-neutral-900">{formatNumber(scenario.current_ad_spend)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Revenue</p>
          <p className="font-semibold text-neutral-900">{formatNumber(scenario.new_revenue)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">CR %</p>
          <p className="font-semibold text-neutral-900">{scenario.target_conversion_rate.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">CPL $</p>
          <p className="font-semibold text-neutral-900">{scenario.new_cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">CPA $</p>
          <p className="font-semibold text-neutral-900">{scenario.new_cpa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
        <div>
          <p className="text-xs text-neutral-600 mb-1">Sales Increase</p>
          <p className="font-semibold text-success-dark">
            +{scenario.sales_increase}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Revenue Increase</p>
          <p className="font-semibold text-success-dark">
            +{formatNumber(scenario.revenue_increase)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">CPA Improvement</p>
          <p className="font-semibold text-success-dark">
            {scenario.cpa_improvement_percent.toFixed(1)}%
          </p>
        </div>
      </div>
      </div>
    </Link>
  )
}
