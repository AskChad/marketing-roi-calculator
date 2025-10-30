'use client'

import { useState, useEffect } from 'react'
import { Loader2, Save, RefreshCw, Info, CheckCircle, AlertCircle } from 'lucide-react'

interface GHLCustomField {
  id: string
  name: string
  fieldKey: string
  dataType: string
}

interface FieldMappingProps {
  isConnected: boolean
}

const ROI_DATA_FIELDS = [
  { key: 'currentLeads', label: 'Current Leads', description: 'Number of leads in current scenario' },
  { key: 'currentSales', label: 'Current Sales', description: 'Number of sales in current scenario' },
  { key: 'currentAdSpend', label: 'Current Ad Spend', description: 'Total ad spend amount' },
  { key: 'currentRevenue', label: 'Current Revenue', description: 'Total revenue amount' },
  { key: 'currentCR', label: 'Current Conversion Rate', description: 'Current conversion rate percentage' },
  { key: 'currentCPL', label: 'Current CPL', description: 'Current cost per lead' },
  { key: 'currentCPA', label: 'Current CPA', description: 'Current cost per acquisition' },
  { key: 'scenarioName', label: 'Scenario Name', description: 'Name of the saved scenario' },
  { key: 'targetCR', label: 'Target Conversion Rate', description: 'Target conversion rate percentage' },
  { key: 'newSales', label: 'Projected Sales', description: 'Projected number of sales' },
  { key: 'newRevenue', label: 'Projected Revenue', description: 'Projected revenue amount' },
  { key: 'salesIncrease', label: 'Sales Increase', description: 'Increase in number of sales' },
  { key: 'revenueIncrease', label: 'Revenue Increase', description: 'Increase in revenue amount' },
  { key: 'cpaImprovement', label: 'CPA Improvement', description: 'Improvement in cost per acquisition' },
]

const AVAILABLE_PLACEHOLDERS = [
  '{{firstName}}', '{{lastName}}', '{{email}}', '{{phone}}', '{{companyName}}',
  '{{currentLeads}}', '{{currentSales}}', '{{currentAdSpend}}', '{{currentRevenue}}',
  '{{currentCR}}', '{{currentCPL}}', '{{currentCPA}}',
  '{{scenarioName}}', '{{targetCR}}', '{{newSales}}', '{{newRevenue}}',
  '{{salesIncrease}}', '{{revenueIncrease}}', '{{cpaImprovement}}',
  '{{date}}'
]

const DEFAULT_NOTE_TEMPLATE = `New ROI Calculator Lead: {{firstName}} {{lastName}}

Company: {{companyName}}
Email: {{email}}
Phone: {{phone}}

Current Metrics:
- Leads: {{currentLeads}}
- Sales: {{currentSales}}
- Ad Spend: {{currentAdSpend}}
- Revenue: {{currentRevenue}}
- Conversion Rate: {{currentCR}}
- CPL: {{currentCPL}}
- CPA: {{currentCPA}}

Scenario: {{scenarioName}}
- Target CR: {{targetCR}}
- Projected Sales: {{newSales}}
- Projected Revenue: {{newRevenue}}
- Sales Increase: {{salesIncrease}}
- Revenue Increase: {{revenueIncrease}}
- CPA Improvement: {{cpaImprovement}}

Captured: {{date}}`

