'use client'

import { useState } from 'react'
import { Users, TrendingUp, Settings, Database, ArrowLeft, ChevronRight, MousePointerClick, Palette, BarChart3, Bot, UserPlus, X, Loader, Eye, EyeOff } from 'lucide-react'
import GHLSettings from './GHLSettings'
import VisitsTable from './VisitsTable'
import ScenariosTable from './ScenariosTable'
import BrandsManagement from './BrandsManagement'
import ReportsView from './ReportsView'
import OpenAISettings from './OpenAISettings'

interface AdminContentProps {
  users: any[]
  scenarios: any[]
  ghlSettings: any[]
  calculatorVisits: any[]
  brands: any[]
}

type ManagementSection = 'overview' | 'users' | 'scenarios' | 'ghl' | 'visits' | 'brands' | 'reports' | 'openai'

export default function AdminContent({ users, scenarios, ghlSettings, calculatorVisits, brands }: AdminContentProps) {
  const [activeSection, setActiveSection] = useState<ManagementSection>('overview')
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    phone: '',
    is_admin: false
  })
  const [createUserError, setCreateUserError] = useState('')
  const [createUserSuccess, setCreateUserSuccess] = useState('')
  const isGHLConnected = ghlSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'

  const handleCreateUser = async () => {
    try {
      setIsCreatingUser(true)
      setCreateUserError('')
      setCreateUserSuccess('')

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setCreateUserSuccess(`User ${newUserData.email} created successfully!`)
      setNewUserData({ email: '', password: '', phone: '', is_admin: false })

      // Close modal after 2 seconds and refresh page
      setTimeout(() => {
        setShowNewUserModal(false)
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setCreateUserError(error.message || 'Failed to create user')
    } finally {
      setIsCreatingUser(false)
    }
  }

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

            {/* OpenAI Settings Card */}
            <button
              onClick={() => setActiveSection('openai')}
              className="bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-500 rounded-2xl p-8 text-left hover:shadow-xl transition-all hover:scale-105 group"
            >
              <div className="flex items-center justify-between mb-4">
                <Bot className="h-12 w-12 text-emerald-600" />
                <ChevronRight className="h-6 w-6 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">AI Settings</h3>
              <p className="text-neutral-600 mb-4">
                Configure OpenAI API key, model, and system instructions for AI chat
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-emerald-600">
                  GPT-4 Function Calling
                </span>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-brand-primary mr-3" />
              <h3 className="text-2xl font-bold text-neutral-900">All Users</h3>
            </div>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              <UserPlus className="h-5 w-5" />
              <span>New User</span>
            </button>
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

      {/* OpenAI Settings Section */}
      {activeSection === 'openai' && (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8">
          <div className="flex items-center mb-6">
            <Bot className="h-6 w-6 text-emerald-600 mr-3" />
            <h3 className="text-2xl font-bold text-neutral-900">OpenAI Configuration</h3>
          </div>
          <OpenAISettings />
        </div>
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Create New User</h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {createUserError && (
              <div className="mb-4 p-3 bg-error-light/20 border border-error rounded-lg text-error-dark text-sm">
                {createUserError}
              </div>
            )}

            {createUserSuccess && (
              <div className="mb-4 p-3 bg-success-light/20 border border-success rounded-lg text-success-dark text-sm">
                {createUserSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={newUserData.is_admin}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, is_admin: e.target.checked }))}
                  className="w-4 h-4 text-brand-primary border-neutral-300 rounded focus:ring-brand-primary"
                />
                <label htmlFor="is_admin" className="text-sm font-medium text-neutral-700">
                  Make this user an administrator
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isCreatingUser || !newUserData.email || !newUserData.password}
                  className="flex-1 px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isCreatingUser ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
