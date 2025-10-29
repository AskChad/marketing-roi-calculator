// Database types matching Supabase schema

export interface LeadCapture {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  company_name: string
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  phone: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  is_admin: boolean
  lead_capture_id: string | null
  created_at: string
  updated_at: string
}

export interface CalculatorSession {
  id: string
  user_id: string | null
  lead_capture_id: string | null

  // Input data
  time_period: 'weekly' | 'monthly'
  current_leads: number
  current_sales: number
  current_ad_spend: number
  current_revenue: number

  // Calculated metrics
  current_conversion_rate: number
  current_cpl: number
  current_cpa: number
  avg_revenue_per_sale: number

  created_at: string
  updated_at: string
}

export interface ROIScenario {
  id: string
  session_id: string | null
  user_id: string

  scenario_name: string
  target_conversion_rate: number

  // Optional adjustments
  adjusted_leads: number | null
  adjusted_ad_spend: number | null

  // Calculated prospective metrics
  new_sales: number
  new_cpl: number
  new_cpa: number
  new_revenue: number

  // Comparison metrics
  sales_increase: number
  revenue_increase: number
  cpa_improvement_percent: number

  created_at: string
  updated_at: string
}

export interface Platform {
  id: string
  name: string
  slug: string
  is_active: boolean
  display_order: number
  created_at: string
}

export interface SessionPlatform {
  id: string
  session_id: string
  platform_id: string

  // Per-platform current metrics
  platform_leads: number
  platform_sales: number
  platform_ad_spend: number
  platform_revenue: number

  // Calculated per-platform metrics
  platform_conversion_rate: number
  platform_cpl: number
  platform_cpa: number
  platform_roi: number

  created_at: string
  updated_at: string
}

export interface ScenarioPlatform {
  id: string
  scenario_id: string
  platform_id: string

  // Per-platform prospective metrics
  platform_target_cr: number
  platform_new_sales: number
  platform_new_cpl: number
  platform_new_cpa: number
  platform_new_revenue: number
  platform_new_roi: number

  created_at: string
  updated_at: string
}

export interface AIChatConversation {
  id: string
  user_id: string
  title: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number | null
  created_at: string
}

export interface AdminSetting {
  id: string
  setting_key: string
  setting_value: string | null
  encrypted: boolean
  created_at: string
  updated_at: string
}

export interface GHLFieldMapping {
  id: string
  source_field: string
  source_category: 'contact' | 'current_metrics' | 'prospective_metrics' | 'comparison_metrics' | 'platform_metrics' | 'metadata'
  ghl_field_id: string | null
  ghl_field_name: string | null
  mapping_type: 'field' | 'note'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GHLSyncLog {
  id: string
  sync_type: 'contact' | 'session' | 'scenario' | 'platform'
  record_id: string
  ghl_contact_id: string | null
  status: 'pending' | 'success' | 'failed'
  error_message: string | null
  request_payload: Record<string, any> | null
  response_payload: Record<string, any> | null
  created_at: string
}

// Database table names
export type Database = {
  public: {
    Tables: {
      lead_captures: {
        Row: LeadCapture
        Insert: Omit<LeadCapture, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeadCapture, 'id' | 'created_at' | 'updated_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      calculator_sessions: {
        Row: CalculatorSession
        Insert: Omit<CalculatorSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CalculatorSession, 'id' | 'created_at' | 'updated_at'>>
      }
      roi_scenarios: {
        Row: ROIScenario
        Insert: Omit<ROIScenario, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ROIScenario, 'id' | 'created_at' | 'updated_at'>>
      }
      platforms: {
        Row: Platform
        Insert: Omit<Platform, 'id' | 'created_at'>
        Update: Partial<Omit<Platform, 'id' | 'created_at'>>
      }
      session_platforms: {
        Row: SessionPlatform
        Insert: Omit<SessionPlatform, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SessionPlatform, 'id' | 'created_at' | 'updated_at'>>
      }
      scenario_platforms: {
        Row: ScenarioPlatform
        Insert: Omit<ScenarioPlatform, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ScenarioPlatform, 'id' | 'created_at' | 'updated_at'>>
      }
      ai_chat_conversations: {
        Row: AIChatConversation
        Insert: Omit<AIChatConversation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AIChatConversation, 'id' | 'created_at' | 'updated_at'>>
      }
      ai_chat_messages: {
        Row: AIChatMessage
        Insert: Omit<AIChatMessage, 'id' | 'created_at'>
        Update: Partial<Omit<AIChatMessage, 'id' | 'created_at'>>
      }
      admin_settings: {
        Row: AdminSetting
        Insert: Omit<AdminSetting, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AdminSetting, 'id' | 'created_at' | 'updated_at'>>
      }
      ghl_field_mappings: {
        Row: GHLFieldMapping
        Insert: Omit<GHLFieldMapping, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<GHLFieldMapping, 'id' | 'created_at' | 'updated_at'>>
      }
      ghl_sync_log: {
        Row: GHLSyncLog
        Insert: Omit<GHLSyncLog, 'id' | 'created_at'>
        Update: Partial<Omit<GHLSyncLog, 'id' | 'created_at'>>
      }
    }
  }
}
