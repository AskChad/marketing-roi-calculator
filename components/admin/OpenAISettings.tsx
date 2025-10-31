'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Key, Sliders, FileText } from 'lucide-react'

export default function OpenAISettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [settings, setSettings] = useState({
    api_key: '',
    api_key_masked: '',
    api_key_exists: false,
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 2000,
    system_instructions: '',
  })

  const [formData, setFormData] = useState<{
    api_key: string
    api_type: string
    model: string
    temperature: number
    max_tokens: number | null
    system_instructions: string
  }>({
    api_key: '',
    api_type: 'chat', // 'chat' or 'responses'
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 2000,
    system_instructions: '',
  })

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/openai-settings')

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()

      if (data.success && data.settings) {
        setSettings(data.settings)
        setFormData({
          api_key: '',
          api_type: data.settings.api_type || 'chat',
          model: data.settings.model || 'gpt-4o',
          temperature: data.settings.temperature || 0.7,
          max_tokens: data.settings.max_tokens || 2000,
          system_instructions: data.settings.system_instructions || '',
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setErrorMessage('Failed to load OpenAI settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSuccessMessage('')
      setErrorMessage('')

      const updateData: any = {
        api_type: formData.api_type,
        model: formData.model,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        system_instructions: formData.system_instructions,
      }

      // Only include API key if it was changed
      if (formData.api_key.trim()) {
        updateData.api_key = formData.api_key.trim()
      }

      const response = await fetch('/api/admin/openai-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      const data = await response.json()

      if (data.success) {
        setSuccessMessage('Settings updated successfully')
        setFormData(prev => ({ ...prev, api_key: '' })) // Clear API key input
        await fetchSettings() // Refresh settings
      } else {
        throw new Error(data.error || 'Failed to update settings')
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setErrorMessage(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          OpenAI Configuration
        </h2>
        <p className="text-neutral-600">
          Configure OpenAI API settings for the AI chat assistant. All users will use this platform-wide configuration unless they set their own API key.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-success-light/20 border border-success rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-success-dark">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-error-light/20 border border-error rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
          <p className="text-error-dark">{errorMessage}</p>
        </div>
      )}

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-semibold text-neutral-900">API Key</h3>
        </div>

        <div className="space-y-4">
          {settings.api_key_exists && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">Current API Key</p>
              <p className="font-mono text-neutral-900">{settings.api_key_masked}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {settings.api_key_exists ? 'New API Key (leave blank to keep current)' : 'OpenAI API Key'}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                placeholder="sk-proj-..."
                className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Model Configuration Section */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sliders className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-semibold text-neutral-900">Model Configuration</h3>
        </div>

        <div className="space-y-4">
          {/* API Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              API Type
            </label>
            <select
              value={formData.api_type}
              onChange={(e) => setFormData(prev => ({ ...prev, api_type: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              <option value="chat">Chat Completions API (Standard)</option>
              <option value="responses">Responses API (Advanced)</option>
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              <strong>Chat Completions:</strong> Standard API, widely supported, lower latency.
              <strong>Responses:</strong> Advanced features, built-in tools, GPT-5 support.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Model
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            >
              {formData.api_type === 'responses' ? (
                // Responses API models
                <>
                  <option value="gpt-5">GPT-5 (Flagship - Highest Capability)</option>
                  <option value="gpt-5-mini">GPT-5-mini (Balanced Performance & Cost)</option>
                  <option value="gpt-5-nano">GPT-5-nano (Fastest & Most Efficient)</option>
                  <option value="gpt-4o">GPT-4o (Multimodal)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="o1-preview">o1-preview (Reasoning)</option>
                  <option value="o1-mini">o1-mini (Fast Reasoning)</option>
                </>
              ) : (
                // Chat Completions API models
                <>
                  <option value="gpt-4o">GPT-4o (Recommended - Multimodal)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost-Effective)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="o1-preview">o1-preview (Reasoning Model)</option>
                  <option value="o1-mini">o1-mini (Fast Reasoning)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                </>
              )}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              <strong>gpt-4o:</strong> Best for most use cases. Fast, smart, multimodal.
              <strong>o1-preview/o1-mini:</strong> Advanced reasoning models.
            </p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Temperature: {formData.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Max Tokens (optional)
            </label>
            <input
              type="number"
              min="100"
              max="128000"
              step="100"
              value={formData.max_tokens || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                max_tokens: e.target.value ? parseInt(e.target.value) : null
              }))}
              placeholder="Leave empty for model maximum"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Leave empty to use the model's maximum token count. Lower values may reduce cost but limit response length.
            </p>
          </div>
        </div>
      </div>

      {/* System Instructions Section */}
      <div className="bg-white rounded-lg shadow border border-neutral-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-semibold text-neutral-900">System Instructions</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Custom Instructions (Admin Only)
          </label>
          <textarea
            value={formData.system_instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, system_instructions: e.target.value }))}
            rows={6}
            placeholder="Add custom instructions for how the AI should behave across all conversations..."
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-neutral-500 mt-1">
            These instructions will be applied to all AI conversations. Use this to customize the AI's personality, tone, or specific domain knowledge.
          </p>
        </div>

        <div className="mt-4 bg-neutral-50 rounded-lg p-4">
          <p className="text-sm font-medium text-neutral-700 mb-2">Example Instructions:</p>
          <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
            <li>Always provide specific numbers and calculations when discussing ROI</li>
            <li>Focus on actionable recommendations rather than theory</li>
            <li>When analyzing scenarios, highlight both opportunities and risks</li>
            <li>Use professional but friendly language appropriate for marketing professionals</li>
          </ul>
        </div>
      </div>

      {/* Available Functions Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          AI Capabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">User Functions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• View their own scenarios</li>
              <li>• Get personal statistics</li>
              <li>• Compare scenarios</li>
              <li>• Get scenario details with platform breakdown</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Admin Functions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All user functions</li>
              <li>• Search users by email, name, or company</li>
              <li>• View any user's scenarios</li>
              <li>• Get company-wide statistics</li>
              <li>• Platform analytics and trends</li>
              <li>• View top performing users</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
