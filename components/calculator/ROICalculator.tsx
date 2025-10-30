'use client'

import { useState } from 'react'
import CurrentROIForm from './CurrentROIForm'
import ProspectiveScenarioForm from './ProspectiveScenarioForm'
import ResultsDisplay from './ResultsDisplay'
import { BaselineMetrics, TargetScenario, DualTimeframeResult } from '@/lib/calculations'
import { ArrowRight } from 'lucide-react'

interface ROICalculatorProps {
  userId?: string
  onScenarioSaved?: () => void
}

export default function ROICalculator({ userId, onScenarioSaved }: ROICalculatorProps) {
  const [currentMetrics, setCurrentMetrics] = useState<BaselineMetrics | null>(null)
  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [results, setResults] = useState<DualTimeframeResult | null>(null)
  const [scenarioName, setScenarioName] = useState<string>('')

  const handleCurrentMetricsSubmit = (metrics: BaselineMetrics) => {
    setCurrentMetrics(metrics)
    setShowScenarioForm(true)
  }

  const handleScenarioSubmit = async (scenario: TargetScenario) => {
    if (!currentMetrics) return

    // Generate automatic scenario name if not provided
    const autoScenarioName = scenario.scenarioName || `Scenario ${new Date().toLocaleString()}`
    setScenarioName(autoScenarioName)

    // Import calculation function dynamically to avoid client-side issues
    const { calculateDualTimeframeROI } = await import('@/lib/calculations')
    const calculatedResults = calculateDualTimeframeROI(currentMetrics, scenario)
    setResults(calculatedResults)

    // Auto-save for logged-in users
    if (userId) {
      try {
        const primary = currentMetrics.timePeriod === 'weekly' ? calculatedResults.weekly : calculatedResults.monthly

        const response = await fetch('/api/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenarioName: autoScenarioName,
            baselineMetrics: currentMetrics,
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

        if (response.ok && onScenarioSaved) {
          onScenarioSaved()
        }
      } catch (error) {
        console.error('Auto-save error (non-fatal):', error)
      }
    }
  }

  const handleReset = () => {
    setCurrentMetrics(null)
    setShowScenarioForm(false)
    setResults(null)
    setScenarioName('')
  }

  return (
    <div className="w-full">
      {!results ? (
        <div>
          {/* Two-Input Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Current ROI Input */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Current Marketing ROI
                </h2>
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-full">
                  Step 1
                </span>
              </div>
              <p className="text-neutral-600 mb-6">
                Enter your current marketing metrics to establish a baseline
              </p>
              <CurrentROIForm
                onSubmit={handleCurrentMetricsSubmit}
                initialData={currentMetrics}
              />
            </div>

            {/* RIGHT: Prospective Scenario */}
            <div className={`bg-white rounded-2xl shadow-lg p-8 border border-neutral-200 transition-opacity ${
              showScenarioForm ? 'opacity-100' : 'opacity-50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Prospective Scenario
                </h2>
                <span className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-sm font-medium rounded-full">
                  Step 2
                </span>
              </div>
              <p className="text-neutral-600 mb-6">
                {showScenarioForm
                  ? 'Model a "what-if" scenario to see potential improvements'
                  : 'Complete Step 1 to unlock scenario modeling'}
              </p>
              {showScenarioForm && currentMetrics ? (
                <ProspectiveScenarioForm
                  currentMetrics={currentMetrics}
                  onSubmit={handleScenarioSubmit}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-neutral-400">
                  <ArrowRight className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ResultsDisplay
          results={results}
          currentMetrics={currentMetrics!}
          onReset={handleReset}
          initialScenarioName={scenarioName}
          onScenarioSaved={onScenarioSaved}
        />
      )}
    </div>
  )
}
