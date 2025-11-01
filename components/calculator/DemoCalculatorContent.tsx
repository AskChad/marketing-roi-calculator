'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, Save, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const demoFormSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  scenario_name: z.string().min(1, 'Scenario name is required'),
  time_period: z.enum(['weekly', 'monthly']),
  current_leads: z.number().int().positive(),
  current_sales: z.number().int().nonnegative(),
  current_ad_spend: z.number().positive(),
  current_revenue: z.number().nonnegative(),
  target_conversion_rate: z.number().positive(),
  adjusted_leads: z.number().int().optional().nullable(),
  adjusted_ad_spend: z.number().optional().nullable(),
})

type DemoFormData = z.infer<typeof demoFormSchema>

interface DemoCalculatorContentProps {
  userId: string
  existingDemos: any[]
}

export default function DemoCalculatorContent({ userId, existingDemos }: DemoCalculatorContentProps) {
  const [results, setResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
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
      ...data,
      current_conversion_rate: currentConversionRate,
      current_cpl: currentCPL,
      current_cpa: currentCPA,
      avg_revenue_per_sale: avgRevenuePerSale,
      new_sales: newSales,
      new_cpl: newCPL,
      new_cpa: newCPA,
      new_revenue: newRevenue,
      sales_increase: salesIncrease,
      revenue_increase: revenueIncrease,
      cpa_improvement_percent: cpaImprovementPercent,
    }

    setResults(calculatedData)

    // Auto-save
    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/demo-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculatedData),
      })

      if (response.ok) {
        setSaveMessage('Demo saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
            <Calculator className="h-8 w-8 text-brand-primary mr-3" />
            Demo Calculator
          </h1>
          <Link href="/dashboard" className="text-brand-primary hover:underline">
            Back to Dashboard
          </Link>
        </div>
        <p className="text-neutral-600">Create demo scenarios for prospective clients (Admin Only)</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company & Scenario Info */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Demo Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Company Name *</label>
              <input {...register('company_name')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg" placeholder="Acme Corp" />
              {errors.company_name && <p className="text-error text-sm mt-1">{errors.company_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Scenario Name *</label>
              <input {...register('scenario_name')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg" placeholder="Q1 2025 Demo" />
              {errors.scenario_name && <p className="text-error text-sm mt-1">{errors.scenario_name.message}</p>}
            </div>
          </div>
        </div>

        {/* Current Metrics */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Current Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Time Period</label>
              <select {...register('time_period')} className="w-full px-4 py-2 border border-neutral-300 rounded-lg">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Current Leads ({timePeriod})</label>
              <input {...register('current_leads', { valueAsNumber: true })} type="number" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
              {errors.current_leads && <p className="text-error text-sm mt-1">{errors.current_leads.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Current Sales</label>
              <input {...register('current_sales', { valueAsNumber: true })} type="number" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
              {errors.current_sales && <p className="text-error text-sm mt-1">{errors.current_sales.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Ad Spend</label>
              <input {...register('current_ad_spend', { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
              {errors.current_ad_spend && <p className="text-error text-sm mt-1">{errors.current_ad_spend.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Revenue</label>
              <input {...register('current_revenue', { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
              {errors.current_revenue && <p className="text-error text-sm mt-1">{errors.current_revenue.message}</p>}
            </div>
          </div>
        </div>

        {/* Target Scenario */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Target Scenario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Target Conversion Rate (%)</label>
              <input {...register('target_conversion_rate', { valueAsNumber: true })} type="number" step="0.1" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" />
              {errors.target_conversion_rate && <p className="text-error text-sm mt-1">{errors.target_conversion_rate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Adjusted Leads (optional)</label>
              <input {...register('adjusted_leads', { valueAsNumber: true })} type="number" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" placeholder="Leave empty for same" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Adjusted Ad Spend (optional)</label>
              <input {...register('adjusted_ad_spend', { valueAsNumber: true })} type="number" step="0.01" className="w-full px-4 py-2 border border-neutral-300 rounded-lg" placeholder="Leave empty for same" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50">
          <Calculator className="h-5 w-5" />
          <span>{isSaving ? 'Saving...' : 'Calculate & Save Demo'}</span>
        </button>
      </form>

      {saveMessage && (
        <div className="bg-success-light/20 border border-success rounded-lg p-4 text-success-dark">
          {saveMessage}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 text-brand-primary mr-3" />
            Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-primary/10 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Sales Increase</p>
              <p className="text-3xl font-bold text-brand-primary">+{results.sales_increase}</p>
            </div>
            <div className="bg-success/10 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Revenue Increase</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(results.revenue_increase)}</p>
            </div>
            <div className="bg-brand-accent/10 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">CPA Improvement</p>
              <p className="text-3xl font-bold text-brand-accent">-{results.cpa_improvement_percent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Saved Demos */}
      {existingDemos.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Demos</h2>
          <div className="space-y-3">
            {existingDemos.slice(0, 5).map((demo) => (
              <div key={demo.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{demo.company_name}</h3>
                    <p className="text-sm text-neutral-600">{demo.scenario_name}</p>
                  </div>
                  <span className="text-sm text-neutral-500">{new Date(demo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
