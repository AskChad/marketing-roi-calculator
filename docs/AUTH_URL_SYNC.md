# Automatic Auth URL Synchronization

This system automatically syncs all brand domains to Supabase authentication redirect URLs whenever brands are created or updated.

## Why This Matters

When users sign up or reset passwords, Supabase sends email confirmation links. These links must redirect to approved URLs. Without proper configuration, emails would redirect to `localhost:3000` instead of your production domain.

## How It Works

1. **Automatic Sync**: When you create or update a brand, the system automatically syncs all active brand domains to Supabase auth configuration
2. **All Domains Included**: Main domains, www variants, and subdomains are all added to the allow list
3. **Vercel Previews**: Preview deployments are also included for testing

## Setup Instructions

### Step 1: Generate Supabase Management API Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate New Token"**
3. Name: `Brand Domain Management`
4. Scopes: Select **All** (or minimum: projects read/write)
5. Click **Generate Token**
6. **Copy the token** (you'll only see it once!)

### Step 2: Add Token to Environment Variables

#### Local Development (.env.local)

```bash
SUPABASE_MANAGEMENT_TOKEN=sbp_your_token_here
```

#### Vercel (Production)

```bash
# Add to Vercel environment variables
vercel env add SUPABASE_MANAGEMENT_TOKEN production
# Paste your token when prompted

# Also add to preview and development
vercel env add SUPABASE_MANAGEMENT_TOKEN preview
vercel env add SUPABASE_MANAGEMENT_TOKEN development
```

Or via Vercel Dashboard:
1. Go to: https://vercel.com/ask-chad-llc/marketing-roi-calculator/settings/environment-variables
2. Click **Add New**
3. Name: `SUPABASE_MANAGEMENT_TOKEN`
4. Value: Paste your token
5. Environments: Select **Production, Preview, Development**
6. Click **Save**

### Step 3: Redeploy

```bash
vercel --prod
```

## Usage

### Automatic Sync (Recommended)

The system automatically syncs when:
- ✅ A new brand is created
- ✅ A brand is updated
- ✅ A brand domain is changed

**No manual action needed!**

### Manual Sync

If you need to manually trigger a sync:

#### Via API Endpoint

```bash
curl -X POST https://www.roicalculator.app/api/admin/sync-auth-urls
```

#### Via Script

```bash
node scripts/sync-auth-urls.js
```

## What Gets Synced

For each active brand, the following URLs are added to Supabase redirect allow list:

- **Main domain**: `https://example.com/**`
- **WWW variant**: `https://www.example.com/**`
- **Subdomain** (if configured): `https://subdomain.example.com/**`
- **Base URLs**: Your main production URL(s)
- **Vercel previews**: `https://*.vercel.app/**`

## Example

If you have these brands:

1. **Marketing ROI Calculator** - domain: `roicalculator.app`, subdomain: `default`
2. **Goldmine AI** - domain: `goldminedata.io`, subdomain: `roi`
3. **Ask Chad** - domain: `askchad.net`, subdomain: none

The system will configure these redirect URLs:

```
https://www.roicalculator.app/**
https://roicalculator.app/**
https://default.roicalculator.app/**
https://goldminedata.io/**
https://www.goldminedata.io/**
https://roi.goldminedata.io/**
https://askchad.net/**
https://www.askchad.net/**
https://*.vercel.app/**
```

## Verification

### Check Configuration Status

```bash
curl https://www.roicalculator.app/api/admin/sync-auth-urls
```

### View Logs

Check Vercel logs after creating a brand:

```bash
vercel logs --follow
```

You should see:
```
✅ Auth URLs synced successfully
```

### Test Email Confirmation

1. Create a test user account
2. Check the confirmation email
3. The link should point to your production domain, not localhost

## Troubleshooting

### Token Not Configured Warning

If you see:
```
⚠️ SUPABASE_MANAGEMENT_TOKEN not configured, skipping auth URL sync
```

**Solution**: Add the token to environment variables (see Setup Step 2)

### Sync Failed Error

If you see:
```
⚠️ Auth URL sync failed
```

**Possible causes:**
1. Invalid or expired management token
2. Insufficient token permissions
3. Network/API timeout

**Solution**:
1. Regenerate token with correct permissions
2. Update environment variables
3. Redeploy

### Manual Override

If automatic sync isn't working, you can always:
1. Go to: https://supabase.com/dashboard/project/ohmioijbzvhoydyhdkdk/auth/url-configuration
2. Manually add redirect URLs
3. Click **Save**

## Security Notes

- ✅ Management token has admin-level access to your Supabase project
- ✅ Store it securely in environment variables
- ✅ Never commit it to git
- ✅ Rotate it periodically
- ✅ Added to `.gitignore`

## Files

- `/lib/supabase-auth-sync.ts` - TypeScript sync module
- `/scripts/sync-auth-urls.js` - Standalone sync script
- `/app/api/admin/sync-auth-urls/route.ts` - API endpoint
- `/app/api/admin/brands/route.ts` - Auto-sync on brand create/update

## Questions?

See the main documentation or check the Supabase Management API docs:
https://supabase.com/docs/reference/api/introduction
