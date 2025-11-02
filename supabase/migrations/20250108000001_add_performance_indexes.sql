-- Add performance indexes for frequently queried columns
-- This migration adds indexes to improve query performance across all tables

-- Brands table indexes
CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands(domain) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_subdomain ON brands(subdomain) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin) WHERE is_admin = true;

-- ROI Scenarios table indexes
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_user_created ON roi_scenarios(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_scenarios_created ON roi_scenarios(created_at DESC);

-- Calculator Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_calculator_sessions_user ON calculator_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_sessions_created ON calculator_sessions(created_at DESC);

-- Calculator Visits table indexes (already have some, adding more)
CREATE INDEX IF NOT EXISTS idx_calculator_visits_user ON calculator_visits(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calculator_visits_tracking ON calculator_visits(tracking_id);
CREATE INDEX IF NOT EXISTS idx_calculator_visits_visited ON calculator_visits(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculator_visits_brand ON calculator_visits(brand_id) WHERE brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calculator_visits_country ON calculator_visits(country) WHERE country IS NOT NULL;

-- Lead Captures table indexes
CREATE INDEX IF NOT EXISTS idx_lead_captures_tracking ON lead_captures(tracking_id);
CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON lead_captures(email);
CREATE INDEX IF NOT EXISTS idx_lead_captures_created ON lead_captures(created_at DESC);

-- Demo Scenarios table indexes
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_user ON demo_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_created ON demo_scenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_scenarios_company ON demo_scenarios(company_name);

-- Session Platforms table indexes
CREATE INDEX IF NOT EXISTS idx_session_platforms_session ON session_platforms(session_id);
CREATE INDEX IF NOT EXISTS idx_session_platforms_platform ON session_platforms(platform_id);

-- Scenario Platforms table indexes
CREATE INDEX IF NOT EXISTS idx_scenario_platforms_session ON scenario_platforms(session_id);
CREATE INDEX IF NOT EXISTS idx_scenario_platforms_platform ON scenario_platforms(platform_id);

-- Admin Settings table indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- Add comments for documentation
COMMENT ON INDEX idx_brands_domain IS 'Fast lookup for brand by domain (used on every page load)';
COMMENT ON INDEX idx_brands_subdomain IS 'Fast lookup for brand by subdomain fallback';
COMMENT ON INDEX idx_roi_scenarios_user_created IS 'Composite index for user dashboard queries';
COMMENT ON INDEX idx_calculator_visits_visited IS 'Fast sorting for admin visits table';
COMMENT ON INDEX idx_calculator_visits_tracking IS 'Fast lookup for visit tracking updates';

-- Verify the migration worked
SELECT 'SUCCESS: Performance indexes added to all tables!' AS status;
