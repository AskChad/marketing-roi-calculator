-- =====================================================
-- Multi-Tenant Branding System
-- Purpose: Allow admins to white-label the platform
-- =====================================================

-- TABLE: brands
-- Stores brand configurations for multi-tenant setup
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Theme Colors
  color_primary VARCHAR(7) DEFAULT '#0066CC', -- Brand primary color (hex)
  color_secondary VARCHAR(7) DEFAULT '#7C3AED', -- Brand secondary color (hex)
  color_accent VARCHAR(7) DEFAULT '#F59E0B', -- Brand accent color (hex)
  color_success VARCHAR(7) DEFAULT '#10B981', -- Success color (hex)
  color_error VARCHAR(7) DEFAULT '#EF4444', -- Error color (hex)

  -- Branding Assets
  logo_url TEXT, -- Main logo URL
  logo_dark_url TEXT, -- Dark mode logo URL (optional)
  favicon_url TEXT, -- Favicon URL

  -- Landing Page Copy
  hero_title TEXT DEFAULT 'Marketing ROI Calculator',
  hero_subtitle TEXT DEFAULT 'Calculate your current marketing performance and model prospective scenarios to maximize ROI',
  hero_cta_text VARCHAR(100) DEFAULT 'Get Started Free',
  hero_secondary_cta_text VARCHAR(100) DEFAULT 'View Demo',

  -- Features Section
  feature_1_title VARCHAR(100) DEFAULT 'Real-Time Analysis',
  feature_1_description TEXT DEFAULT 'Calculate ROI instantly with our advanced metrics engine',
  feature_2_title VARCHAR(100) DEFAULT 'Scenario Modeling',
  feature_2_description TEXT DEFAULT 'Model what-if scenarios to optimize your marketing spend',
  feature_3_title VARCHAR(100) DEFAULT 'AI-Powered Insights',
  feature_3_description TEXT DEFAULT 'Get intelligent recommendations powered by AI',

  -- Footer & Legal
  company_name VARCHAR(255),
  support_email VARCHAR(255),
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_brands_domain ON brands(domain);
CREATE INDEX idx_brands_subdomain ON brands(subdomain);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- Insert default brand
INSERT INTO brands (
  name,
  domain,
  subdomain,
  color_primary,
  color_secondary,
  color_accent,
  company_name,
  support_email
) VALUES (
  'Marketing ROI Calculator',
  'localhost:3000',
  'default',
  '#0066CC',
  '#7C3AED',
  '#F59E0B',
  'Marketing ROI Calculator',
  'support@marketingroicalculator.com'
);

-- =====================================================
-- Add brand_id to existing tables
-- =====================================================

-- Add brand_id to users (original brand they signed up on)
ALTER TABLE users ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX idx_users_brand_id ON users(brand_id);

-- Add brand_id to lead_captures (brand they captured on)
ALTER TABLE lead_captures ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX idx_lead_captures_brand_id ON lead_captures(brand_id);

-- Add brand_id to calculator_visits (brand of that specific visit)
ALTER TABLE calculator_visits ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX idx_calculator_visits_brand_id ON calculator_visits(brand_id);

-- Add brand_id to roi_scenarios
ALTER TABLE roi_scenarios ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX idx_roi_scenarios_brand_id ON roi_scenarios(brand_id);

-- =====================================================
-- Update triggers
-- =====================================================

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies for brands table
-- =====================================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Admins can view all brands
CREATE POLICY "Admins can view all brands"
  ON brands FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Admins can manage brands
CREATE POLICY "Admins can insert brands"
  ON brands FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

CREATE POLICY "Admins can update brands"
  ON brands FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Public can view active brands (for domain matching)
CREATE POLICY "Anyone can view active brands"
  ON brands FOR SELECT
  USING (is_active = TRUE);

-- =====================================================
-- Helper function to get brand by domain
-- =====================================================

CREATE OR REPLACE FUNCTION get_brand_by_domain(p_domain TEXT)
RETURNS UUID AS $$
DECLARE
  v_brand_id UUID;
BEGIN
  SELECT id INTO v_brand_id
  FROM brands
  WHERE domain = p_domain AND is_active = TRUE
  LIMIT 1;

  -- If not found by exact domain, try subdomain
  IF v_brand_id IS NULL THEN
    SELECT id INTO v_brand_id
    FROM brands
    WHERE subdomain = p_domain AND is_active = TRUE
    LIMIT 1;
  END IF;

  -- If still not found, return default brand
  IF v_brand_id IS NULL THEN
    SELECT id INTO v_brand_id
    FROM brands
    WHERE subdomain = 'default' AND is_active = TRUE
    LIMIT 1;
  END IF;

  RETURN v_brand_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE brands IS 'Multi-tenant branding configurations for white-label deployment';
COMMENT ON FUNCTION get_brand_by_domain IS 'Returns brand_id for a given domain or subdomain';
