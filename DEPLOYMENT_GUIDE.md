# Deployment Guide

## Prerequisites

1. **GitHub Account**: To host your repository
2. **Vercel Account**: For deployment (free tier available)
3. **Supabase Account**: For database (free tier available)
4. **OpenAI Account**: For AI chat features (optional but recommended)

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
   - Choose a name (e.g., "marketing-roi-calculator")
   - Generate a secure database password
   - Choose a region close to your users
   - Wait for project to finish setting up (~2 minutes)

### 1.2 Run Database Migrations

1. Go to SQL Editor in Supabase dashboard
2. Copy the contents of `supabase/migrations/20250101000000_initial_schema.sql`
3. Paste into SQL Editor and click "Run"
4. Copy the contents of `supabase/migrations/20250101000001_add_admin_user.sql`
5. Paste and run to create admin user

### 1.3 Get API Credentials

1. Go to Project Settings → API
2. Copy the following:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (keep this secure!)

---

## Step 2: Set Up GitHub Repository

### 2.1 Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Create a new repository:
   - Name: `marketing-roi-calculator`
   - Description: "Marketing ROI Calculator with AI insights"
   - Public or Private (your choice)
   - DO NOT initialize with README, .gitignore, or license

### 2.2 Push Code to GitHub

```bash
cd /mnt/c/development/marketing_ROI_Calculator

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/marketing-roi-calculator.git

# Push code
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 3.2 Configure Environment Variables

Before deploying, add these environment variables in Vercel:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Optional (for AI features):**
```
OPENAI_API_KEY=sk-xxxxxxxxxxxx
```

**Optional (for GHL integration):**
```
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=https://your-app.vercel.app/api/ghl/callback
```

### 3.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (~2-3 minutes)
3. Vercel will provide a URL (e.g., `https://marketing-roi-calculator.vercel.app`)

---

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### 4.2 Set Up Admin User

1. Go to your deployed app
2. Register with email: `chad@askchad.net`
3. Or manually update the users table in Supabase to set `is_admin = true`

### 4.3 Test Core Features

- ✅ Landing page loads
- ✅ Contact form submission
- ✅ Calculator works (anonymous)
- ✅ User registration (with phone)
- ✅ User login
- ✅ Dashboard displays
- ✅ AI chat responds (if API key configured)
- ✅ Admin panel (for admin users)

---

## Step 5: Optional Enhancements

### 5.1 Custom Domain

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 5.2 OpenAI API Setup

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to Vercel environment variables as `OPENAI_API_KEY`
4. Redeploy the application

### 5.3 GoHighLevel Integration

1. Create GHL OAuth app in your GHL account
2. Get Client ID and Client Secret
3. Add to Vercel environment variables
4. Implement OAuth callback route (placeholder exists)

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployment URL |
| `OPENAI_API_KEY` | No | OpenAI API key for AI chat |
| `GHL_CLIENT_ID` | No | GoHighLevel OAuth client ID |
| `GHL_CLIENT_SECRET` | No | GoHighLevel OAuth client secret |
| `GHL_REDIRECT_URI` | No | GHL OAuth callback URL |

---

## Troubleshooting

### Build Fails

- Check all environment variables are set correctly
- Ensure Supabase credentials are valid
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify Supabase URL and keys
- Check that migrations ran successfully
- Ensure RLS policies are enabled

### AI Chat Not Working

- Verify `OPENAI_API_KEY` is set
- Check OpenAI account has credits
- Review API rate limits

### Authentication Issues

- Confirm Supabase Auth redirect URLs include your domain
- Check that users table exists and has correct schema
- Verify password requirements (min 6 characters)

---

## Monitoring and Maintenance

### Vercel Analytics

- View deployment analytics in Vercel dashboard
- Monitor page performance
- Track errors and warnings

### Supabase Monitoring

- Monitor database usage
- Check Row-Level Security policies
- Review API requests

### Cost Optimization

- Vercel Free Tier: 100GB bandwidth/month
- Supabase Free Tier: 500MB database, 2GB bandwidth
- OpenAI: Pay per token (configure limits)

---

## Support

For issues or questions:
- Check GitHub Issues
- Review Vercel deployment logs
- Consult Supabase documentation
- Review OpenAI API status

---

**Deployment Complete!** 🚀

Your Marketing ROI Calculator is now live and ready to use.
