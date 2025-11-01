'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react'

// Schema for Step 1 (Current Marketing ROI)
const currentROISchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  time_period: z.enum(['weekly', 'monthly']),
  current_leads: z.number().int().positive('Must be a positive number'),
  current_sales: z.number().int().nonnegative('Must be 0 or greater'),
  current_ad_spend: z.number().positive('Must be a positive number'),
  current_revenue: z.number().nonnegative('Must be 0 or greater'),
})

// Schema for Step 2 (Prospective Scenario)
const scenarioSchema = z.object({
  scenario_name: z.string().min(1, 'Scenario name is required'),
  target_conversion_rate: z.number().positive('Must be a positive number'),
  adjusted_leads: z.number().int().optional().nullable(),
  adjusted_ad_spend: z.number().optional().nullable(),
})

type CurrentROIFormData = z.infer<typeof currentROISchema>
type ScenarioFormData = z.infer<typeof scenarioSchema>

interface DemoROICalculatorProps {
  userId: string
  existingDemos: any[]
  onDemoSaved?: (demo: any) => void
}

export default function DemoROICalculator({ userId, existingDemos, onDemoSaved }: DemoROICalculatorProps) {
  const [currentMetrics, setCurrentMetrics] = useState<CurrentROIFormData | null>(null)
  const [prospectiveMetrics, setProspectiveMetrics] = useState<any>(null)
  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [enableAdjustments, setEnableAdjustments] = useState(false)

  // Form for Step 1
  const currentForm = useForm<CurrentROIFormData>({
    resolver: zodResolver(currentROISchema),
    defaultValues: {
      time_period: 'monthly',
    },
  })

  // Form for Step 2
  const scenarioForm = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      target_conversion_rate: 5,
    },
  })

  const timePeriod = currentForm.watch('time_period')
  const companyName = currentForm.watch('company_name')

  // Auto-generate scenario name
  const generateScenarioName = (company: string) => {
    if (!company) return ''

    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const year = today.getFullYear()
    const dateStr = `${month}/${day}/${year}`

    const companyDemos = existingDemos.filter(demo =>
      demo.company_name.toLowerCase() === company.toLowerCase()
    )
    const version = companyDemos.length + 1

    return `${company} - ${dateStr} - ${version}`
  }

  // Update scenario name when company name changes
  React.useEffect(() => {
    if (companyName && currentMetrics) {
      const autoName = generateScenarioName(companyName)
      scenarioForm.setValue('scenario_name', autoName)
    }
  }, [companyName, currentMetrics])

  const handleStep1Submit = (data: CurrentROIFormData) => {
    setCurrentMetrics(data)
    setShowScenarioForm(true)

    // Auto-generate scenario name
    const autoName = generateScenarioName(data.company_name)
    scenarioForm.setValue('scenario_name', autoName)
  }

  const handleStep2Submit = async (data: ScenarioFormData) => {
    if (!currentMetrics) return

    try {
      setIsSaving(true)
      setShowSuccess(false)

      // Calculate metrics
      const currentConversionRate = (currentMetrics.current_sales / currentMetrics.current_leads) * 100
      const currentCPL = currentMetrics.current_ad_spend / currentMetrics.current_leads
      const currentCPA = currentMetrics.current_ad_spend / currentMetrics.current_sales
      const avgRevenuePerSale = currentMetrics.current_revenue / currentMetrics.current_sales

      const adjustedLeads = data.adjusted_leads || currentMetrics.current_leads
      const adjustedAdSpend = data.adjusted_ad_spend || currentMetrics.current_ad_spend

      const newSales = Math.round((adjustedLeads * data.target_conversion_rate) / 100)
      const newCPL = adjustedAdSpend / adjustedLeads
      const newCPA = adjustedAdSpend / newSales
      const newRevenue = newSales * avgRevenuePerSale

      const salesIncrease = newSales - currentMetrics.current_sales
      const revenueIncrease = newRevenue - currentMetrics.current_revenue
      const cpaImprovementPercent = ((currentCPA - newCPA) / currentCPA) * 100

      // Store prospective metrics for display
      setProspectiveMetrics({
        leads: adjustedLeads,
        sales: newSales,
        adSpend: adjustedAdSpend,
        revenue: newRevenue,
        conversionRate: data.target_conversion_rate,
        cpl: newCPL,
        cpa: newCPA,
      })

      const calculatedData = {
        company_name: currentMetrics.company_name,
        scenario_name: data.scenario_name,
        time_period: currentMetrics.time_period,
        current_leads: currentMetrics.current_leads,
        current_sales: currentMetrics.current_sales,
        current_ad_spend: currentMetrics.current_ad_spend,
        current_revenue: currentMetrics.current_revenue,
        current_conversion_rate: currentConversionRate,
        current_cpl: currentCPL,
        current_cpa: currentCPA,
        avg_revenue_per_sale: avgRevenuePerSale,
        target_conversion_rate: data.target_conversion_rate,
        adjusted_leads: data.adjusted_leads || null,
        adjusted_ad_spend: data.adjusted_ad_spend || null,
        new_sales: newSales,
        new_cpl: newCPL,
        new_cpa: newCPA,
        new_revenue: newRevenue,
        sales_increase: salesIncrease,
        revenue_increase: revenueIncrease,
        cpa_improvement_percent: cpaImprovementPercent,
      }

      // Save to API
      const response = await fetch('/api/admin/demo-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatedData),
      })

      if (response.ok) {
        const { demo } = await response.json()
        setShowSuccess(true)
        if (onDemoSaved) {
          onDemoSaved(demo)
        }

        // Only reset Step 2 form, keep Step 1 data
        setEnableAdjustments(false)
        scenarioForm.reset({ target_conversion_rate: 5 })

        // Generate new scenario name for next scenario
        const autoName = generateScenarioName(currentMetrics.company_name)
        scenarioForm.setValue('scenario_name', autoName)

        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const error = await response.json()
        alert('Failed to save demo: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save demo scenario')
    } finally {
      setIsSaving(false)
    }
  }

  const formatNumber = (num: number): string => {
    const absNum = Math.abs(num)
    if (absNum >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M'
    } else if (absNum >= 10000) {
      return '$' + (num / 1000).toFixed(1) + 'k'
    } else if (absNum >= 1000) {
      return '$' + Math.round(num).toLocaleString()
    } else {
      return '$' + num.toFixed(2)
    }
  }

  return (
    <div className="w-full">
      {showSuccess && (
        <div className="bg-success/10 border border-success rounded-lg p-4 text-success-dark mb-6">
          ✓ Demo scenario saved successfully!
        </div>
      )}

      {/* Three-Column Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Current Marketing ROI (Step 1) */}
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

          <form onSubmit={currentForm.handleSubmit(handleStep1Submit)} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Name *
              </label>
              <input
                {...currentForm.register('company_name')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="Acme Corp"
              />
              {currentForm.formState.errors.company_name && (
                <p className="text-error text-sm mt-1">{currentForm.formState.errors.company_name.message}</p>
              )}
            </div>

            {/* Time Period Toggle */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                  timePeriod === 'weekly'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}>
                  <input
                    type="radio"
                    value="weekly"
                    {...currentForm.register('time_period')}
                    className="sr-only"
                  />
                  <span className="font-medium">Weekly</span>
                </label>
                <label className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                  timePeriod === 'monthly'
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                    : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}>
                  <input
                    type="radio"
                    value="monthly"
                    {...currentForm.register('time_period')}
                    className="sr-only"
                  />
                  <span className="font-medium">Monthly</span>
                </label>
              </div>
            </div>

            {/* Number of Leads */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Number of Leads
              </label>
              <input
                {...currentForm.register('current_leads', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="100"
              />
              {currentForm.formState.errors.current_leads && (
                <p className="text-error text-sm mt-1">{currentForm.formState.errors.current_leads.message}</p>
              )}
            </div>

            {/* Number of Sales */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Number of Sales
              </label>
              <input
                {...currentForm.register('current_sales', { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="10"
              />
              {currentForm.formState.errors.current_sales && (
                <p className="text-error text-sm mt-1">{currentForm.formState.errors.current_sales.message}</p>
              )}
            </div>

            {/* Total Ad Spend */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Total Ad Spend ($)
              </label>
              <input
                {...currentForm.register('current_ad_spend', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="5000"
              />
              {currentForm.formState.errors.current_ad_spend && (
                <p className="text-error text-sm mt-1">{currentForm.formState.errors.current_ad_spend.message}</p>
              )}
            </div>

            {/* Total Revenue */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Total Revenue ($)
              </label>
              <input
                {...currentForm.register('current_revenue', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="20000"
              />
              {currentForm.formState.errors.current_revenue && (
                <p className="text-error text-sm mt-1">{currentForm.formState.errors.current_revenue.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Current Metrics
            </button>
          </form>
        </div>

        {/* MIDDLE: Prospective Scenario (Step 2) */}
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
            <form onSubmit={scenarioForm.handleSubmit(handleStep2Submit)} className="space-y-6">
              {/* Current Metrics Display */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-600 mb-1">Current CR</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {((currentMetrics.current_sales / currentMetrics.current_leads) * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-600 mb-1">Current CPL</p>
                  <p className="text-lg font-bold text-neutral-900">
                    ${(currentMetrics.current_ad_spend / currentMetrics.current_leads).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-600 mb-1">Current CPA</p>
                  <p className="text-lg font-bold text-neutral-900">
                    ${(currentMetrics.current_ad_spend / currentMetrics.current_sales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-600 mb-1">Current Revenue</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {formatNumber(currentMetrics.current_revenue)}
                  </p>
                </div>
              </div>

              {/* Scenario Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Scenario Name *
                </label>
                <input
                  {...scenarioForm.register('scenario_name')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition bg-neutral-50"
                  placeholder="Auto-generated"
                  readOnly
                />
                {scenarioForm.formState.errors.scenario_name && (
                  <p className="text-error text-sm mt-1">{scenarioForm.formState.errors.scenario_name.message}</p>
                )}
              </div>

              {/* Target Conversion Rate */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Target Conversion Rate (%)
                </label>
                <input
                  {...scenarioForm.register('target_conversion_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
                  placeholder="15"
                />
                {scenarioForm.formState.errors.target_conversion_rate && (
                  <p className="text-error text-sm mt-1">{scenarioForm.formState.errors.target_conversion_rate.message}</p>
                )}
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
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Adjusted Number of Leads (Optional)
                    </label>
                    <input
                      {...scenarioForm.register('adjusted_leads', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
                      placeholder={currentMetrics.current_leads.toString()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Adjusted Ad Spend ($) (Optional)
                    </label>
                    <input
                      {...scenarioForm.register('adjusted_ad_spend', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none transition"
                      placeholder={currentMetrics.current_ad_spend.toString()}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center disabled:opacity-50"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                {isSaving ? 'Saving Demo...' : 'Calculate & Save Demo'}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center h-64 text-neutral-400">
              <ArrowRight className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* RIGHT: Results Column */}
        <div className="space-y-6">
          {currentMetrics && (
            <>
              {/* Current Metrics (Gray) */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-900 mb-4">Current Metrics</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Number of Leads</p>
                    <p className="text-lg font-bold text-neutral-900">{currentMetrics.current_leads}</p>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Number of Sales</p>
                    <p className="text-lg font-bold text-neutral-900">{currentMetrics.current_sales}</p>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Total Ad Spend</p>
                    <p className="text-lg font-bold text-neutral-900">{formatNumber(currentMetrics.current_ad_spend)}</p>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-lg">
                    <p className="text-xs text-neutral-600 mb-1">Total Revenue</p>
                    <p className="text-lg font-bold text-neutral-900">{formatNumber(currentMetrics.current_revenue)}</p>
                  </div>
                  <div className="p-3 bg-neutral-100 rounded-lg border-2 border-neutral-300">
                    <p className="text-xs text-neutral-600 mb-1">Close Ratio (CR)</p>
                    <p className="text-lg font-bold text-neutral-900">
                      {((currentMetrics.current_sales / currentMetrics.current_leads) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Prospective Metrics (Green) */}
              {prospectiveMetrics && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-success">
                  <h3 className="text-lg font-bold text-success-dark mb-4">Prospective Metrics</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-success-dark mb-1">Number of Leads</p>
                      <p className="text-lg font-bold text-success-dark">{prospectiveMetrics.leads}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-success-dark mb-1">Number of Sales</p>
                      <p className="text-lg font-bold text-success-dark">{prospectiveMetrics.sales}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-success-dark mb-1">Total Ad Spend</p>
                      <p className="text-lg font-bold text-success-dark">{formatNumber(prospectiveMetrics.adSpend)}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-xs text-success-dark mb-1">Total Revenue</p>
                      <p className="text-lg font-bold text-success-dark">{formatNumber(prospectiveMetrics.revenue)}</p>
                    </div>
                    <div className="p-3 bg-success/10 rounded-lg border-2 border-success">
                      <p className="text-xs text-success-dark mb-1">Close Ratio (CR)</p>
                      <p className="text-lg font-bold text-success-dark">
                        {prospectiveMetrics.conversionRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
