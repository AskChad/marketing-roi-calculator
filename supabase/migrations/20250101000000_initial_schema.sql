-- Marketing ROI Calculator Database Schema
-- 12 Tables Total

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: lead_captures
-- Purpose: Store contact info from landing page (all visitors)
-- =====================================================
CREATE TABLE lead_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at DESC);

-- =====================================================
-- TABLE 2: users
-- Purpose: Registered accounts (requires phone)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  lead_capture_id UUID REFERENCES lead_captures(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- =====================================================
-- TABLE 3: calculator_sessions
-- Purpose: Current ROI data (baseline metrics)
-- =====================================================
CREATE TABLE calculator_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_capture_id UUID REFERENCES lead_captures(id),

  -- Input data
  time_period VARCHAR(10) NOT NULL CHECK (time_period IN ('weekly', 'monthly')),
  current_leads INTEGER NOT NULL,
  current_sales INTEGER NOT NULL,
  current_ad_spend DECIMAL(12, 2) NOT NULL,
  current_revenue DECIMAL(12, 2) NOT NULL,

  -- Calculated metrics
  current_conversion_rate DECIMAL(5, 2) NOT NULL,
  current_cpl DECIMAL(12, 2) NOT NULL,
  current_cpa DECIMAL(12, 2) NOT NULL,
  avg_revenue_per_sale DECIMAL(12, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calculator_sessions_user_id ON calculator_sessions(user_id);
CREATE INDEX idx_calculator_sessions_created_at ON calculator_sessions(created_at DESC);

-- =====================================================
-- TABLE 4: roi_scenarios
-- Purpose: Prospective scenarios (what-if analysis)
-- =====================================================
CREATE TABLE roi_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES calculator_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  scenario_name VARCHAR(255) NOT NULL,
  target_conversion_rate DECIMAL(5, 2) NOT NULL,

  -- Optional adjustments
  adjusted_leads INTEGER,
  adjusted_ad_spend DECIMAL(12, 2),

  -- Calculated prospective metrics
  new_sales INTEGER NOT NULL,
  new_cpl DECIMAL(12, 2) NOT NULL,
  new_cpa DECIMAL(12, 2) NOT NULL,
  new_revenue DECIMAL(12, 2) NOT NULL,

  -- Comparison metrics
  sales_increase INTEGER NOT NULL,
  revenue_increase DECIMAL(12, 2) NOT NULL,
  cpa_improvement_percent DECIMAL(5, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roi_scenarios_session_id ON roi_scenarios(session_id);
CREATE INDEX idx_roi_scenarios_user_id ON roi_scenarios(user_id);
CREATE INDEX idx_roi_scenarios_created_at ON roi_scenarios(created_at DESC);

-- =====================================================
-- TABLE 5: platforms
-- Purpose: Master list of advertising platforms
-- =====================================================
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate platforms
INSERT INTO platforms (name, slug, display_order) VALUES
  ('Facebook Ads', 'facebook', 1),
  ('Google Ads', 'google', 2),
  ('LinkedIn Ads', 'linkedin', 3),
  ('TikTok Ads', 'tiktok', 4),
  ('Instagram Ads', 'instagram', 5),
  ('Twitter Ads', 'twitter', 6),
  ('YouTube Ads', 'youtube', 7),
  ('Pinterest Ads', 'pinterest', 8),
  ('Snapchat Ads', 'snapchat', 9),
  ('Microsoft Ads', 'microsoft', 10),
  ('Other', 'other', 99);

-- =====================================================
-- TABLE 6: session_platforms
-- Purpose: Platform breakdown for current metrics
-- =====================================================
CREATE TABLE session_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES calculator_sessions(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,

  -- Per-platform current metrics
  platform_leads INTEGER NOT NULL,
  platform_sales INTEGER NOT NULL,
  platform_ad_spend DECIMAL(12, 2) NOT NULL,
  platform_revenue DECIMAL(12, 2) NOT NULL,

  -- Calculated per-platform metrics
  platform_conversion_rate DECIMAL(5, 2) NOT NULL,
  platform_cpl DECIMAL(12, 2) NOT NULL,
  platform_cpa DECIMAL(12, 2) NOT NULL,
  platform_roi DECIMAL(8, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, platform_id)
);

CREATE INDEX idx_session_platforms_session_id ON session_platforms(session_id);
CREATE INDEX idx_session_platforms_platform_id ON session_platforms(platform_id);

-- =====================================================
-- TABLE 7: scenario_platforms
-- Purpose: Platform breakdown for prospective scenarios
-- =====================================================
CREATE TABLE scenario_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID REFERENCES roi_scenarios(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,

  -- Per-platform prospective metrics
  platform_target_cr DECIMAL(5, 2) NOT NULL,
  platform_new_sales INTEGER NOT NULL,
  platform_new_cpl DECIMAL(12, 2) NOT NULL,
  platform_new_cpa DECIMAL(12, 2) NOT NULL,
  platform_new_revenue DECIMAL(12, 2) NOT NULL,
  platform_new_roi DECIMAL(8, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scenario_id, platform_id)
);

CREATE INDEX idx_scenario_platforms_scenario_id ON scenario_platforms(scenario_id);
CREATE INDEX idx_scenario_platforms_platform_id ON scenario_platforms(platform_id);

-- =====================================================
-- TABLE 8: ai_chat_conversations
-- Purpose: Chat sessions for logged-in users
-- =====================================================
CREATE TABLE ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX idx_ai_chat_conversations_created_at ON ai_chat_conversations(created_at DESC);

-- =====================================================
-- TABLE 9: ai_chat_messages
-- Purpose: Individual messages in chat conversations
-- =====================================================
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX idx_ai_chat_messages_created_at ON ai_chat_messages(created_at DESC);

-- =====================================================
-- TABLE 10: admin_settings
-- Purpose: Platform-wide admin configuration (GHL)
-- =====================================================
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate admin settings
INSERT INTO admin_settings (setting_key, setting_value) VALUES
  ('ghl_connected', 'false'),
  ('ghl_access_token', NULL),
  ('ghl_refresh_token', NULL),
  ('ghl_location_id', NULL);

-- =====================================================
-- TABLE 11: ghl_field_mappings
-- Purpose: Map database fields to GHL custom fields
-- =====================================================
CREATE TABLE ghl_field_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_field VARCHAR(100) NOT NULL,
  source_category VARCHAR(50) NOT NULL CHECK (source_category IN ('contact', 'current_metrics', 'prospective_metrics', 'comparison_metrics', 'platform_metrics', 'metadata')),
  ghl_field_id VARCHAR(255),
  ghl_field_name VARCHAR(255),
  mapping_type VARCHAR(20) NOT NULL CHECK (mapping_type IN ('field', 'note')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghl_field_mappings_source_field ON ghl_field_mappings(source_field);
CREATE INDEX idx_ghl_field_mappings_is_active ON ghl_field_mappings(is_active);

-- =====================================================
-- TABLE 12: ghl_sync_log
-- Purpose: Track all GHL sync operations
-- =====================================================
CREATE TABLE ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type VARCHAR(50) NOT NULL CHECK (sync_type IN ('contact', 'session', 'scenario', 'platform')),
  record_id UUID NOT NULL,
  ghl_contact_id VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error_message TEXT,
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghl_sync_log_record_id ON ghl_sync_log(record_id);
CREATE INDEX idx_ghl_sync_log_status ON ghl_sync_log(status);
CREATE INDEX idx_ghl_sync_log_created_at ON ghl_sync_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all user-facing tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Calculator sessions: users can see their own + admins see all
CREATE POLICY "Users can view own sessions"
  ON calculator_sessions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can create sessions"
  ON calculator_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ROI scenarios: users can see their own + admins see all
CREATE POLICY "Users can view own scenarios"
  ON roi_scenarios FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can create scenarios"
  ON roi_scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
  ON roi_scenarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios"
  ON roi_scenarios FOR DELETE
  USING (auth.uid() = user_id);

-- Session platforms: inherit session permissions
CREATE POLICY "Users can view own session platforms"
  ON session_platforms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM calculator_sessions cs
    WHERE cs.id = session_platforms.session_id
    AND (cs.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    ))
  ));

-- Scenario platforms: inherit scenario permissions
CREATE POLICY "Users can view own scenario platforms"
  ON scenario_platforms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM roi_scenarios rs
    WHERE rs.id = scenario_platforms.scenario_id
    AND (rs.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    ))
  ));

