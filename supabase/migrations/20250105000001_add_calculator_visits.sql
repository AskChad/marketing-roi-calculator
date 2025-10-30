-- Create calculator_visits table to track every visit to the calculator page
CREATE TABLE IF NOT EXISTS calculator_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_calculator_visits_tracking_id ON calculator_visits(tracking_id);
CREATE INDEX IF NOT EXISTS idx_calculator_visits_user_id ON calculator_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_calculator_visits_visited_at ON calculator_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_calculator_visits_ip_address ON calculator_visits(ip_address);

-- Add helpful comment
COMMENT ON TABLE calculator_visits IS 'Tracks every visit to the calculator page with IP, geolocation, and visitor identification.';

-- Enable Row Level Security
ALTER TABLE calculator_visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone
CREATE POLICY "Allow insert for all users" ON calculator_visits
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to view their own visits
CREATE POLICY "Users can view their own visits" ON calculator_visits
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
  );

-- Verify the migration worked
SELECT 'SUCCESS: calculator_visits table created!' AS status;
