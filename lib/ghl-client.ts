import { createClient } from '@/lib/supabase/server'

interface GHLTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  locationId: string
}

/**
 * GoHighLevel API Client
 * Handles authentication, token refresh, and API calls
 */
export class GHLClient {
  private baseUrl = 'https://services.leadconnectorhq.com'

  /**
   * Get current GHL tokens from database
   */
  private async getTokens(): Promise<GHLTokens | null> {
    const supabase = await createClient()

    const { data: settings } = await (supabase
      .from('admin_settings') as any)
      .select('setting_key, setting_value')
      .in('setting_key', [
        'ghl_access_token',
        'ghl_refresh_token',
        'ghl_token_expires_at',
        'ghl_location_id',
      ])

    if (!settings || settings.length === 0) {
      return null
    }

    const settingsMap = (settings as any[]).reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    return {
      accessToken: settingsMap.ghl_access_token || '',
      refreshToken: settingsMap.ghl_refresh_token || '',
      expiresAt: parseInt(settingsMap.ghl_token_expires_at || '0'),
      locationId: settingsMap.ghl_location_id || '',
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      const supabase = await createClient()

      // Get credentials from database (fallback to environment)
      const { data: credentials } = await (supabase
        .from('admin_settings') as any)
        .select('setting_key, setting_value')
        .in('setting_key', ['ghl_client_id', 'ghl_client_secret'])

      const credentialsMap = ((credentials as any[]) || []).reduce((acc: Record<string, string>, setting: any) => {
        acc[setting.setting_key] = setting.setting_value
        return acc
      }, {} as Record<string, string>)

      const clientId = credentialsMap.ghl_client_id || process.env.GHL_CLIENT_ID
      const clientSecret = credentialsMap.ghl_client_secret || process.env.GHL_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        throw new Error('GHL OAuth credentials not configured')
      }

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const tokenData = await response.json()

      // Update tokens in database
      const settings = [
        { setting_key: 'ghl_access_token', setting_value: tokenData.access_token },
        { setting_key: 'ghl_refresh_token', setting_value: tokenData.refresh_token || refreshToken },
        { setting_key: 'ghl_token_expires_at', setting_value: String(Date.now() + (tokenData.expires_in * 1000)) },
      ]

      await (supabase
        .from('admin_settings') as any)
        .upsert(settings, { onConflict: 'setting_key' })

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  /**
   * Get valid access token (refreshes if needed)
   */
  private async getValidAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens()

    if (!tokens) {
      return null
    }

    // Check if token is expired or will expire in next 5 minutes
    const now = Date.now()
    const bufferTime = 5 * 60 * 1000 // 5 minutes

    if (tokens.expiresAt && (now >= tokens.expiresAt - bufferTime)) {
      // Token expired or expiring soon, refresh it
      const refreshed = await this.refreshAccessToken(tokens.refreshToken)

      if (!refreshed) {
        return null
      }

      // Get new token
      const newTokens = await this.getTokens()
      return newTokens?.accessToken || null
    }

    return tokens.accessToken
  }

