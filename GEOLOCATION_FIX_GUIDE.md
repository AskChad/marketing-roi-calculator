# Geolocation Tracking Fix Guide

## Problem
Location data (city, state, zipcode) is showing as "N/A" in analytics for all visits since November 4, 2025.

## Root Cause
The `IP_GEOLOCATION_API_KEY` environment variable is **not set in Vercel**, which prevents the geolocation API from being called.

### How It Works:
1. When a user visits the calculator, their IP address is captured
2. A background process calls ipgeolocation.io API to get location data
3. The location data is then updated in the database
4. **If the API key is missing, the geolocation step is skipped silently**

## Solution

### Step 1: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **marketing-roi-calculator**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `IP_GEOLOCATION_API_KEY`
   - **Value**: `1205b2d5d21f46998615ea2330c60713`
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 2: Redeploy

After adding the environment variable, you need to redeploy for it to take effect:

**Option A: Via Dashboard**
- Go to **Deployments** tab
- Click the three dots (···) on the latest deployment
- Select **Redeploy**

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

### Step 3: Verify

After redeployment:
1. Visit your calculator page
2. Check Vercel logs for geolocation messages:
   - Look for `[IP GEOLOCATION] API key found, proceeding with lookup`
   - Look for `[Geolocation] Successfully updated visit`
3. Check your analytics dashboard - new visits should show location data

## Monitoring

With the improved logging, you can now see in Vercel logs:
- ✅ When geolocation lookup starts
- ✅ What IP address is being looked up
- ✅ The location data received
- ✅ Whether the database update succeeded
- ❌ If the API key is missing
- ❌ If the API call fails

## Testing Locally

To test locally:
```bash
# Make sure .env.local has the key
grep IP_GEOLOCATION_API_KEY .env.local

# Should show:
# IP_GEOLOCATION_API_KEY=1205b2d5d21f46998615ea2330c60713

# Run the test script
node scripts/test-geolocation-api.js
```

## API Information

- **Service**: ipgeolocation.io
- **Current Plan**: Free tier (1,000 requests/day)
- **API Key**: `1205b2d5d21f46998615ea2330c60713`
- **Documentation**: https://ipgeolocation.io/documentation.html

## What Changed?

The tracking was working before November 4, 2025 because the environment variable was likely set during initial deployment. It appears to have been removed or lost during a subsequent deployment or project configuration change.

## Files Modified

- `app/api/track-calculator-visit/route.ts` - Added detailed logging
- `lib/get-ip-address.ts` - Added clear error messages when API key is missing
- This guide document

## After Fix

Once the environment variable is added and the app is redeployed, all new visits will automatically capture:
- City
- State/Region
- Zipcode
- Country
- Latitude/Longitude
- Timezone
- ISP/Organization

The old visits with "N/A" will remain as-is (historical data cannot be retroactively updated).
