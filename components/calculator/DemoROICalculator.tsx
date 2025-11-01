'use client'

import { useState } from 'react'
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
    formState: { errors },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      time_period: 'monthly',
      target_conversion_rate: 5,
    },
  })

  const timePeriod = watch('time_period')

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
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-success/10 border border-success rounded-lg p-4 text-success-dark">
          ✓ Demo scenario saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Company & Scenario Info */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Demo Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Scenario Name *
              </label>
              <input
                {...register('scenario_name')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Q1 2025 Demo"
              />
              {errors.scenario_name && (
                <p className="text-error text-sm mt-1">{errors.scenario_name.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Performance */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Current Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Time Period
              </label>
              <select
                {...register('time_period')}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Current Leads ({timePeriod})
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Current Sales
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ad Spend
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Revenue
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

        {/* Target Scenario */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Target Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Adjusted Ad Spend (optional)
              </label>
              <input
                {...register('adjusted_ad_spend', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Leave empty for same"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
        >
          <span>{isSaving ? 'Saving Demo...' : 'Calculate & Save Demo'}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
