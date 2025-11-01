'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, DollarSign, Target, BarChart3, PieChart, Calendar } from 'lucide-react'

interface ScenarioAnalysisProps {
  scenario: any
  userId: string
  isAdmin: boolean
}

export default function ScenarioAnalysis({ scenario, userId, isAdmin }: ScenarioAnalysisProps) {
  const session = scenario.calculator_sessions

  // Format date consistently
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December']
    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    return `${month} ${day}, ${year}`
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-brand-primary hover:text-brand-primary-dark mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {scenario.scenario_name}
              </h1>
              <div className="flex items-center text-sm text-neutral-600">
                <Calendar className="h-4 w-4 mr-2" />
                Created on {formatDate(scenario.created_at)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600 mb-1">Time Period</p>
              <p className="text-lg font-semibold text-neutral-900 capitalize">
                {session.time_period}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Sales Increase */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-brand-primary" />
              <span className="text-sm font-medium text-neutral-600">Sales</span>
            </div>
            <p className="text-3xl font-bold text-brand-primary mb-1">
              +{scenario.sales_increase}
            </p>
            <p className="text-sm text-neutral-600">
              {session.current_sales} → {scenario.new_sales}
            </p>
          </div>

          {/* Revenue Increase */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-success" />
              <span className="text-sm font-medium text-neutral-600">Revenue</span>
            </div>
            <p className="text-3xl font-bold text-success mb-1">
              {formatCurrency(scenario.revenue_increase)}
            </p>
            <p className="text-sm text-neutral-600">
              {formatCurrency(session.current_revenue)} → {formatCurrency(scenario.new_revenue)}
            </p>
          </div>

          {/* CPA Improvement */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-brand-accent" />
              <span className="text-sm font-medium text-neutral-600">CPA</span>
            </div>
            <p className="text-3xl font-bold text-brand-accent mb-1">
              -{formatPercent(scenario.cpa_improvement_percent)}
            </p>
            <p className="text-sm text-neutral-600">
              {formatCurrency(session.current_cpa)} → {formatCurrency(scenario.new_cpa)}
            </p>
          </div>
        </div>

        {/* Current vs Projected Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Metrics */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 text-neutral-600 mr-3" />
              Current Performance
            </h2>
            <div className="space-y-4">
              <MetricRow label="Leads" value={session.current_leads.toLocaleString()} />
              <MetricRow label="Sales" value={session.current_sales.toLocaleString()} />
              <MetricRow label="Conversion Rate" value={formatPercent(session.current_conversion_rate)} />
              <MetricRow label="Ad Spend" value={formatCurrency(session.current_ad_spend)} />
              <MetricRow label="Revenue" value={formatCurrency(session.current_revenue)} />
              <MetricRow label="CPL" value={formatCurrency(session.current_cpl)} />
              <MetricRow label="CPA" value={formatCurrency(session.current_cpa)} />
              <MetricRow label="Avg Revenue/Sale" value={formatCurrency(session.avg_revenue_per_sale)} />
            </div>
          </div>

          {/* Projected Metrics */}
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 text-brand-primary mr-3" />
              Projected Performance
            </h2>
            <div className="space-y-4">
              <MetricRow
                label="Leads"
                value={(scenario.adjusted_leads || session.current_leads).toLocaleString()}
                highlight={scenario.adjusted_leads && scenario.adjusted_leads !== session.current_leads}
              />
              <MetricRow
                label="Sales"
                value={scenario.new_sales.toLocaleString()}
                highlight={true}
              />
              <MetricRow
                label="Conversion Rate"
                value={formatPercent(scenario.target_conversion_rate)}
                highlight={true}
              />
              <MetricRow
                label="Ad Spend"
                value={formatCurrency(scenario.adjusted_ad_spend || session.current_ad_spend)}
                highlight={scenario.adjusted_ad_spend && scenario.adjusted_ad_spend !== session.current_ad_spend}
              />
              <MetricRow
                label="Revenue"
                value={formatCurrency(scenario.new_revenue)}
                highlight={true}
              />
              <MetricRow
                label="CPL"
                value={formatCurrency(scenario.new_cpl)}
                highlight={scenario.new_cpl !== session.current_cpl}
              />
              <MetricRow
                label="CPA"
                value={formatCurrency(scenario.new_cpa)}
                highlight={true}
              />
              <MetricRow
                label="Avg Revenue/Sale"
                value={formatCurrency(session.avg_revenue_per_sale)}
              />
            </div>
          </div>
        </div>

        {/* Platform Breakdown (if available) */}
        {session.session_platforms && session.session_platforms.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
              <PieChart className="h-6 w-6 text-brand-primary mr-3" />
              Platform Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Platform</th>
                    <th className="text-right text-sm font-semibold text-neutral-600 pb-3">Leads</th>
                    <th className="text-right text-sm font-semibold text-neutral-600 pb-3">Sales</th>
                    <th className="text-right text-sm font-semibold text-neutral-600 pb-3">Ad Spend</th>
                    <th className="text-right text-sm font-semibold text-neutral-600 pb-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {session.session_platforms.map((platform: any) => (
                    <tr key={platform.id}>
                      <td className="py-3 text-sm text-neutral-900">{platform.platforms.name}</td>
                      <td className="py-3 text-sm text-neutral-900 text-right">{platform.platform_leads}</td>
                      <td className="py-3 text-sm text-neutral-900 text-right">{platform.platform_sales}</td>
                      <td className="py-3 text-sm text-neutral-900 text-right">{formatCurrency(platform.platform_ad_spend)}</td>
                      <td className="py-3 text-sm text-neutral-900 text-right">{formatCurrency(platform.platform_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Key Insights</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">•</span>
              <span className="text-neutral-700">
                By improving your conversion rate from {formatPercent(session.current_conversion_rate)} to{' '}
                {formatPercent(scenario.target_conversion_rate)}, you could generate{' '}
                <strong>{scenario.sales_increase} additional sales</strong>.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">•</span>
              <span className="text-neutral-700">
                This improvement would result in <strong>{formatCurrency(scenario.revenue_increase)} more revenue</strong>{' '}
                per {session.time_period === 'monthly' ? 'month' : 'week'}.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-brand-primary mr-2">•</span>
              <span className="text-neutral-700">
                Your cost per acquisition would improve by{' '}
                <strong>{formatPercent(scenario.cpa_improvement_percent)}</strong>, from{' '}
                {formatCurrency(session.current_cpa)} to {formatCurrency(scenario.new_cpa)}.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-neutral-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-brand-primary' : 'text-neutral-900'}`}>
        {value}
      </span>
    </div>
  )
}
