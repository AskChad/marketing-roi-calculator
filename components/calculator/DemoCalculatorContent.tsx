'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, TrendingUp, DollarSign, Target, ArrowRight } from 'lucide-react'
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

export default function DemoCalculatorContent({ userId, existingDemos: initialDemos }: DemoCalculatorContentProps) {
  const [savedDemos, setSavedDemos] = useState(initialDemos)
  const [results, setResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

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
        const { demo } = await response.json()
        setSavedDemos([demo, ...savedDemos])
        // Don't reset form to keep showing results
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  }

  const formatPercent = (val: number) => `${val.toFixed(2)}%`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    return `${month} ${day}, ${year}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
              <Calculator className="h-8 w-8 text-brand-primary mr-3" />
              Demo Calculator
            </h1>
            <Link href="/dashboard" className="text-brand-primary hover:underline text-sm">
              Back to Dashboard
            </Link>
          </div>
          <p className="text-neutral-600">Create demo scenarios for prospective clients (Admin Only)</p>
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Company & Scenario Info */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Demo Information</h2>
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

            {/* Current Metrics */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Current Performance</h2>
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
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Target Scenario</h2>
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
              <Calculator className="h-5 w-5" />
              <span>{isSaving ? 'Saving...' : 'Calculate & Save Demo'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Saved Demos */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Demo Scenarios</h2>
          </div>

          {savedDemos.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No demos yet
              </h3>
              <p className="text-neutral-600">
                Use the calculator above to create your first demo scenario
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedDemos.map((demo) => (
                <DemoScenarioCard key={demo.id} demo={demo} formatCurrency={formatCurrency} formatPercent={formatPercent} formatDate={formatDate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {results && (
          <div className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 text-brand-primary mr-2" />
              Latest Results
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-neutral-600 mb-1">Sales Increase</p>
                <p className="text-2xl font-bold text-brand-primary">+{results.sales_increase}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-neutral-600 mb-1">Revenue Increase</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(results.revenue_increase)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-neutral-600 mb-1">CPA Improvement</p>
                <p className="text-2xl font-bold text-brand-accent">-{formatPercent(results.cpa_improvement_percent)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard" className="text-brand-primary hover:underline flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-brand-primary hover:underline flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function DemoScenarioCard({ demo, formatCurrency, formatPercent, formatDate }: any) {
  return (
    <div className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-neutral-900 text-lg mb-1">
            {demo.company_name}
          </h4>
          <p className="text-sm text-neutral-600 mb-1">{demo.scenario_name}</p>
          <p className="text-xs text-neutral-500">
            {formatDate(demo.created_at)}
          </p>
        </div>
        <TrendingUp className="h-5 w-5 text-brand-primary" />
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-neutral-200">
        <div>
          <p className="text-xs text-neutral-600 mb-1">Sales Increase</p>
          <p className="font-semibold text-brand-primary text-lg">
            +{demo.sales_increase}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Revenue Increase</p>
          <p className="font-semibold text-success text-lg">
            {formatCurrency(demo.revenue_increase)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">CPA Improvement</p>
          <p className="font-semibold text-brand-accent text-lg">
            {formatPercent(demo.cpa_improvement_percent)}
          </p>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Time Period</p>
          <p className="font-medium text-neutral-900 capitalize">{demo.time_period}</p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Conv. Rate</p>
          <p className="font-medium text-neutral-900">
            {formatPercent(demo.current_conversion_rate)} → {formatPercent(demo.target_conversion_rate)}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Leads</p>
          <p className="font-medium text-neutral-900">
            {demo.current_leads} {demo.adjusted_leads && demo.adjusted_leads !== demo.current_leads && `→ ${demo.adjusted_leads}`}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Sales</p>
          <p className="font-medium text-neutral-900">
            {demo.current_sales} → {demo.new_sales}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Ad Spend</p>
          <p className="font-medium text-neutral-900">
            {formatCurrency(demo.current_ad_spend)}
            {demo.adjusted_ad_spend && demo.adjusted_ad_spend !== demo.current_ad_spend && ` → ${formatCurrency(demo.adjusted_ad_spend)}`}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">Revenue</p>
          <p className="font-medium text-neutral-900">
            {formatCurrency(demo.current_revenue)} → {formatCurrency(demo.new_revenue)}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">CPA</p>
          <p className="font-medium text-neutral-900">
            {formatCurrency(demo.current_cpa)} → {formatCurrency(demo.new_cpa)}
          </p>
        </div>
        <div className="bg-neutral-50 rounded p-2">
          <p className="text-xs text-neutral-600">CPL</p>
          <p className="font-medium text-neutral-900">
            {formatCurrency(demo.current_cpl)} → {formatCurrency(demo.new_cpl)}
          </p>
        </div>
      </div>
    </div>
  )
}
