'use client'

import { useState } from 'react'
import { Users, TrendingUp, Settings, Database } from 'lucide-react'
import GHLSettings from './GHLSettings'

interface AdminContentProps {
  users: any[]
  scenarios: any[]
  ghlSettings: any[]
}

export default function AdminContent({ users, scenarios, ghlSettings }: AdminContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ghl'>('overview')

  const isGHLConnected = ghlSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'

  return (
    <div className="space-y-8">
      {/* Stats */}
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

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'overview'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'users'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('ghl')}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === 'ghl'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              GHL Settings
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-900">Recent Scenarios</h3>
              <div className="space-y-3">
                {scenarios.slice(0, 10).map((scenario) => (
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

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-neutral-900">All Users</h3>
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

          {activeTab === 'ghl' && (
            <GHLSettings initialSettings={ghlSettings} />
          )}
        </div>
      </div>
    </div>
  )
}
