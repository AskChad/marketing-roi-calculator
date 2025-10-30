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
              {scenarios.length > 0 ? new Date(scenarios[0].created_at).toLocaleDateString() : 'N/A'}
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
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Start AI Chat
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/platforms" className="text-brand-primary hover:underline flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Platform Comparison
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link href="/admin" className="text-brand-primary hover:underline flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </li>
            )}
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
  return (
    <div className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-neutral-900 text-lg mb-1">
            {scenario.scenario_name}
          </h4>
          <p className="text-sm text-neutral-500">
            {new Date(scenario.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
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
