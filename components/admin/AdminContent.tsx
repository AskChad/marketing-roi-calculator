'use client'

import { useState } from 'react'
import { Users, TrendingUp, Settings, Database, ArrowLeft, ChevronRight, MousePointerClick } from 'lucide-react'
import GHLSettings from './GHLSettings'

interface AdminContentProps {
  users: any[]
  scenarios: any[]
  ghlSettings: any[]
  calculatorVisits: any[]
}

type ManagementSection = 'overview' | 'users' | 'scenarios' | 'ghl' | 'visits'

export default function AdminContent({ users, scenarios, ghlSettings, calculatorVisits }: AdminContentProps) {
  const [activeSection, setActiveSection] = useState<ManagementSection>('overview')
  const isGHLConnected = ghlSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'

  // Overview - Card Selection Interface
  if (activeSection === 'overview') {
    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-brand-primary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
            <p className="text-sm text-neutral-600">Total Users</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-brand-secondary" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{scenarios.length}</p>
            <p className="text-sm text-neutral-600">Total Scenarios</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Database className="h-8 w-8 text-brand-accent" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {scenarios.reduce((sum, s) => sum + s.sales_increase, 0).toLocaleString()}
            </p>
            <p className="text-sm text-neutral-600">Total Sales Increase</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Settings className="h-8 w-8 text-success" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {isGHLConnected ? 'Connected' : 'Not Connected'}
            </p>
            <p className="text-sm text-neutral-600">GHL Status</p>
          </div>
        </div>

        {/* Management Selection Cards */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">What would you like to manage?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* GoHighLevel Sync Card */}
            <button
              onClick={() => setActiveSection('ghl')}
              className="bg-gradient-to-br from-success-light/20 to-success/10 border-2 border-success rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <Settings className="h-12 w-12 text-success-dark" />
                <ChevronRight className="h-6 w-6 text-success-dark group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">GoHighLevel Sync</h3>
              <p className="text-neutral-600 mb-4">
                Configure GoHighLevel integration settings and manage lead synchronization
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isGHLConnected ? 'bg-success' : 'bg-neutral-400'}`}></div>
                <span className="text-sm font-medium text-neutral-700">
                  {isGHLConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </button>

            {/* Users Management Card */}
            <button
              onClick={() => setActiveSection('users')}
              className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 border-2 border-brand-primary rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <Users className="h-12 w-12 text-brand-primary" />
                <ChevronRight className="h-6 w-6 text-brand-primary group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Users Management</h3>
              <p className="text-neutral-600 mb-4">
                View all users, manage permissions, and monitor user activity
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-brand-primary">{users.length}</span>
                <span className="text-sm text-neutral-600">Total Users</span>
              </div>
            </button>

            {/* Scenarios Management Card */}
            <button
              onClick={() => setActiveSection('scenarios')}
              className="bg-gradient-to-br from-brand-secondary/10 to-purple-100 border-2 border-brand-secondary rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-12 w-12 text-brand-secondary" />
                <ChevronRight className="h-6 w-6 text-brand-secondary group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Scenarios Management</h3>
              <p className="text-neutral-600 mb-4">
                View all ROI scenarios created by users across the platform
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-brand-secondary">{scenarios.length}</span>
                <span className="text-sm text-neutral-600">Total Scenarios</span>
              </div>
            </button>

            {/* Calculator Visits Card */}
            <button
              onClick={() => setActiveSection('visits')}
              className="bg-gradient-to-br from-brand-accent/10 to-orange-100 border-2 border-brand-accent rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <MousePointerClick className="h-12 w-12 text-brand-accent" />
                <ChevronRight className="h-6 w-6 text-brand-accent group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Calculator Visits</h3>
              <p className="text-neutral-600 mb-4">
                View all calculator page visits with IP addresses and geolocation data
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-brand-accent">{calculatorVisits.length}</span>
                <span className="text-sm text-neutral-600">Recent Visits</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Detailed Views with Back Button
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setActiveSection('overview')}
        className="flex items-center text-brand-primary hover:text-blue-700 transition font-medium"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Overview
      </button>

      {/* Users Management Section */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-brand-primary mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">All Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Email</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Phone</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Role</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 text-sm text-neutral-900">{user.email}</td>
                    <td className="py-3 text-sm text-neutral-600">{user.phone || 'N/A'}</td>
                    <td className="py-3 text-sm">
                      {user.is_admin ? (
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                          User
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-neutral-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scenarios Management Section */}
      {activeSection === 'scenarios' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 text-brand-primary mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">Recent Scenarios</h3>
          </div>
          <div className="space-y-3">
            {scenarios.slice(0, 50).map((scenario) => (
              <div
                key={scenario.id}
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{scenario.scenario_name}</h4>
                    <p className="text-sm text-neutral-600">
                      {scenario.users?.email || 'Unknown User'}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Sales: </span>
                    <span className="font-semibold">+{scenario.sales_increase}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Revenue: </span>
                    <span className="font-semibold">
                      ${(scenario.revenue_increase / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-600">CPA: </span>
                    <span className="font-semibold text-success-dark">
                      {scenario.cpa_improvement_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GoHighLevel Settings Section */}
      {activeSection === 'ghl' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-brand-primary mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">GoHighLevel Integration</h3>
          </div>
          <GHLSettings initialSettings={ghlSettings} />
        </div>
      )}

      {/* Calculator Visits Section */}
      {activeSection === 'visits' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <MousePointerClick className="h-6 w-6 text-brand-accent mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">Calculator Page Visits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Lead Info</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">IP Address</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Location</th>
                  <th className="text-left text-sm font-semibold text-neutral-600 pb-3">Visited At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {calculatorVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-neutral-50">
                    <td className="py-3 text-sm">
                      {visit.lead_captures ? (
                        <div>
                          <div className="font-medium text-neutral-900">
                            {visit.lead_captures.first_name} {visit.lead_captures.last_name}
                          </div>
                          <div className="text-neutral-600">{visit.lead_captures.email}</div>
                          {visit.lead_captures.company_name && (
                            <div className="text-neutral-500 text-xs">{visit.lead_captures.company_name}</div>
                          )}
                          {visit.lead_captures.phone && (
                            <div className="text-neutral-500 text-xs">{visit.lead_captures.phone}</div>
                          )}
                        </div>
                      ) : visit.user_data ? (
                        <div>
                          <div className="font-medium text-neutral-900">{visit.user_data.email}</div>
                          {visit.user_data.phone && (
                            <div className="text-neutral-500 text-xs">{visit.user_data.phone}</div>
                          )}
                          <div className="text-xs text-blue-600 mt-1">Registered User</div>
                        </div>
                      ) : (
                        <span className="text-neutral-400">No data</span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-neutral-900 font-mono">{visit.ip_address || 'N/A'}</td>
                    <td className="py-3 text-sm text-neutral-600">
                      {visit.city && visit.region && visit.country ? (
                        <span>{visit.city}, {visit.region}, {visit.country}</span>
                      ) : visit.country ? (
                        <span>{visit.country}</span>
                      ) : (
                        <span className="text-neutral-400">Unknown</span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-neutral-600">
                      {new Date(visit.visited_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {calculatorVisits.length === 0 && (
              <div className="text-center py-12">
                <MousePointerClick className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No calculator visits recorded yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
