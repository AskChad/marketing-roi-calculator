-- =====================================================
-- STORAGE POLICIES FOR BRAND ASSETS
-- =====================================================
-- Copy this entire file and run it in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/sql/new
-- =====================================================

-- Step 1: Drop any existing policies (cleanup)
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;

-- Step 2: Create upload policy (allows admins to upload images)
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Step 3: Create view policy (allows everyone to see images)
CREATE POLICY "Public can view brand assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Step 4: Create update policy (allows admins to replace images)
CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets')
WITH CHECK (bucket_id = 'brand-assets');

-- Step 5: Create delete policy (allows admins to delete images)
CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');

-- =====================================================
-- VERIFICATION
-- =====================================================
-- This will show you all the policies that were just created

SELECT
  'SUCCESS! Storage policies created for brand-assets bucket' AS status,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%brand assets%';

-- Show the details of each policy
SELECT
  policyname,
  cmd AS operation,
  roles::text[] AS allowed_roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%brand assets%'
ORDER BY policyname;

-- =====================================================
-- AFTER RUNNING THIS SQL
-- =====================================================
-- ✅ Image uploads will work in the admin panel
-- ✅ Uploaded images will be publicly viewable
-- ✅ Admins can update and delete brand assets
-- =====================================================
