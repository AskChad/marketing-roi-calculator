-- =====================================================
-- Demo Calculator System
-- Purpose: Allow admins to create demo scenarios with company names
-- =====================================================

-- TABLE: demo_scenarios
-- Stores demo scenarios created by admins (separate from user scenarios)
CREATE TABLE demo_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Admin who created the demo
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Company information (required for demos)
  company_name VARCHAR(255) NOT NULL,

  -- Scenario details
  scenario_name VARCHAR(255) NOT NULL,

  -- Current metrics (baseline)
  time_period VARCHAR(10) NOT NULL CHECK (time_period IN ('weekly', 'monthly')),
  current_leads INTEGER NOT NULL,
  current_sales INTEGER NOT NULL,
  current_ad_spend DECIMAL(12, 2) NOT NULL,
  current_revenue DECIMAL(12, 2) NOT NULL,

  -- Calculated current metrics
  current_conversion_rate DECIMAL(5, 2) NOT NULL,
  current_cpl DECIMAL(12, 2) NOT NULL,
  current_cpa DECIMAL(12, 2) NOT NULL,
  avg_revenue_per_sale DECIMAL(12, 2) NOT NULL,

  -- Projected metrics (what-if scenario)
  target_conversion_rate DECIMAL(5, 2) NOT NULL,
  adjusted_leads INTEGER,
  adjusted_ad_spend DECIMAL(12, 2),

  -- Calculated projected metrics
  new_sales INTEGER NOT NULL,
  new_cpl DECIMAL(12, 2) NOT NULL,
  new_cpa DECIMAL(12, 2) NOT NULL,
  new_revenue DECIMAL(12, 2) NOT NULL,

  -- Comparison metrics
  sales_increase INTEGER NOT NULL,
  revenue_increase DECIMAL(12, 2) NOT NULL,
  cpa_improvement_percent DECIMAL(5, 2) NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_demo_scenarios_admin_id ON demo_scenarios(admin_id);
CREATE INDEX idx_demo_scenarios_company_name ON demo_scenarios(company_name);
CREATE INDEX idx_demo_scenarios_created_at ON demo_scenarios(created_at DESC);

-- Create update trigger
CREATE TRIGGER update_demo_scenarios_updated_at BEFORE UPDATE ON demo_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies for demo_scenarios table
-- =====================================================

ALTER TABLE demo_scenarios ENABLE ROW LEVEL SECURITY;

-- Admins can view all demo scenarios
CREATE POLICY "Admins can view all demo scenarios"
  ON demo_scenarios FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Admins can create demo scenarios
CREATE POLICY "Admins can create demo scenarios"
  ON demo_scenarios FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Admins can update demo scenarios
CREATE POLICY "Admins can update demo scenarios"
  ON demo_scenarios FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Admins can delete demo scenarios
CREATE POLICY "Admins can delete demo scenarios"
  ON demo_scenarios FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

COMMENT ON TABLE demo_scenarios IS 'Demo scenarios created by admins with company names (separate from user scenarios)';
