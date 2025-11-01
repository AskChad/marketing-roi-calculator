'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'

const demoFormSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  scenario_name: z.string().min(1, 'Scenario name is required'),
  time_period: z.enum(['weekly', 'monthly']),
  current_leads: z.number().int().positive('Must be a positive number'),
  current_sales: z.number().int().nonnegative('Must be 0 or greater'),
  current_ad_spend: z.number().positive('Must be a positive number'),
  current_revenue: z.number().nonnegative('Must be 0 or greater'),
  target_conversion_rate: z.number().positive('Must be a positive number'),
  adjusted_leads: z.number().int().optional().nullable(),
  adjusted_ad_spend: z.number().optional().nullable(),
})

type DemoFormData = z.infer<typeof demoFormSchema>

interface DemoROICalculatorProps {
  userId: string
  existingDemos: any[]
  onDemoSaved?: (demo: any) => void
}

export default function DemoROICalculator({ userId, existingDemos, onDemoSaved }: DemoROICalculatorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      time_period: 'monthly',
      target_conversion_rate: 5,
    },
  })

  const timePeriod = watch('time_period')
  const companyName = watch('company_name')

  // Auto-generate scenario name when company name changes
  const generateScenarioName = (company: string) => {
    if (!company) return ''

    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const year = today.getFullYear()
    const dateStr = `${month}/${day}/${year}`

    // Count existing demos for this company to get version number
    const companyDemos = existingDemos.filter(demo =>
      demo.company_name.toLowerCase() === company.toLowerCase()
    )
    const version = companyDemos.length + 1

    return `${company} - ${dateStr} - ${version}`
  }

  // Update scenario name when company name changes
  React.useEffect(() => {
    if (companyName) {
      const autoName = generateScenarioName(companyName)
      setValue('scenario_name', autoName)
    }
  }, [companyName, setValue])

  const onSubmit = async (data: DemoFormData) => {
    try {
      setIsSaving(true)
      setShowSuccess(false)

      // Calculate metrics
      const currentConversionRate = (data.current_sales / data.current_leads) * 100
      const currentCPL = data.current_ad_spend / data.current_leads
      const currentCPA = data.current_ad_spend / data.current_sales
      const avgRevenuePerSale = data.current_revenue / data.current_sales

      const adjustedLeads = data.adjusted_leads || data.current_leads
      const adjustedAdSpend = data.adjusted_ad_spend || data.current_ad_spend

      const newSales = Math.round((adjustedLeads * data.target_conversion_rate) / 100)
      const newCPL = adjustedAdSpend / adjustedLeads
      const newCPA = adjustedAdSpend / newSales
      const newRevenue = newSales * avgRevenuePerSale

      const salesIncrease = newSales - data.current_sales
      const revenueIncrease = newRevenue - data.current_revenue
      const cpaImprovementPercent = ((currentCPA - newCPA) / currentCPA) * 100

      const calculatedData = {
        company_name: data.company_name,
        scenario_name: data.scenario_name,
        time_period: data.time_period,
        current_leads: data.current_leads,
        current_sales: data.current_sales,
        current_ad_spend: data.current_ad_spend,
        current_revenue: data.current_revenue,
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
        reset({
          time_period: 'monthly',
          target_conversion_rate: 5,
        })
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

  return (
    <div className="w-full">
      {showSuccess && (
        <div className="bg-success/10 border border-success rounded-lg p-4 text-success-dark mb-6">
          ✓ Demo scenario saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Two-Column Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Current Marketing ROI */}
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

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Company Name *
                </label>
                <input
                  {...register('company_name')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Acme Corp"
                />
                {errors.company_name && (
                  <p className="text-error text-sm mt-1">{errors.company_name.message}</p>
                )}
              </div>

              {/* Scenario Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Scenario Name *
                </label>
                <input
                  {...register('scenario_name')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-neutral-50"
                  placeholder="Auto-generated"
                  readOnly
                />
                {errors.scenario_name && (
                  <p className="text-error text-sm mt-1">{errors.scenario_name.message}</p>
                )}
              </div>

              {/* Time Period */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Time Period
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => reset({ ...watch(), time_period: 'weekly' })}
                    className={`px-4 py-2 rounded-lg border ${
                      timePeriod === 'weekly'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white text-neutral-600 border-neutral-300'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => reset({ ...watch(), time_period: 'monthly' })}
                    className={`px-4 py-2 rounded-lg border ${
                      timePeriod === 'monthly'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white text-neutral-600 border-neutral-300'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Number of Leads */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Number of Leads
                </label>
                <input
                  {...register('current_leads', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="100"
                />
                {errors.current_leads && (
                  <p className="text-error text-sm mt-1">{errors.current_leads.message}</p>
                )}
              </div>

              {/* Number of Sales */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Number of Sales
                </label>
                <input
                  {...register('current_sales', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="10"
                />
                {errors.current_sales && (
                  <p className="text-error text-sm mt-1">{errors.current_sales.message}</p>
                )}
              </div>

              {/* Total Ad Spend */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Total Ad Spend ($)
                </label>
                <input
                  {...register('current_ad_spend', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="5000"
                />
                {errors.current_ad_spend && (
                  <p className="text-error text-sm mt-1">{errors.current_ad_spend.message}</p>
                )}
              </div>

              {/* Total Revenue */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Total Revenue ($)
                </label>
                <input
                  {...register('current_revenue', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="20000"
                />
                {errors.current_revenue && (
                  <p className="text-error text-sm mt-1">{errors.current_revenue.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Prospective Scenario */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">
                Prospective Scenario
              </h2>
              <span className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-sm font-medium rounded-full">
                Step 2
              </span>
            </div>
            <p className="text-neutral-600 mb-6">
              Complete Step 1 to unlock scenario modeling
            </p>

            <div className="space-y-4">
              {/* Target Conversion Rate */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Target Conversion Rate (%)
                </label>
                <input
                  {...register('target_conversion_rate', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="15"
                />
                {errors.target_conversion_rate && (
                  <p className="text-error text-sm mt-1">{errors.target_conversion_rate.message}</p>
                )}
              </div>

              {/* Adjusted Leads */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adjusted Leads (optional)
                </label>
                <input
                  {...register('adjusted_leads', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Leave empty for same"
                />
              </div>

              {/* Adjusted Ad Spend */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adjusted Ad Spend ($) (optional)
                </label>
                <input
                  {...register('adjusted_ad_spend', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Leave empty for same"
                />
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-6 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
              >
                <span>{isSaving ? 'Saving Demo...' : 'Calculate & Save Demo'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
