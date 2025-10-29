'use client'

import { Users, TrendingUp, Settings, Database } from 'lucide-react'
import GHLSettings from './GHLSettings'

interface AdminContentProps {
  users: any[]
  scenarios: any[]
  ghlSettings: any[]
}

export default function AdminContent({ users, scenarios, ghlSettings }: AdminContentProps) {
  const isGHLConnected = ghlSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'

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

      {/* Recent Scenarios Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-brand-primary mr-3" />
          <h3 className="text-2xl font-bold text-neutral-900">Recent Scenarios</h3>
        </div>
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

      {/* Users Card */}
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

      {/* GHL Settings Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 text-brand-primary mr-3" />
          <h3 className="text-2xl font-bold text-neutral-900">GoHighLevel Integration</h3>
        </div>
        <GHLSettings initialSettings={ghlSettings} />
      </div>
    </div>
  )
}
