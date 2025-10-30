'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import GHLFieldMapping from './GHLFieldMapping'

interface GHLSettingsProps {
  initialSettings: any[]
}

export default function GHLSettings({ initialSettings }: GHLSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)
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
  const [clientId, setClientId] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_client_id')?.setting_value || ''
  )
  const [clientSecret, setClientSecret] = useState(
    initialSettings.find(s => s.setting_key === 'ghl_client_secret')?.setting_value || ''
  )
  const [credentialsSaved, setCredentialsSaved] = useState(
    !!(initialSettings.find(s => s.setting_key === 'ghl_client_id')?.setting_value &&
       initialSettings.find(s => s.setting_key === 'ghl_client_secret')?.setting_value)
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

  const handleSaveCredentials = async () => {
    if (!clientId || !clientSecret) {
      setErrorMessage('Please enter both Client ID and Client Secret')
      return
    }

    setIsSavingCredentials(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/ghl/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      })

      if (response.ok) {
        setCredentialsSaved(true)
        setSuccessMessage('GHL credentials saved successfully! You can now connect.')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrorMessage('Failed to save credentials')
      }
    } catch (error) {
      console.error('Save credentials error:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsSavingCredentials(false)
    }
  }

  const handleConnect = () => {
    if (!credentialsSaved) {
      setErrorMessage('Please save your GHL credentials first')
      return
    }
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

      {/* OAuth Configuration */}
      {!isConnected && (
        <div className="mt-8 pt-8 border-t border-neutral-200">
          <h4 className="font-semibold text-neutral-900 mb-4 text-lg">OAuth App Configuration</h4>
          <p className="text-sm text-neutral-600 mb-6">
            Before connecting, you need to create an OAuth app in GoHighLevel and enter your credentials below.
          </p>

          {/* GHL Credentials Input */}
          <div className="mb-6">
            <h5 className="font-semibold text-neutral-900 mb-3">GHL App Credentials</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your GoHighLevel Client ID"
                  className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  disabled={credentialsSaved && !isLoading}
                />
                <p className="text-xs text-neutral-500 mt-1">Get this from your GHL OAuth app settings</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter your GoHighLevel Client Secret"
                  className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  disabled={credentialsSaved && !isLoading}
                />
                <p className="text-xs text-neutral-500 mt-1">Get this from your GHL OAuth app settings</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveCredentials}
                  disabled={isSavingCredentials || !clientId || !clientSecret}
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSavingCredentials ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : credentialsSaved ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Credentials Saved
                    </>
                  ) : (
                    'Save Credentials'
                  )}
                </button>
                {credentialsSaved && (
                  <button
                    onClick={() => {
                      setCredentialsSaved(false)
                      setClientId('')
                      setClientSecret('')
                    }}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium text-sm"
                  >
                    Edit Credentials
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Callback URL */}
          <div className="mb-6 p-4 bg-success-light/10 border-2 border-success rounded-lg">
            <h5 className="font-semibold text-neutral-900 mb-2 flex items-center">
              <CheckCircle className="h-5 w-5 text-success mr-2" />
              OAuth Redirect URI
            </h5>
            <p className="text-sm text-neutral-600 mb-3">
              Use this exact URL when creating your GHL OAuth app:
            </p>
            <div className="p-3 bg-white border border-neutral-300 rounded font-mono text-sm text-neutral-900 break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/api/admin/ghl/callback` : '[YOUR_DOMAIN]/api/admin/ghl/callback'}
            </div>
          </div>

          {/* Required Scopes */}
          <div className="mb-6">
            <h5 className="font-semibold text-neutral-900 mb-3">Required OAuth Scopes</h5>
            <p className="text-sm text-neutral-600 mb-3">
              When creating your GHL OAuth app, request these scopes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                contacts.readonly
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                contacts.write
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                opportunities.readonly
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                opportunities.write
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                locations/customFields.readonly
              </div>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-sm font-mono">
                locations/customFields.write
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
            <h5 className="font-semibold text-brand-primary mb-3">Complete Setup Steps</h5>
            <ol className="space-y-3 text-sm text-neutral-700">
              <li className="flex items-start">
                <span className="font-bold mr-2 text-brand-primary">1.</span>
                <div>
                  <strong>Create GHL OAuth App:</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-xs">
                    <li>• Go to your GoHighLevel agency settings</li>
                    <li>• Navigate to OAuth Apps or Marketplace</li>
                    <li>• Create a new app (Marketplace or Private)</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-brand-primary">2.</span>
                <div>
                  <strong>Configure OAuth App:</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-xs">
                    <li>• Set the Redirect URI to the URL shown above</li>
                    <li>• Request all the scopes listed above</li>
                    <li>• Save and note your Client ID and Secret</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-brand-primary">3.</span>
                <div>
                  <strong>Set Environment Variables:</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-xs">
                    <li>• Add GHL_CLIENT_ID to your .env.local file</li>
                    <li>• Add GHL_CLIENT_SECRET to your .env.local file</li>
                    <li>• Add these to Vercel environment variables if deployed</li>
                    <li>• Restart your development server or redeploy</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 text-brand-primary">4.</span>
                <div>
                  <strong>Connect Your Account:</strong>
                  <ul className="ml-4 mt-1 space-y-1 text-xs">
                    <li>• Click "Connect with GoHighLevel" button above</li>
                    <li>• Select your GHL location</li>
                    <li>• Authorize the connection</li>
                    <li>• You'll be redirected back here once connected</li>
                  </ul>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
