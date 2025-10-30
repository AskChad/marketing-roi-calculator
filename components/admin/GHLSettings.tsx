'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import GHLFieldMapping from './GHLFieldMapping'

interface GHLSettingsProps {
  initialSettings: any[]
}

export default function GHLSettings({ initialSettings }: GHLSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [locationId, setLocationId] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_location_id')?.setting_value || ''
  )
  const [isConnected, setIsConnected] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_connected')?.setting_value === 'true'
  )
  const [connectedAt, setConnectedAt] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_connected_at')?.setting_value || ''
  )
  const [companyId, setCompanyId] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_company_id')?.setting_value || ''
  )
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Check URL for OAuth callback messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success === 'ghl_connected') {
      setSuccessMessage('Successfully connected to GoHighLevel!')
      setIsConnected(true)
      // Reload page to get updated settings
      setTimeout(() => {
        window.location.href = window.location.pathname
      }, 2000)
    }

    if (error) {
      setErrorMessage(`Connection failed: ${error}`)
    }
  }, [])

  const handleConnect = () => {
    // Redirect to OAuth authorization endpoint
    window.location.href = '/api/admin/ghl/authorize'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from GoHighLevel? This will remove all stored credentials.')) return

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/ghl/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setIsConnected(false)
        setLocationId('')
        setCompanyId('')
        setConnectedAt('')
        setSuccessMessage('Disconnected from GoHighLevel')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrorMessage('Failed to disconnect')
      }
    } catch (error) {
      console.error('GHL disconnection error:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-success-light/20 border border-success rounded-lg flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-success-dark flex-shrink-0" />
          <p className="text-success-dark font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-danger-light/20 border border-danger rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-danger flex-shrink-0" />
          <p className="text-danger font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Connection Status */}
      <div className={`p-6 rounded-lg border-2 ${
        isConnected
          ? 'bg-success-light/20 border-success'
          : 'bg-neutral-50 border-neutral-200'
      }`}>
        <div className="flex items-start space-x-4">
          {isConnected ? (
            <>
              <CheckCircle className="h-8 w-8 text-success-dark flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-lg text-neutral-900 mb-1">Connected to GoHighLevel</p>
                <p className="text-sm text-neutral-600 mb-3">
                  All lead captures will automatically sync to your GHL account
                </p>
                {connectedAt && (
                  <p className="text-xs text-neutral-500">
                    Connected on {new Date(connectedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8 text-neutral-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-lg text-neutral-900 mb-1">Not Connected</p>
                <p className="text-sm text-neutral-600">
                  Connect your GoHighLevel account to automatically sync leads and ROI data
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Connection Details */}
      {isConnected && (
        <div className="space-y-3">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <p className="text-xs font-semibold text-neutral-600 uppercase mb-2">Location ID</p>
            <p className="font-mono text-sm text-neutral-900">{locationId || 'Not available'}</p>
          </div>

          {companyId && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <p className="text-xs font-semibold text-neutral-600 uppercase mb-2">Company ID</p>
              <p className="font-mono text-sm text-neutral-900">{companyId}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="px-6 py-3 bg-success text-white rounded-lg hover:bg-success-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-5 w-5" />
                Connect with GoHighLevel
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-6 py-3 bg-danger text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </button>
        )}
      </div>

      {/* Field Mapping and Notes Configuration */}
      <div className="mt-8 pt-8 border-t border-neutral-200">
        <h4 className="font-semibold text-neutral-900 mb-4 text-lg">Field Mapping & Notes</h4>
        <p className="text-sm text-neutral-600 mb-6">
          Configure how ROI calculator data is synced to your GoHighLevel account
        </p>
        <GHLFieldMapping isConnected={isConnected} />
      </div>

      {/* OAuth Information */}
      <div className="mt-8 pt-8 border-t border-neutral-200">
        <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 text-brand-primary" />
          OAuth 2.0 Integration
        </h4>
        <p className="text-sm text-neutral-600 mb-4">
          This integration uses OAuth 2.0 for secure authentication with GoHighLevel. When you connect:
        </p>
        <ul className="space-y-2 text-sm text-neutral-700 mb-6">
          <li className="flex items-start">
            <span className="text-success mr-2">✓</span>
            <span>Your access tokens are securely stored and automatically refreshed</span>
          </li>
          <li className="flex items-start">
            <span className="text-success mr-2">✓</span>
            <span>No need to manually manage API credentials</span>
          </li>
          <li className="flex items-start">
            <span className="text-success mr-2">✓</span>
            <span>You can revoke access at any time</span>
          </li>
        </ul>

        <h4 className="font-semibold text-neutral-900 mb-3">Permissions</h4>
        <p className="text-sm text-neutral-600 mb-3">
          The integration requests the following permissions:
        </p>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li>• <strong>Contacts:</strong> Read and write contact information</li>
          <li>• <strong>Opportunities:</strong> Read and write opportunities</li>
          <li>• <strong>Custom Fields:</strong> Read and write custom field values</li>
        </ul>
      </div>

      {/* Setup Instructions */}
      {!isConnected && (
        <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
          <h4 className="font-semibold text-brand-primary mb-2">Setup Instructions</h4>
          <ol className="space-y-2 text-sm text-neutral-700">
            <li>1. Make sure you have a GoHighLevel account with admin access</li>
            <li>2. Click "Connect with GoHighLevel" above</li>
            <li>3. Select the location you want to integrate with</li>
            <li>4. Authorize the connection</li>
            <li>5. You'll be redirected back here once connected</li>
          </ol>
        </div>
      )}
    </div>
  )
}
