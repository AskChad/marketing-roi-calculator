'use client'

import { useState } from 'react'
import { Users, TrendingUp, Settings, Database, ArrowLeft, ChevronRight, MousePointerClick, Palette, BarChart3 } from 'lucide-react'
import GHLSettings from './GHLSettings'
import VisitsTable from './VisitsTable'
import ScenariosTable from './ScenariosTable'
import BrandsManagement from './BrandsManagement'
import ReportsView from './ReportsView'

interface AdminContentProps {
  users: any[]
  scenarios: any[]
  ghlSettings: any[]
  calculatorVisits: any[]
  brands: any[]
}

type ManagementSection = 'overview' | 'users' | 'scenarios' | 'ghl' | 'visits' | 'brands' | 'reports'

export default function AdminContent({ users, scenarios, ghlSettings, calculatorVisits, brands }: AdminContentProps) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Brands Management Card */}
            <button
              onClick={() => setActiveSection('brands')}
              className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <Palette className="h-12 w-12 text-purple-600" />
                <ChevronRight className="h-6 w-6 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Brand Management</h3>
              <p className="text-neutral-600 mb-4">
                Configure white-label brands with custom domains, colors, and branding
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-600">{brands.length}</span>
                <span className="text-sm text-neutral-600">Active Brands</span>
              </div>
            </button>

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

            {/* Anonymous User Reports Card */}
            <button
              onClick={() => setActiveSection('reports')}
              className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-500 rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-12 w-12 text-blue-600" />
                <ChevronRight className="h-6 w-6 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">User Journey Reports</h3>
              <p className="text-neutral-600 mb-4">
                Track anonymous visitor journeys from first visit to lead conversion
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">
                  {scenarios.filter(s => s.tracking_id).length}
                </span>
                <span className="text-sm text-neutral-600">Anonymous Scenarios</span>
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
            <h3 className="text-2xl font-bold text-neutral-900">ROI Scenarios</h3>
          </div>
          <ScenariosTable scenarios={scenarios} />
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
          <VisitsTable visits={calculatorVisits} />
        </div>
      )}

      {/* Brands Management Section */}
      {activeSection === 'brands' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <Palette className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">Brand Management</h3>
          </div>
          <BrandsManagement initialBrands={brands} />
        </div>
      )}

      {/* Anonymous User Reports Section */}
      {activeSection === 'reports' && (
        <div>
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">User Journey Reports</h3>
          </div>
          <ReportsView />
        </div>
      )}
    </div>
  )
}