export default function GHLFieldMapping({ isConnected }: FieldMappingProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingFields, setIsFetchingFields] = useState(false)
  const [customFields, setCustomFields] = useState<GHLCustomField[]>([])
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [notesEnabled, setNotesEnabled] = useState(false)
  const [notesTemplate, setNotesTemplate] = useState(DEFAULT_NOTE_TEMPLATE)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isConnected) {
      loadFieldMappings()
      loadCustomFields()
    }
  }, [isConnected])

  const loadCustomFields = async () => {
    setIsFetchingFields(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/ghl/custom-fields')

      if (!response.ok) {
        throw new Error('Failed to fetch custom fields')
      }

      const data = await response.json()
      setCustomFields(data.customFields?.customFields || [])
    } catch (error: any) {
      console.error('Load custom fields error:', error)
      setErrorMessage('Failed to load GHL custom fields. Make sure you are connected.')
    } finally {
      setIsFetchingFields(false)
    }
  }

  const loadFieldMappings = async () => {
    try {
      const response = await fetch('/api/admin/ghl/field-mappings')

      if (!response.ok) {
        throw new Error('Failed to fetch field mappings')
      }

      const data = await response.json()
      setMappings(data.mappings)
      setNotesEnabled(data.notesEnabled)
      setNotesTemplate(data.notesTemplate || DEFAULT_NOTE_TEMPLATE)
    } catch (error: any) {
      console.error('Load field mappings error:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('/api/admin/ghl/field-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mappings,
          notesEnabled,
          notesTemplate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save field mappings')
      }

      setSuccessMessage('Field mappings and notes configuration saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Save field mappings error:', error)
      setErrorMessage('Failed to save field mappings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMapping = (roiField: string, ghlFieldKey: string) => {
    setMappings(prev => ({
      ...prev,
      [roiField]: ghlFieldKey,
    }))
  }

  const insertPlaceholder = (placeholder: string) => {
    setNotesTemplate(prev => prev + ' ' + placeholder)
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg">
        <div className="flex items-center space-x-3 text-neutral-600">
          <AlertCircle className="h-5 w-5" />
          <p>Connect to GoHighLevel first to configure field mappings and notes.</p>
        </div>
      </div>
    )
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

      {/* Field Mappings Section */}
      <div className="border-t border-neutral-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-1">Custom Field Mappings</h4>
            <p className="text-sm text-neutral-600">
              Map ROI calculator data fields to your GoHighLevel custom fields
            </p>
          </div>
          <button
            onClick={loadCustomFields}
            disabled={isFetchingFields}
            className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isFetchingFields ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Fields
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {ROI_DATA_FIELDS.map((field) => (
            <div key={field.key} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{field.label}</p>
                  <p className="text-xs text-neutral-500 mt-1">{field.description}</p>
                </div>
                <div className="flex-1">
                  <select
                    value={mappings[field.key] || ''}
                    onChange={(e) => updateMapping(field.key, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="">-- Don't sync this field --</option>
                    {customFields.map((cf) => (
                      <option key={cf.id} value={cf.fieldKey}>
                        {cf.name} ({cf.fieldKey}) - {cf.dataType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Configuration Section */}
      <div className="border-t border-neutral-200 pt-6">
        <h4 className="font-semibold text-neutral-900 mb-4">Notes Configuration</h4>

        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notesEnabled}
              onChange={(e) => setNotesEnabled(e.target.checked)}
              className="w-5 h-5 text-brand-primary focus:ring-brand-primary border-neutral-300 rounded"
            />
            <span className="font-medium text-neutral-900">Add note to contact when lead is captured</span>
          </label>
        </div>

        {notesEnabled && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Note Template
              </label>
              <textarea
                value={notesTemplate}
                onChange={(e) => setNotesTemplate(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent font-mono"
                placeholder="Enter your note template..."
              />
            </div>

            <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
              <div className="flex items-start space-x-2 mb-3">
                <Info className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-brand-primary mb-1">Available Placeholders</p>
                  <p className="text-sm text-neutral-600 mb-2">
                    Click any placeholder below to add it to your template
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PLACEHOLDERS.map((placeholder) => (
                  <button
                    key={placeholder}
                    onClick={() => insertPlaceholder(placeholder)}
                    className="px-3 py-1 bg-white border border-brand-primary/30 text-brand-primary rounded text-xs font-mono hover:bg-brand-primary/10 transition"
                  >
                    {placeholder}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-4 border-t border-neutral-200">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  )
}
