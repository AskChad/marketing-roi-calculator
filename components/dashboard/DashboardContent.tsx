'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Plus, MessageSquare, BarChart3, Calendar, Calculator } from 'lucide-react'
import AIChat from '@/components/ai/AIChat'
import ROICalculator from '@/components/calculator/ROICalculator'

interface DashboardContentProps {
  scenarios: any[]
  userId: string
  userName: string
  isAdmin: boolean
}

export default function DashboardContent({ scenarios, userId, userName, isAdmin }: DashboardContentProps) {
  const [showChat, setShowChat] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleScenarioSaved = () => {
    // Trigger a refresh by incrementing the key
    setRefreshKey(prev => prev + 1)
    // Don't reload the page - let the calculator keep showing results
    // The scenarios list will update on next page load
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
              <TrendingUp className="h-8 w-8 text-brand-primary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{scenarios.length}</p>
            <p className="text-sm text-neutral-600">Total Scenarios</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-brand-secondary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {scenarios.length > 0 ? formatDate(scenarios[0].created_at) : 'N/A'}
            </p>
            <p className="text-sm text-neutral-600">Latest Activity</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-brand-accent" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {isAdmin ? 'Admin' : 'User'}
            </p>
            <p className="text-sm text-neutral-600">Account Type</p>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center mb-6">
            <Calculator className="h-6 w-6 text-brand-primary mr-3" />
            <h2 className="text-2xl font-bold text-neutral-900">ROI Calculator</h2>
          </div>
          <p className="text-neutral-600 mb-8">
            Calculate your current marketing performance and model prospective scenarios
          </p>
          <ROICalculator
            userId={userId}
            userName={userName}
            existingScenarios={scenarios}
            onScenarioSaved={handleScenarioSaved}
          />
        </div>

        {/* Saved Scenarios */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">My Scenarios</h2>
          </div>

          {scenarios.length === 0 ? (
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
              {scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </div>
          )}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-brand-secondary to-brand-primary rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">Admin Tools</h3>
            <p className="mb-6 text-white/90">
              Access admin settings, GHL integration, and view all user data
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-white text-brand-primary rounded-lg hover:bg-neutral-100 transition font-medium"
            >
              Go to Admin Panel
            </Link>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* AI Chat CTA */}
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6">
          <MessageSquare className="h-12 w-12 text-brand-primary mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            AI ROI Assistant
          </h3>
          <p className="text-neutral-600 mb-4 text-sm">
            Chat with AI to analyze your scenarios, get recommendations, and model what-if scenarios
          </p>
          <button
            onClick={() => setShowChat(true)}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition font-medium"
          >
            Start AI Chat
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Links</h3>
          <ul className="space-y-3">
            {isAdmin && (
              <li>
                <Link href="/admin" className="text-brand-primary hover:underline flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </li>
            )}
            <li>
              <Link href="/calculator" className="text-brand-primary hover:underline flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                New Calculation
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showChat && (
        <AIChat
          userId={userId}
          isAdmin={isAdmin}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

function ScenarioCard({ scenario }: { scenario: any }) {
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
              {scenario.scenario_name}
            </h4>
            <p className="text-sm text-neutral-500">
              {formatLongDate(scenario.created_at)}
            </p>
          </div>
          <TrendingUp className="h-5 w-5 text-brand-primary" />
        </div>

        <div className="grid grid-cols-7 gap-3 mb-4">
          <div>
            <p className="text-xs text-neutral-600 mb-1">Leads</p>
            <p className="font-semibold text-neutral-900">{scenario.current_leads?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Sales</p>
            <p className="font-semibold text-neutral-900">{scenario.new_sales?.toLocaleString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Ad Spend</p>
            <p className="font-semibold text-neutral-900">{scenario.current_ad_spend ? formatNumber(scenario.current_ad_spend) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Revenue</p>
            <p className="font-semibold text-neutral-900">{scenario.new_revenue ? formatNumber(scenario.new_revenue) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">CR %</p>
            <p className="font-semibold text-neutral-900">{scenario.target_conversion_rate?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">CPL $</p>
            <p className="font-semibold text-neutral-900">{scenario.new_cpl ? scenario.new_cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">CPA $</p>
            <p className="font-semibold text-neutral-900">{scenario.new_cpa ? scenario.new_cpa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
          <div>
            <p className="text-xs text-neutral-600 mb-1">Sales Increase</p>
            <p className="font-semibold text-success-dark">
              +{scenario.sales_increase || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Revenue Increase</p>
            <p className="font-semibold text-success-dark">
              +{scenario.revenue_increase ? formatNumber(scenario.revenue_increase) : '$0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">CPA Improvement</p>
            <p className="font-semibold text-success-dark">
              {scenario.cpa_improvement_percent?.toFixed(1) || '0.0'}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
