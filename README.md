# Marketing ROI Calculator 📊

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)

**Status**: ✅ COMPLETE - Ready for Deployment
**Live Demo**: [Deploy to Vercel →](#deployment)

A professional, full-stack Marketing ROI Calculator with AI-powered insights, user authentication, and admin CRM integration.

---

## 🎯 Overview

This comprehensive web application helps marketers:
- **Calculate ROI** with a two-input design (Current vs Prospective)
- **Model unlimited scenarios** with dual timeframe results (weekly + monthly)
- **Save and track history** with user accounts
- **Get AI-powered recommendations** via chat assistant
- **Compare platform performance** (Facebook, Google, LinkedIn, etc.)
- **Sync leads to GoHighLevel** (admin-controlled)

---

## ✨ Key Features

### For Anonymous Visitors
- ✅ Professional landing page with lead capture
- ✅ Full calculator access (no login required)
- ✅ Instant dual-timeframe results
- ✅ Unlimited one-time scenarios

### For Registered Users (Free Account)
- ✅ Save unlimited scenarios
- ✅ View complete history
- ✅ Platform-by-platform breakdown (Facebook, Google, etc.)
- ✅ AI chat assistant for data analysis
- ✅ Compare multiple scenarios
- ✅ Dashboard with analytics

### For Platform Admins
- ✅ View all users and scenarios
- ✅ Configure GoHighLevel integration
- ✅ Map fields to GHL custom fields
- ✅ AI chat with platform-wide data access
- ✅ View sync logs and statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15+ (App Router) |
| **Frontend** | React 19+, TypeScript 5.9+ |
| **Styling** | Tailwind CSS v3.4 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Database** | Supabase (PostgreSQL) with RLS |
| **Auth** | Supabase Auth |
| **AI** | OpenAI GPT-4 |
| **CRM** | GoHighLevel (admin only) |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/marketing-roi-calculator.git
cd marketing-roi-calculator
npm install
```

### 2. Set Up Environment

Copy `.env.local.example` to `.env.local` and add your credentials:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (for AI features)
OPENAI_API_KEY=sk-your_openai_key

# Optional (for GHL)
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=http://localhost:3000/api/ghl/callback
```

### 3. Set Up Database

1. Create Supabase project
2. Run migrations in SQL Editor:
   - `supabase/migrations/20250101000000_initial_schema.sql`
   - `supabase/migrations/20250101000001_add_admin_user.sql`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
marketing-roi-calculator/
├── app/                         # Next.js pages (App Router)
│   ├── page.tsx                 # Landing page
│   ├── calculator/              # ROI calculator
│   ├── login/                   # Login page
│   ├── register/                # Registration
│   ├── dashboard/               # User dashboard
│   ├── admin/                   # Admin panel
│   └── api/                     # API routes
│       ├── auth/                # Login, register, logout
│       ├── ai/                  # AI chat endpoint
│       ├── admin/               # GHL settings
│       └── lead-capture/        # Form submission
├── components/                  # React components
│   ├── calculator/              # Calculator forms & results
│   ├── dashboard/               # Dashboard UI
│   ├── admin/                   # Admin panel
│   ├── ai/                      # AI chat widget
│   ├── Header.tsx               # Navigation
│   ├── ContactForm.tsx          # Lead capture
│   └── BenefitsSection.tsx      # Account benefits
├── lib/                         # Utilities
│   ├── calculations.ts          # ROI formulas
│   └── supabase/                # DB clients
├── types/database.ts            # TypeScript types
├── supabase/migrations/         # Database schema
└── Documentation/               # Guides (11 .md files)
```

---

## 📊 Database Schema

12 tables with Row-Level Security:

1. **lead_captures** - Contact form submissions
2. **users** - Registered accounts (phone required)
3. **calculator_sessions** - Current ROI baseline data
4. **roi_scenarios** - Prospective scenarios
5. **platforms** - Ad platform master list (Facebook, Google, etc.)
6. **session_platforms** - Platform breakdown (current)
7. **scenario_platforms** - Platform breakdown (scenarios)
8. **ai_chat_conversations** - Chat sessions
9. **ai_chat_messages** - Individual messages
10. **admin_settings** - Platform configuration
11. **ghl_field_mappings** - GHL field mapping
12. **ghl_sync_log** - Sync operation logs

---

## 🎨 Pages & Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page + lead capture | Public |
| `/calculator` | ROI calculator (two-input design) | Public |
| `/login` | User login | Public |
| `/register` | User registration (phone required) | Public |
| `/dashboard` | User dashboard + scenarios | Authenticated |
| `/admin` | Admin panel + GHL settings | Admin only |

---

## 🔐 Authentication Flow

1. **Anonymous User**: Use calculator → See results → Prompted to save
2. **Registration**: Email + Phone (required) + Password
3. **Login**: Email + Password
4. **Protected Routes**: Auto-redirect to `/login` if not authenticated
5. **Admin Access**: Role-based access to `/admin`

---

## 🤖 AI Chat Features

### For Users
- Analyze YOUR scenarios only
- Get personalized recommendations
- Model "what-if" scenarios
- Explain calculations

### For Admins
- Analyze ALL platform data
- Platform-wide insights
- User comparison
- Trend identification

### How It Works
1. Click "Start AI Chat" in dashboard
2. Ask questions in natural language
3. AI analyzes your data with OpenAI GPT-4
4. Get specific, actionable recommendations
5. Conversation saved to database

---

## 📈 Calculation Example

### Input
```typescript
Current Metrics (Monthly):
- Leads: 5,202
- Sales: 308
- Ad Spend: $560,000
- Revenue: $4,000,000

Target:
- Conversion Rate: 8%
```

### Output
```typescript
Results (Dual Timeframe):

MONTHLY:
- New Sales: 416 (+108, +35%)
- New Revenue: $5,402,597 (+$1,402,597, +35%)
- CPA Improvement: -26% ($1,818 → $1,346)

WEEKLY:
- New Sales: 96 (+25, +35%)
- New Revenue: $1,243,253 (+$322,818, +35%)
- CPA Improvement: -26% ($1,818 → $1,346)
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/marketing-roi-calculator.git
git push -u origin main

# 2. Import to Vercel
# Go to vercel.com → New Project → Import Git Repository

# 3. Add Environment Variables in Vercel Dashboard
# (Same as .env.local)

# 4. Deploy!
```

### Post-Deployment
1. Update Supabase Auth URLs with Vercel domain
2. Test all features
3. Configure custom domain (optional)

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Local development setup |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Production deployment |
| [COMPLETE_FEATURE_LIST.md](./COMPLETE_FEATURE_LIST.md) | All features + access matrix |
| [FINAL_ARCHITECTURE.md](./FINAL_ARCHITECTURE.md) | System architecture |
| [CALCULATION_LOGIC.md](./CALCULATION_LOGIC.md) | ROI formulas |
| [AI_CHAT_PLATFORM_FEATURES.md](./AI_CHAT_PLATFORM_FEATURES.md) | AI chat specs |
| [NAVIGATION_STRUCTURE.md](./NAVIGATION_STRUCTURE.md) | Page hierarchy |
| [CPL_VS_CPA_GUIDE.md](./CPL_VS_CPA_GUIDE.md) | Metric explanations |
| [DUAL_TIMEFRAME_FEATURE.md](./DUAL_TIMEFRAME_FEATURE.md) | Weekly/monthly conversion |
| [UI_WIREFRAMES.md](./UI_WIREFRAMES.md) | UI/UX designs |
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Original implementation plan |

---

## 🎯 Key Features in Detail

### Two-Input Calculator Design
- **Left Side**: Current ROI (baseline)
- **Right Side**: Prospective Scenario (what-if)
- Real-time validation
- Step-by-step workflow

### Dual Timeframe Results
- Input weekly OR monthly data
- See results in BOTH timeframes
- Automatic conversion (4.345 weeks/month)
- Side-by-side comparison tables

### Platform Breakdown
- Track 11 platforms: Facebook, Google, LinkedIn, TikTok, Instagram, Twitter, YouTube, Pinterest, Snapchat, Microsoft, Other
- Per-platform metrics: CR, CPL, CPA, ROI
- Ranked comparison with best/worst highlighted

### Admin GHL Integration
- Single platform admin account
- Flexible field mapping (contact, current, prospective, platform)
- Sync log with error tracking
- Connect/disconnect functionality

---

## 🧪 Testing

### Test User Flow
1. Visit landing page
2. Submit contact form
3. Use calculator (anonymous)
4. Create account (email + phone + password)
5. Login to dashboard
6. Create scenarios
7. Use AI chat
8. View history

### Test Admin Flow
1. Login as `chad@askchad.net` (admin)
2. Access `/admin`
3. View all users
4. Configure GHL
5. Use admin AI chat (access all data)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- Built with [Attack Kit](../resources/ATTACK_KIT.md) standards
- UI/UX from [UI_CHART_STANDARDS.md](../resources/UI_CHART_STANDARDS.md)
- Next.js patterns from [NEXTJS_QUICKSTART.md](../resources/attack-kit/NEXTJS_QUICKSTART.md)

---

## 📞 Support

Questions or issues?
1. Check [SETUP.md](./SETUP.md)
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Check [COMPLETE_FEATURE_LIST.md](./COMPLETE_FEATURE_LIST.md)
4. Open GitHub issue

---

## ✅ What's Included

- ✅ **16 Pages & Routes** (landing, calculator, auth, dashboard, admin)
- ✅ **15+ Components** (forms, charts, modals, tables)
- ✅ **12 Database Tables** with RLS
- ✅ **10 API Endpoints** (auth, AI, admin, leads)
- ✅ **All ROI Calculations** (12 formulas)
- ✅ **AI Chat System** (OpenAI integration)
- ✅ **User Authentication** (Supabase Auth)
- ✅ **Admin Panel** (user management, GHL)
- ✅ **Professional Styling** (Tailwind + 27-color palette)
- ✅ **Responsive Design** (mobile-first)
- ✅ **Complete Documentation** (11 .md files)
- ✅ **Ready to Deploy** (Vercel + Supabase)

---

**Built with ❤️ using Next.js, React, TypeScript, Supabase, and OpenAI**

**Ready to deploy?** Follow the [Deployment Guide](./DEPLOYMENT_GUIDE.md) →

🚀 **Generated with Claude Code**
