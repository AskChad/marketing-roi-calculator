'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BaselineMetrics, TargetScenario } from '@/lib/calculations'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'

const scenarioSchema = z.object({
  scenarioName: z.string().min(1, 'Scenario name is required').max(255),
  targetConversionRate: z.number().min(0.01).max(100, 'Must be between 0.01 and 100'),
  adjustedLeads: z.number().int().positive().optional(),
  adjustedAdSpend: z.number().positive().optional(),
})

type ScenarioFormData = z.infer<typeof scenarioSchema>

interface ProspectiveScenarioFormProps {
  currentMetrics: BaselineMetrics
  onSubmit: (scenario: TargetScenario) => void
}

export default function ProspectiveScenarioForm({
  currentMetrics,
  onSubmit,
}: ProspectiveScenarioFormProps) {
  const [enableAdjustments, setEnableAdjustments] = useState(false)

  const currentCR = ((currentMetrics.sales / currentMetrics.leads) * 100).toFixed(2)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      scenarioName: '',
      targetConversionRate: parseFloat(currentCR) + 1, // Default to +1% improvement
      adjustedLeads: undefined,
      adjustedAdSpend: undefined,
    },
  })

  const handleFormSubmit = (data: ScenarioFormData) => {
    const scenario: TargetScenario = {
      targetConversionRate: data.targetConversionRate,
    }

    if (enableAdjustments) {
      if (data.adjustedLeads) scenario.adjustedLeads = data.adjustedLeads
      if (data.adjustedAdSpend) scenario.adjustedAdSpend = data.adjustedAdSpend
    }

    onSubmit(scenario)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Current CR Display */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="text-sm text-neutral-600 mb-1">Current Conversion Rate</p>
        <p className="text-2xl font-bold text-neutral-900">{currentCR}%</p>
        <p className="text-xs text-neutral-500 mt-1">
          {currentMetrics.sales.toLocaleString()} sales ÷ {currentMetrics.leads.toLocaleString()} leads
        </p>
      </div>

      {/* Scenario Name */}
      <div>
        <label htmlFor="scenarioName" className="block text-sm font-medium text-neutral-700 mb-2">
          Scenario Name
        </label>
        <input
          type="text"
          id="scenarioName"
          {...register('scenarioName')}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
          placeholder="e.g., Q1 2025 Goals"
        />
        {errors.scenarioName && (
          <p className="mt-1 text-sm text-danger">{errors.scenarioName.message}</p>
        )}
      </div>

      {/* Target Conversion Rate */}
      <div>
        <label htmlFor="targetConversionRate" className="block text-sm font-medium text-neutral-700 mb-2">
          Target Conversion Rate (%)
        </label>
        <input
          type="number"
          step="0.01"
          id="targetConversionRate"
          {...register('targetConversionRate', { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
          placeholder={(parseFloat(currentCR) + 1).toFixed(2)}
        />
        {errors.targetConversionRate && (
          <p className="mt-1 text-sm text-danger">{errors.targetConversionRate.message}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          Increase from {currentCR}% to see potential improvements
        </p>
      </div>

      {/* Optional Adjustments Toggle */}
      <div className="border-t border-neutral-200 pt-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enableAdjustments}
            onChange={(e) => setEnableAdjustments(e.target.checked)}
            className="w-4 h-4 text-brand-secondary border-neutral-300 rounded focus:ring-brand-secondary"
          />
          <span className="text-sm font-medium text-neutral-700">
            Add Optional Adjustments
          </span>
        </label>
        <p className="text-xs text-neutral-500 ml-6">
          Adjust leads or ad spend for more complex scenarios
        </p>
      </div>

      {/* Optional Adjustments */}
      {enableAdjustments && (
        <div className="space-y-4 p-4 bg-brand-secondary/5 border border-brand-secondary/20 rounded-lg">
          <div>
            <label htmlFor="adjustedLeads" className="block text-sm font-medium text-neutral-700 mb-2">
              Adjusted Number of Leads (Optional)
            </label>
            <input
              type="number"
              id="adjustedLeads"
              {...register('adjustedLeads', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
              placeholder={currentMetrics.leads.toString()}
            />
            {errors.adjustedLeads && (
              <p className="mt-1 text-sm text-danger">{errors.adjustedLeads.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="adjustedAdSpend" className="block text-sm font-medium text-neutral-700 mb-2">
              Adjusted Ad Spend ($) (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              id="adjustedAdSpend"
              {...register('adjustedAdSpend', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
              placeholder={currentMetrics.adSpend.toString()}
            />
            {errors.adjustedAdSpend && (
              <p className="mt-1 text-sm text-danger">{errors.adjustedAdSpend.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center"
      >
        <TrendingUp className="mr-2 h-5 w-5" />
        Calculate Scenario
      </button>
    </form>
  )
}