-- AI chat conversations: users can see their own + admins see all
CREATE POLICY "Users can view own conversations"
  ON ai_chat_conversations FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Users can create conversations"
  ON ai_chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI chat messages: inherit conversation permissions
CREATE POLICY "Users can view own messages"
  ON ai_chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_chat_conversations ac
    WHERE ac.id = ai_chat_messages.conversation_id
    AND (ac.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
    ))
  ));

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_lead_captures_updated_at BEFORE UPDATE ON lead_captures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calculator_sessions_updated_at BEFORE UPDATE ON calculator_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_scenarios_updated_at BEFORE UPDATE ON roi_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_platforms_updated_at BEFORE UPDATE ON session_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_platforms_updated_at BEFORE UPDATE ON scenario_platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_conversations_updated_at BEFORE UPDATE ON ai_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ghl_field_mappings_updated_at BEFORE UPDATE ON ghl_field_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETED: 12 Tables Created
-- =====================================================
-- 1. lead_captures
-- 2. users
-- 3. calculator_sessions
-- 4. roi_scenarios
-- 5. platforms
-- 6. session_platforms
-- 7. scenario_platforms
-- 8. ai_chat_conversations
-- 9. ai_chat_messages
-- 10. admin_settings
-- 11. ghl_field_mappings
-- 12. ghl_sync_log
