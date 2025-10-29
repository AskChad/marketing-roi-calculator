'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface GHLSettingsProps {
  initialSettings: any[]
}

export default function GHLSettings({ initialSettings }: GHLSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [locationId, setLocationId] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_location_id')?.setting_value || ''
  )
  const [isConnected, setIsConnected] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'
  )

  const handleConnect = async () => {
    setIsConnecting(true)

    try {
      const response = await fetch('/api/admin/ghl/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId }),
      })

      if (response.ok) {
        setIsConnected(true)
        alert('Successfully connected to GoHighLevel!')
      } else {
        alert('Failed to connect. Please check your credentials.')
      }
    } catch (error) {
      console.error('GHL connection error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from GoHighLevel?')) return

    setIsConnecting(true)

    try {
      const response = await fetch('/api/admin/ghl/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setIsConnected(false)
        alert('Disconnected from GoHighLevel')
      } else {
        alert('Failed to disconnect')
      }
    } catch (error) {
      console.error('GHL disconnection error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-neutral-900">GoHighLevel Integration</h3>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg border ${
        isConnected
          ? 'bg-success-light/20 border-success'
          : 'bg-neutral-50 border-neutral-200'
      }`}>
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <>
              <CheckCircle className="h-6 w-6 text-success-dark" />
              <div>
                <p className="font-semibold text-neutral-900">Connected to GoHighLevel</p>
                <p className="text-sm text-neutral-600">
                  All lead captures will sync to your GHL account
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-neutral-400" />
              <div>
                <p className="font-semibold text-neutral-900">Not Connected</p>
                <p className="text-sm text-neutral-600">
                  Connect your GHL account to sync leads automatically
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Configuration */}
      {!isConnected ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="locationId" className="block text-sm font-medium text-neutral-700 mb-2">
              GHL Location ID
            </label>
            <input
              type="text"
              id="locationId"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
              placeholder="Enter your GHL Location ID"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Find this in your GHL account settings
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || !locationId}
            className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Connecting...
              </>
            ) : (
              'Connect to GoHighLevel'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Location ID</p>
            <p className="font-mono text-neutral-900">{locationId}</p>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={isConnecting}
            className="px-6 py-3 bg-danger text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}

      {/* Field Mapping Info */}
      <div className="mt-8 pt-8 border-t border-neutral-200">
        <h4 className="font-semibold text-neutral-900 mb-3">Field Mapping</h4>
        <p className="text-sm text-neutral-600 mb-4">
          The following fields will be synced to GHL:
        </p>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li>• Contact Info: First Name, Last Name, Email, Phone, Company</li>
          <li>• Current Metrics: Leads, Sales, Ad Spend, Revenue, CR, CPL, CPA</li>
          <li>• Prospective Metrics: Scenario Name, Target CR, New Sales, New Revenue</li>
          <li>• Comparison: Sales Increase, Revenue Increase, CPA Improvement</li>
        </ul>
      </div>

      {/* Note */}
      <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
        <p className="text-sm text-neutral-700">
          <strong className="text-brand-primary">Note:</strong> This is a placeholder for GHL OAuth integration.
          In production, you would implement the full OAuth flow with client ID, client secret, and redirect URI.
        </p>
      </div>
    </div>
  )
}
