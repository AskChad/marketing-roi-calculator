# Brand Image Upload - Complete Setup Guide

## ✅ Current Status

### Working Components
1. **Storage Bucket** ✓
   - Bucket name: `brand-assets`
   - Status: Public (configured correctly)
   - Location: Supabase Storage

2. **Upload API Route** ✓
   - Endpoint: `/api/admin/brands/upload`
   - File validation: PNG, JPG, SVG, WEBP, ICO
   - Max size: 5MB
   - Admin authentication required

3. **Frontend Component** ✓
   - Component: `ImageUpload.tsx`
   - Features: Preview, drag-and-drop ready
   - File types: Logo, Dark Logo, Favicon

4. **Test Results** ✓
   - Upload test: PASSED
   - Storage verification: PASSED
   - Public URL generation: PASSED

## ⚠️ Required Setup

### Storage RLS Policies (IMPORTANT!)

For image uploads to work from the admin panel, you need to apply storage policies.

**Option 1: Via Supabase Dashboard SQL Editor (Recommended)**

1. Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
2. Create a new query
3. Copy and paste this SQL:

\`\`\`sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;

-- Policy 1: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

-- Policy 2: Allow everyone to view
CREATE POLICY "Public can view brand assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Policy 3: Allow authenticated users to update
CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'brand-assets')
WITH CHECK (bucket_id = 'brand-assets');

-- Policy 4: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'brand-assets');
\`\`\`

4. Click "Run" to execute

**Option 2: Via Storage UI**

1. Go to: Storage → brand-assets → Policies tab
2. Create 4 new policies:

**Policy 1 - Upload**
- Name: `Authenticated users can upload brand assets`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'brand-assets'`

**Policy 2 - View**
- Name: `Public can view brand assets`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'brand-assets'`

**Policy 3 - Update**
- Name: `Authenticated users can update brand assets`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'brand-assets'`
- WITH CHECK expression: `bucket_id = 'brand-assets'`

**Policy 4 - Delete**
- Name: `Authenticated users can delete brand assets`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'brand-assets'`

## 🎯 How to Use

### Uploading Brand Images

1. Log in as an admin user
2. Navigate to Admin → Brands
3. Create or edit a brand
4. In the "Branding Assets" section:
   - **Logo**: Main brand logo (recommended: PNG with transparent background)
   - **Dark Logo**: Logo for dark mode (optional)
   - **Favicon**: Browser favicon (recommended: 32x32px ICO or PNG)

5. Click "Upload Image" and select your file
6. Image will upload and preview automatically
7. Click "Save Brand" to persist the changes

### Supported File Types
- PNG (recommended for logos with transparency)
- JPG/JPEG
- SVG (vector graphics)
- WEBP
- ICO (for favicons)

### File Size Limits
- Maximum: 5MB per file
- Recommended: Keep under 500KB for best performance

### File Naming
Files are automatically renamed to:
\`{brandId}/{fileType}-{timestamp}.{extension}\`

Example: `a1b2c3d4-e5f6-7890/logo-1704902400000.png`

## 🔍 Verification Scripts

Several utility scripts are available in `/scripts`:

1. **Check Storage Bucket**
   \`\`\`bash
   node scripts/check-storage-bucket.js
   \`\`\`

2. **Test Image Upload**
   \`\`\`bash
   node scripts/test-image-upload.js
   \`\`\`

3. **Check Storage Policies**
   \`\`\`bash
   node scripts/check-storage-policies.js
   \`\`\`

## 🐛 Troubleshooting

### Upload fails with "Unauthorized" error
**Cause**: User is not logged in or not an admin
**Solution**: Ensure you're logged in as a user with `is_admin = true`

### Upload fails with "Permission denied" error
**Cause**: Storage RLS policies not set up
**Solution**: Apply the storage policies (see "Required Setup" above)

### Image uploads but doesn't display
**Cause**: Public access not configured
**Solution**:
1. Verify bucket is public (it is)
2. Check the "Public can view brand assets" policy exists

### Upload fails with "File too large" error
**Cause**: File exceeds 5MB limit
**Solution**: Compress or resize your image before uploading

## 📁 Related Files

- `/components/admin/ImageUpload.tsx` - Upload component
- `/app/api/admin/brands/upload/route.ts` - Upload API handler
- `/app/api/admin/brands/route.ts` - Brand CRUD operations
- `/supabase/migrations/20250108000005_setup_storage_policies.sql` - Storage policies migration

## 🎨 Best Practices

1. **Logo Files**
   - Use PNG with transparent background
   - Recommended size: 200-400px width
   - Keep file size under 200KB

2. **Favicons**
   - Use 32x32px or 64x64px
   - ICO format preferred for browser compatibility
   - Can also use PNG

3. **Dark Mode Logos**
   - Optional but recommended for dark themes
   - Use white or light-colored version of your logo
   - Same dimensions as regular logo

## 🔒 Security Notes

- Only authenticated admin users can upload images
- File type validation prevents malicious file uploads
- File size limits prevent storage abuse
- Public bucket allows images to be viewed without authentication
- All uploads are scoped to brand IDs for organization
