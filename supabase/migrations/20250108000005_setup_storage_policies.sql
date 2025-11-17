-- =====================================================
-- Storage Policies for Brand Assets
-- Purpose: Allow authenticated admins to upload brand assets
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;

-- Policy 1: Allow authenticated users to INSERT (upload) to brand-assets bucket
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Policy 2: Allow everyone to SELECT (view/download) from brand-assets bucket
CREATE POLICY "Public can view brand assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Policy 3: Allow authenticated users to UPDATE brand assets
CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets')
WITH CHECK (bucket_id = 'brand-assets');

-- Policy 4: Allow authenticated users to DELETE brand assets
CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');

-- Verify the migration worked
SELECT 'SUCCESS: Storage policies created for brand-assets bucket!' AS status;

-- Show created policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