  /**
   * Make authenticated API call to GHL
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getValidAccessToken()

    if (!accessToken) {
      throw new Error('No valid GHL access token available')
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28', // GHL API version
        ...options.headers,
      },
    })

    // If unauthorized, try refreshing token once and retry
    if (response.status === 401) {
      const tokens = await this.getTokens()
      if (tokens) {
        const refreshed = await this.refreshAccessToken(tokens.refreshToken)
        if (refreshed) {
          // Retry request with new token
          const newAccessToken = await this.getValidAccessToken()
          if (newAccessToken) {
            return fetch(url, {
              ...options,
              headers: {
                'Authorization': `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
                'Version': '2021-07-28',
                ...options.headers,
              },
            })
          }
        }
      }
    }

    return response
  }

  /**
   * Create a contact in GHL
   */
  async createContact(locationId: string, contactData: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    companyName?: string
    customFields?: Record<string, any>
    tags?: string[]
  }): Promise<any> {
    const response = await this.request(`/contacts/`, {
      method: 'POST',
      body: JSON.stringify({
        locationId,
        ...contactData,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Update a contact in GHL
   */
  async updateContact(contactId: string, contactData: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    companyName?: string
    customFields?: Record<string, any>
    tags?: string[]
  }): Promise<any> {
    const response = await this.request(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    })

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Search for a contact by email
   */
  async searchContactByEmail(locationId: string, email: string): Promise<any> {
    const response = await this.request(
      `/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}`
    )

    if (!response.ok) {
      throw new Error(`Failed to search contact: ${response.statusText}`)
    }

    const data = await response.json()
    return data.contacts?.[0] || null
  }

  /**
   * Get location custom fields
   */
  async getCustomFields(locationId: string): Promise<any> {
    const response = await this.request(
      `/locations/${locationId}/customFields`
    )

    if (!response.ok) {
      throw new Error(`Failed to get custom fields: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Add a note to a contact
   */
  async addNote(contactId: string, note: string): Promise<any> {
    const response = await this.request(`/contacts/${contactId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        body: note,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get field mappings from admin settings
   */
  async getFieldMappings(): Promise<Record<string, string>> {
    const supabase = await createClient()

    const { data: mappingData } = await (supabase
      .from('admin_settings') as any)
      .select('setting_value')
      .eq('setting_key', 'ghl_field_mappings')
      .single()

    if (!mappingData?.setting_value) {
      // Return default mappings if none configured
      return {
        currentLeads: 'roi_current_leads',
        currentSales: 'roi_current_sales',
        currentAdSpend: 'roi_current_ad_spend',
        currentRevenue: 'roi_current_revenue',
        currentCR: 'roi_current_cr',
        currentCPL: 'roi_current_cpl',
        currentCPA: 'roi_current_cpa',
        scenarioName: 'roi_scenario_name',
        targetCR: 'roi_target_cr',
        newSales: 'roi_new_sales',
        newRevenue: 'roi_new_revenue',
        salesIncrease: 'roi_sales_increase',
        revenueIncrease: 'roi_revenue_increase',
        cpaImprovement: 'roi_cpa_improvement',
      }
    }

    return JSON.parse(mappingData.setting_value)
  }

  /**
   * Get notes configuration
   */
  async getNotesConfig(): Promise<{ enabled: boolean; template: string }> {
    const supabase = await createClient()

    const { data: notesData } = await (supabase
      .from('admin_settings') as any)
      .select('setting_key, setting_value')
      .in('setting_key', ['ghl_notes_enabled', 'ghl_notes_template'])

    const settings = ((notesData as any[]) || []).reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    return {
      enabled: settings.ghl_notes_enabled === 'true',
      template: settings.ghl_notes_template || '',
    }
  }

  /**
   * Format note from template
   */
  formatNote(template: string, leadData: any): string {
    let note = template

    // Replace placeholders
    const replacements: Record<string, any> = {
      '{{firstName}}': leadData.firstName || '',
      '{{lastName}}': leadData.lastName || '',
      '{{email}}': leadData.email || '',
      '{{phone}}': leadData.phone || '',
      '{{companyName}}': leadData.companyName || '',
      '{{currentLeads}}': leadData.currentLeads || '',
      '{{currentSales}}': leadData.currentSales || '',
      '{{currentAdSpend}}': leadData.currentAdSpend ? `$${leadData.currentAdSpend.toLocaleString()}` : '',
      '{{currentRevenue}}': leadData.currentRevenue ? `$${leadData.currentRevenue.toLocaleString()}` : '',
      '{{currentCR}}': leadData.currentCR ? `${leadData.currentCR}%` : '',
      '{{currentCPL}}': leadData.currentCPL ? `$${leadData.currentCPL}` : '',
      '{{currentCPA}}': leadData.currentCPA ? `$${leadData.currentCPA}` : '',
      '{{scenarioName}}': leadData.scenarioName || '',
      '{{targetCR}}': leadData.targetCR ? `${leadData.targetCR}%` : '',
      '{{newSales}}': leadData.newSales || '',
      '{{newRevenue}}': leadData.newRevenue ? `$${leadData.newRevenue.toLocaleString()}` : '',
      '{{salesIncrease}}': leadData.salesIncrease || '',
      '{{revenueIncrease}}': leadData.revenueIncrease ? `$${leadData.revenueIncrease.toLocaleString()}` : '',
      '{{cpaImprovement}}': leadData.cpaImprovement ? `$${leadData.cpaImprovement}` : '',
      '{{date}}': new Date().toLocaleString(),
    }

    for (const [placeholder, value] of Object.entries(replacements)) {
      note = note.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return note
  }

  /**
   * Create or update contact with ROI data
   */
  async syncROIData(locationId: string, leadData: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    companyName?: string
    currentLeads?: number
    currentSales?: number
    currentAdSpend?: number
    currentRevenue?: number
    currentCR?: number
    currentCPL?: number
    currentCPA?: number
    scenarioName?: string
    targetCR?: number
    newSales?: number
    newRevenue?: number
    salesIncrease?: number
    revenueIncrease?: number
    cpaImprovement?: number
  }): Promise<any> {
    // Get field mappings and notes config
    const fieldMappings = await this.getFieldMappings()
    const notesConfig = await this.getNotesConfig()

    // Search for existing contact
    const existingContact = await this.searchContactByEmail(locationId, leadData.email)

    // Build custom fields using mappings
    const customFields: Record<string, any> = {}

    const dataFieldMap: Record<string, any> = {
      currentLeads: leadData.currentLeads,
      currentSales: leadData.currentSales,
      currentAdSpend: leadData.currentAdSpend,
      currentRevenue: leadData.currentRevenue,
      currentCR: leadData.currentCR,
      currentCPL: leadData.currentCPL,
      currentCPA: leadData.currentCPA,
      scenarioName: leadData.scenarioName,
      targetCR: leadData.targetCR,
      newSales: leadData.newSales,
      newRevenue: leadData.newRevenue,
      salesIncrease: leadData.salesIncrease,
      revenueIncrease: leadData.revenueIncrease,
      cpaImprovement: leadData.cpaImprovement,
    }

    // Map data to custom fields
    for (const [dataField, ghlField] of Object.entries(fieldMappings)) {
      if (ghlField && dataFieldMap[dataField] !== undefined) {
        customFields[ghlField] = dataFieldMap[dataField]
      }
    }

    const contactData = {
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      companyName: leadData.companyName,
      customFields,
      tags: ['roi-calculator', 'lead-capture'],
    }

    let contact
    if (existingContact) {
      // Update existing contact
      contact = await this.updateContact(existingContact.id, contactData)
    } else {
      // Create new contact
      contact = await this.createContact(locationId, contactData)
    }

    // Add note if enabled
    if (notesConfig.enabled && notesConfig.template && contact.contact?.id) {
      const note = this.formatNote(notesConfig.template, leadData)
      await this.addNote(contact.contact.id, note)
    }

    return contact
  }
}

// Export singleton instance
export const ghlClient = new GHLClient()
