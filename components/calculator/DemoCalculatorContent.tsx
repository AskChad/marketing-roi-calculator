'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Plus, MessageSquare, BarChart3, Calendar, Calculator, Presentation } from 'lucide-react'
import DemoROICalculator from './DemoROICalculator'

interface DemoCalculatorContentProps {
  userId: string
  existingDemos: any[]
}

export default function DemoCalculatorContent({ userId, existingDemos: initialDemos }: DemoCalculatorContentProps) {
  const [savedDemos, setSavedDemos] = useState(initialDemos)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDemoSaved = (newDemo: any) => {
    // Add new demo to the top of the list
    setSavedDemos([newDemo, ...savedDemos])
    setRefreshKey(prev => prev + 1)
  }

  // Format date consistently for server and client to avoid hydration errors
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${month}/${day}/${year}`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Presentation className="h-8 w-8 text-brand-primary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{savedDemos.length}</p>
            <p className="text-sm text-neutral-600">Total Demo Scenarios</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-brand-secondary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {savedDemos.length > 0 ? formatDate(savedDemos[0].created_at) : 'N/A'}
            </p>
            <p className="text-sm text-neutral-600">Latest Demo</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-brand-accent" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              Admin
            </p>
            <p className="text-sm text-neutral-600">Demo Mode</p>
          </div>
        </div>

        {/* Demo Calculator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center mb-6">
            <Calculator className="h-6 w-6 text-brand-primary mr-3" />
            <h2 className="text-2xl font-bold text-neutral-900">Demo Calculator</h2>
          </div>
          <p className="text-neutral-600 mb-8">
            Create demo scenarios for prospective clients with company name tracking
          </p>
          <DemoROICalculator
            userId={userId}
            existingDemos={savedDemos}
            onDemoSaved={handleDemoSaved}
          />
        </div>

        {/* Saved Demo Scenarios */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Demo Scenarios</h2>
          </div>

          {savedDemos.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No demo scenarios yet
              </h3>
              <p className="text-neutral-600">
                Use the calculator above to create your first demo scenario
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

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Demo Info */}
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6">
          <Presentation className="h-12 w-12 text-brand-primary mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            Demo Calculator
          </h3>
          <p className="text-neutral-600 mb-4 text-sm">
            Create and manage demo scenarios for prospective clients. Track company names and showcase ROI improvements.
          </p>
        </div>

        {/* Quick Links */}
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
                <BarChart3 className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
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

  return (
    <div className="border border-neutral-200 rounded-lg p-6 hover:shadow-md hover:border-brand-primary transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-neutral-900 text-lg mb-1">
            {scenario.company_name}
          </h4>
          <p className="text-sm text-neutral-600 mb-1">{scenario.scenario_name}</p>
          <p className="text-sm text-neutral-500">
            {formatLongDate(scenario.created_at)}
          </p>
        </div>
        <TrendingUp className="h-5 w-5 text-brand-primary" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-neutral-600 mb-1">Sales Increase</p>
          <p className="font-semibold text-neutral-900">
            +{scenario.sales_increase}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-600 mb-1">Revenue Increase</p>
          <p className="font-semibold text-neutral-900">
            ${(scenario.revenue_increase / 1000).toFixed(1)}k
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
  )
}
