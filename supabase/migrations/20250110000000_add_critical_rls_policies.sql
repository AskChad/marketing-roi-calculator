-- Migration: Add RLS Policies to Critical Tables
-- Date: 2025-01-10
-- Purpose: Fix SEC-003 - Add missing RLS policies to prevent unauthorized access

-- =====================================================
-- ADMIN SETTINGS - Contains API keys, secrets, configuration
-- CRITICAL: Only admins should access this table
-- =====================================================

-- Admin settings - Admin read only
CREATE POLICY "Only admins can view admin settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- Admin settings - Admin write only
CREATE POLICY "Only admins can insert admin settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can update admin settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

CREATE POLICY "Only admins can delete admin settings"
  ON admin_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = TRUE
    )
  );

-- =====================================================
-- LEAD CAPTURES - Contains contact information
-- CRITICAL: No direct access, only via API routes
-- =====================================================

-- Lead captures - No direct database access
-- All access must go through API routes for proper tracking
CREATE POLICY "No direct select on lead captures"
  ON lead_captures FOR SELECT
  TO authenticated
  USING (false);

CREATE POLICY "No direct insert on lead captures"
  ON lead_captures FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on lead captures"
  ON lead_captures FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No direct delete on lead captures"
  ON lead_captures FOR DELETE
  TO authenticated
  USING (false);

-- Note: API routes use service role key to bypass RLS

-- =====================================================
-- GHL FIELD MAPPINGS - GHL integration configuration
-- CRITICAL: Admin only
-- =====================================================

-- Check if table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ghl_field_mappings') THEN
    -- GHL field mappings - Admin only
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ghl_field_mappings' AND policyname = 'Only admins can view ghl field mappings') THEN
      CREATE POLICY "Only admins can view ghl field mappings"
        ON ghl_field_mappings FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ghl_field_mappings' AND policyname = 'Only admins can manage ghl field mappings') THEN
      CREATE POLICY "Only admins can manage ghl field mappings"
        ON ghl_field_mappings FOR ALL
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
          )
        );
    END IF;
  END IF;
END $$;

-- =====================================================
-- GHL SYNC LOG - Contains sync payloads with sensitive data
-- CRITICAL: Admin only
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ghl_sync_log') THEN
    -- GHL sync log - Admin only
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ghl_sync_log' AND policyname = 'Only admins can view ghl sync log') THEN
      CREATE POLICY "Only admins can view ghl sync log"
        ON ghl_sync_log FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ghl_sync_log' AND policyname = 'Only admins can delete ghl sync log') THEN
      CREATE POLICY "Only admins can delete ghl sync log"
        ON ghl_sync_log FOR DELETE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
          )
        );
    END IF;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify RLS is enabled on critical tables
DO $$
BEGIN
  -- Check admin_settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'admin_settings'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on admin_settings table';
  END IF;

  -- Check lead_captures
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE tablename = 'lead_captures'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on lead_captures table';
  END IF;
END $$;

-- Log success
SELECT 'SUCCESS: Critical RLS policies added!' AS status;

COMMENT ON POLICY "Only admins can view admin settings" ON admin_settings IS
  'SEC-003 Fix: Prevent unauthorized access to admin settings containing API keys and secrets';

COMMENT ON POLICY "No direct select on lead captures" ON lead_captures IS
  'SEC-003 Fix: All lead access must go through API routes for proper tracking and validation';
