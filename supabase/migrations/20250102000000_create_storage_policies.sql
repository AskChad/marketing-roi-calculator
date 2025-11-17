-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates" ON storage.objects;

-- Allow authenticated admin users to upload to brand-assets bucket
CREATE POLICY "Allow admin uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' AND
  (SELECT is_admin FROM public.users WHERE users.id = auth.uid()) = true
);

-- Allow anyone to read from brand-assets bucket (since it's public)
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Allow admin users to delete files from brand-assets bucket
CREATE POLICY "Allow admin deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (SELECT is_admin FROM public.users WHERE users.id = auth.uid()) = true
);

-- Allow admin users to update files in brand-assets bucket
CREATE POLICY "Allow admin updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  (SELECT is_admin FROM public.users WHERE users.id = auth.uid()) = true
)
WITH CHECK (
  bucket_id = 'brand-assets' AND
  (SELECT is_admin FROM public.users WHERE users.id = auth.uid()) = true
);
