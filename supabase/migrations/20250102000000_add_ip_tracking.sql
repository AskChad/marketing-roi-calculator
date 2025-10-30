-- Add IP tracking to existing tables
-- Migration: Add IP address and visit tracking

-- Add IP and visit count to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMPTZ;

-- Add IP and visit count to lead_captures table
ALTER TABLE lead_captures
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 1;

-- Create visit_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS visit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_capture_id UUID REFERENCES lead_captures(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  page_path VARCHAR(500),
  referrer VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visit_logs_user_id ON visit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_lead_capture_id ON visit_logs(lead_capture_id);
CREATE INDEX IF NOT EXISTS idx_visit_logs_ip_address ON visit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visit_logs_created_at ON visit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_ip_address ON users(last_ip_address);
CREATE INDEX IF NOT EXISTS idx_lead_captures_ip_address ON lead_captures(ip_address);

-- Enable RLS on visit_logs
ALTER TABLE visit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own visit logs, admins can see all
CREATE POLICY "Users can view own visit logs"
  ON visit_logs FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Comment on new columns
COMMENT ON COLUMN users.last_ip_address IS 'IP address from the most recent visit or login';
COMMENT ON COLUMN users.visit_count IS 'Total number of visits/logins by this user';
COMMENT ON COLUMN users.last_visit_at IS 'Timestamp of the most recent visit or login';
COMMENT ON COLUMN lead_captures.ip_address IS 'IP address when the lead was captured';
COMMENT ON COLUMN lead_captures.visit_count IS 'Number of visits before lead capture (starts at 1)';
COMMENT ON TABLE visit_logs IS 'Detailed log of all page visits by users and anonymous visitors';
