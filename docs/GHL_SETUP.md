# GoHighLevel OAuth Integration Setup

This guide walks you through setting up the GoHighLevel OAuth integration for the Marketing ROI Calculator.

## Prerequisites

- GoHighLevel agency account with admin access
- Access to your application's environment variables
- Your application deployed or running locally

## Step 1: Create OAuth App in GoHighLevel

1. Log into your GoHighLevel agency account
2. Navigate to **Settings** → **Integrations** → **OAuth Apps** (or **Marketplace**)
3. Click **Create New App**
4. Choose either:
   - **Marketplace App** - For public distribution
   - **Private App** - For your agency only

## Step 2: Configure OAuth App

### App Information
- **App Name**: Marketing ROI Calculator (or your preferred name)
- **Description**: ROI calculator with automated lead sync
- **Redirect URI**: `https://yourdomain.com/api/admin/ghl/callback`
  - For local development: `http://localhost:3000/api/admin/ghl/callback`
  - The exact URL is shown in the admin panel when you're not connected

### Required Scopes

Select the following scopes for your OAuth app:

- ✅ `contacts.readonly` - Read contact information
- ✅ `contacts.write` - Create and update contacts
- ✅ `opportunities.readonly` - Read opportunities (optional, for future use)
- ✅ `opportunities.write` - Create and update opportunities (optional, for future use)
- ✅ `locations/customFields.readonly` - Read custom fields
- ✅ `locations/customFields.write` - Update custom field values
- ✅ `locations/customValues.readonly` - Read custom values
- ✅ `locations/customValues.write` - Update custom values

### Save and Get Credentials

After creating the app, GoHighLevel will provide:
- **Client ID** - Copy this value
- **Client Secret** - Copy this value (keep it secure!)

## Step 3: Configure Environment Variables

Add the following variables to your `.env.local` file:

```env
# GoHighLevel OAuth Configuration
GHL_CLIENT_ID=your_client_id_here
GHL_CLIENT_SECRET=your_client_secret_here

# Optional: Override the default redirect URI
# GHL_REDIRECT_URI=https://yourdomain.com/api/admin/ghl/callback
```

### For Vercel Deployment

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables for all environments (Production, Preview, Development):
   - `GHL_CLIENT_ID`
   - `GHL_CLIENT_SECRET`
   - `GHL_REDIRECT_URI` (optional)

4. Redeploy your application

### For Other Hosting Platforms

Add the environment variables according to your platform's documentation:
- Railway: Settings → Variables
- Netlify: Site settings → Environment variables
- AWS: Configure in your deployment pipeline or AWS Secrets Manager

## Step 4: Restart Your Application

After adding environment variables:

**Local Development:**
```bash
# Stop your dev server (Ctrl+C)
# Restart it
npm run dev
```

**Production:**
- Trigger a new deployment or restart your application

## Step 5: Connect Your Account

1. Log into your Marketing ROI Calculator admin panel
2. Navigate to **Admin** → **GoHighLevel Sync**
3. You should see the OAuth configuration section with:
   - Required environment variables
   - OAuth Redirect URI
   - Required scopes
   - Setup instructions
4. Click **Connect with GoHighLevel**
5. Select your location
6. Authorize the connection
7. You'll be redirected back to the admin panel

## Step 6: Configure Field Mappings (Optional)

After connecting:

1. In the **Field Mapping & Notes** section:
   - Click **Refresh Fields** to load your GHL custom fields
   - Map each ROI data field to your desired GHL custom field
   - Or leave the default mappings (e.g., `roi_current_leads`, `roi_current_sales`)

2. Configure notes (optional):
   - Enable **Add note to contact when lead is captured**
   - Customize the note template with placeholders
   - Available placeholders include contact info, ROI metrics, and more

3. Click **Save Configuration**

## Troubleshooting

### "Missing credentials" error
- Verify `GHL_CLIENT_ID` and `GHL_CLIENT_SECRET` are set in your environment
- Restart your application after adding variables
- Check for typos in variable names

### "Invalid redirect URI" error
- Ensure the redirect URI in GHL exactly matches: `https://yourdomain.com/api/admin/ghl/callback`
- Check for trailing slashes or protocol mismatches (http vs https)
- Update `GHL_REDIRECT_URI` if using a custom domain

### "Invalid state" error
- Clear your browser cookies and try again
- This can happen if the OAuth flow was interrupted

### Custom fields not syncing
- Check that you've configured field mappings in the admin panel
- Verify the custom fields exist in your GHL location
- Check the browser console and server logs for errors

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use environment variables for all secrets** - Never hardcode credentials
3. **Rotate credentials periodically** - Update Client Secret every 90 days
4. **Limit scope access** - Only request the scopes you need
5. **Monitor sync logs** - Review the `ghl_sync_log` table for issues

## Field Mapping Reference

### Default ROI Calculator Fields → GHL Custom Fields

| ROI Calculator Field | Default GHL Field Key | Description |
|---------------------|----------------------|-------------|
| Current Leads | `roi_current_leads` | Number of leads |
| Current Sales | `roi_current_sales` | Number of sales |
| Current Ad Spend | `roi_current_ad_spend` | Total ad spend amount |
| Current Revenue | `roi_current_revenue` | Total revenue amount |
| Current CR | `roi_current_cr` | Conversion rate percentage |
| Current CPL | `roi_current_cpl` | Cost per lead |
| Current CPA | `roi_current_cpa` | Cost per acquisition |
| Scenario Name | `roi_scenario_name` | Saved scenario name |
| Target CR | `roi_target_cr` | Target conversion rate |
| Projected Sales | `roi_new_sales` | Projected sales count |
| Projected Revenue | `roi_new_revenue` | Projected revenue amount |
| Sales Increase | `roi_sales_increase` | Increase in sales |
| Revenue Increase | `roi_revenue_increase` | Increase in revenue |
| CPA Improvement | `roi_cpa_improvement` | Improvement in CPA |

### Creating Custom Fields in GHL

If you want to use custom field names:

1. Go to your GHL location settings
2. Navigate to **Custom Fields** or **Custom Values**
3. Create new custom fields for each ROI metric you want to track
4. Note the field keys (usually lowercase with underscores)
5. Use the field mapping UI in the admin panel to map fields

## Support

For issues or questions:
- Check the browser console for client-side errors
- Check server logs for API errors
- Review the `ghl_sync_log` table in the database for sync failures
- Verify all environment variables are set correctly
