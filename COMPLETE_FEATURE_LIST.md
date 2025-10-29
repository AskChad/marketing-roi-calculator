# Marketing ROI Calculator - Complete Feature List

## Project Overview

A comprehensive ROI calculator that helps marketers:
- Analyze current marketing performance
- Model prospective scenarios
- Compare different ad platforms
- Get AI-powered insights
- Track historical data

---

## User Types & Access

### 1. **Anonymous Visitors** (No Account)
✅ Can access landing page
✅ Can use calculator (basic)
✅ See results immediately
✅ Create unlimited scenarios
❌ Cannot save scenarios
❌ Cannot view history
❌ Cannot use platform breakdown
❌ Cannot access AI chat
❌ Data synced to admin GHL but not saved for them

### 2. **Registered Users** (Free Account)
✅ All anonymous features +
✅ Save unlimited scenarios
✅ View complete history
✅ Platform-by-platform breakdown
✅ AI chat assistant
✅ Compare multiple scenarios
✅ Dashboard with analytics
✅ Edit/delete scenarios
✅ Phone required for registration

### 3. **Platform Admins**
✅ All registered user features +
✅ View all users' data
✅ Configure GHL integration
✅ Map fields to GHL
✅ View sync logs
✅ AI chat about any user's data

---

## Core Features

### 1. Landing Page
**Purpose**: Capture lead info before calculator access

**Fields**:
- First Name ✅ required
- Last Name ✅ required
- Email ✅ required
- Phone ⭕ optional (required for account creation later)
- Company Name ✅ required
- Website ⭕ optional

**Benefits Section** (why create account):
- 📊 Historical data tracking
- 🤖 AI ROI assistant
- 🎯 Platform breakdown analysis

---

### 2. ROI Calculator (Two-Input Design)

#### **Input Section 1: Current Marketing ROI**
```
Time Period: ⚪ Weekly ⚫ Monthly

Number of Leads: _____
Number of Sales: _____
Total Ad Spend: $_____
Total Revenue: $_____

[Calculate Current Metrics]
```

**Auto-Calculated Current Metrics**:
- Conversion Rate (%)
- Cost per Lead (CPL)
- Cost per Acquisition (CPA)
- Average Revenue per Sale

#### **Input Section 2: Prospective Scenario**
```
Scenario Name: _____ (e.g., "Q1 2025 Goals")

Target Conversion Rate: _____%

Optional Adjustments:
☐ Adjust number of leads: _____
☐ Adjust ad spend: $_____

[Calculate Scenario]
```

**Auto-Calculated Prospective Metrics**:
- New Sales
- New CPL
- New CPA
- New Revenue

**Comparison Metrics**:
- Sales Increase (+108)
- Revenue Increase (+$1.4M)
- CPA Improvement (-26%)
- CPL Change (0%)

---

### 3. Platform Breakdown (Logged-In Only)

**View Mode Toggle**:
- Overall Totals (default)
- Per-Platform Breakdown (logged-in users only)

**Supported Platforms** (pre-populated):
- Facebook Ads
- Google Ads
- LinkedIn Ads
- TikTok Ads
- Instagram Ads
- Twitter Ads
- YouTube Ads
- Pinterest Ads
- Snapchat Ads
- Microsoft Ads
- Other (custom)

**Per-Platform Inputs**:
- Platform Leads
- Platform Sales
- Platform Ad Spend
- Platform Revenue

**Per-Platform Metrics** (auto-calculated):
- Conversion Rate
- CPL
- CPA
- ROI (Revenue / Ad Spend)

**Platform Comparison Dashboard**:
- Ranked by ROI (gold/silver/bronze medals)
- Comparison charts
- Detailed metrics table
- Best/worst performers highlighted

---

### 4. AI Chat Assistant (Logged-In Only)

**Access**:
- Floating chat widget (bottom-right)
- Available on all pages
- Chat history saved per user

**Capabilities**:
1. **Scenario Analysis**
   - "What's my best performing scenario?"
   - "Explain the Q1 2025 scenario"
   - "Compare scenario A vs scenario B"

2. **Platform Insights**
   - "Compare Facebook and Google campaigns"
   - "Which platform has the best ROI?"
   - "Should I increase Facebook budget?"

3. **Recommendations**
   - "How can I improve my ROI?"
   - "What if I increase budget by 20%?"
   - "What conversion rate should I target?"

4. **Data Exploration**
   - "Show me my historical trends"
   - "What's my average CPA across all scenarios?"
   - "Which month performed best?"

**AI Features**:
- Analyzes user's database
- Provides specific numbers
- Makes recommendations
- Explains calculations
- Models "what-if" scenarios
- Generates insights

---

### 5. User Dashboard (Logged-In Only)

**Sections**:

#### **My Scenarios**
- Grid view of all saved scenarios
- Each card shows:
  - Scenario name
  - Creation date
  - Key metrics (Sales increase, Revenue increase, CPA improvement)
- Actions: Edit, Delete, Compare
- Multi-select for comparison

#### **Platform Performance**
- Session selector (choose which session to analyze)
- Platform cards ranked by ROI
- Comparison charts
- Metrics table
- Best performers highlighted

#### **Scenario Comparison**
- Select 2+ scenarios
- Side-by-side comparison
- Charts showing differences
- Recommendations on which scenario is best

---

### 6. Admin Dashboard

**GHL Settings**:
- Connect GHL account (OAuth)
- View connection status
- Disconnect option

**Field Mapping**:

Categories of data to map:
1. **Contact Info** (from landing page)
   - first_name, last_name, email, phone, company_name, website_url

2. **Current Metrics** (from calculator session)
   - time_period, current_leads, current_sales, current_ad_spend, current_revenue
   - current_conversion_rate, current_cpl, current_cpa, avg_revenue_per_sale

3. **Prospective Metrics** (from scenario)
   - scenario_name, target_conversion_rate
   - new_sales, new_cpl, new_cpa, new_revenue

4. **Comparison Metrics**
   - sales_increase, revenue_increase, cpa_improvement_percent

5. **Platform Metrics** (if using platform breakdown)
   - platform_name, platform_leads, platform_sales, platform_ad_spend
   - platform_conversion_rate, platform_cpl, platform_cpa, platform_roi

6. **Metadata**
   - submission_date, source, user_registered, total_scenarios_created

**Mapping Interface**:
```
Source Field          →  GHL Field              [Active]
─────────────────────────────────────────────────────
first_name           →  First Name              [✓]
last_name            →  Last Name               [✓]
email                →  Email                   [✓]
company_name         →  Custom: Company         [✓]
current_leads        →  Custom: Leads/Mo        [✓]
revenue_increase     →  Custom: Revenue Opp     [✓]
```

**Sync Log**:
- Table of all syncs
- Status (success/failed)
- Timestamp
- Errors (if any)
- Retry button

---

### 7. Results Display

**Dual Timeframe View**:
- Toggle between Weekly and Monthly
- Side-by-side comparison tables
- All metrics shown in both timeframes

**Comparison Table**:
```
Metric              Current      Improved     Change
──────────────────────────────────────────────────
Leads               5,202        5,202        —
Sales               308          416          +108 ↑
CPL                 $108         $108         —
CPA                 $1,818       $1,346       -26% ↓
Revenue             $4.0M        $5.4M        +$1.4M ↑
```

**Charts** (Recharts):
1. Revenue Comparison (Bar Chart)
2. Sales Distribution (Pie Chart)
3. CPA Improvement (Line Chart)
4. Platform Comparison (if applicable)

**Key Insights Cards**:
```
🚀 Sales Increase
   +108 sales/month
   (35% increase)

💰 Revenue Increase
   +$1,402,597/month
   (35% growth)

📉 CPA Improvement
   -26% cost reduction
   ($1,818 → $1,346)
```

---

## Database Schema Summary

### Core Tables
1. **lead_captures** - Contact info from landing page
2. **users** - Registered accounts
3. **calculator_sessions** - Current ROI data
4. **roi_scenarios** - Prospective scenarios

### Platform Tables
5. **platforms** - Master list of ad platforms
6. **session_platforms** - Platform breakdown per session
7. **scenario_platforms** - Platform breakdown per scenario

### AI Chat Tables
8. **ai_chat_conversations** - Chat sessions
9. **ai_chat_messages** - Individual messages

### Admin Tables
10. **admin_settings** - Platform-wide GHL connection
11. **ghl_field_mappings** - Field mapping configuration
12. **ghl_sync_log** - Sync history

**Total: 12 tables**

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS v3 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Database** | Supabase (PostgreSQL) |
| **AI** | OpenAI GPT-4 / Anthropic Claude |
| **Auth** | Supabase Auth |
| **CRM** | GoHighLevel (admin only) |
| **Deployment** | Vercel |
| **Version Control** | GitHub |

---

## User Flows

### Flow 1: Anonymous User
```
1. Lands on homepage
2. Fills contact form
3. → Redirected to calculator
4. Enters current metrics
5. Creates prospective scenario
6. Sees results
7. (Optional) Creates another scenario
8. Sees "Create Account" prompt
9. ❌ Leaves without account → data synced to admin GHL but not saved for user
```

### Flow 2: Registered User
```
1-7. Same as anonymous
8. Clicks "Create Account"
9. Enters phone + password
10. Account created
11. Previous scenarios auto-linked to account
12. Can now:
    - View dashboard
    - See history
    - Use AI chat
    - Add platform breakdown
    - Save/compare scenarios
```

### Flow 3: Returning User
```
1. Lands on homepage
2. Clicks "Login"
3. Enters email + password
4. → Redirected to dashboard
5. Sees all saved scenarios
6. Can:
    - Create new scenario
    - Compare scenarios
    - Chat with AI
    - View platform breakdown
```

---

## Competitive Advantages

### What Makes This Unique

1. **Two-Input Design**
   - Current vs Prospective (not just one calculation)
   - Model unlimited scenarios
   - Compare scenarios side-by-side

2. **Platform Breakdown**
   - Track Facebook, Google, LinkedIn separately
   - Compare platform ROI
   - Optimize budget allocation

3. **AI Assistant**
   - Chat about your data
   - Get personalized recommendations
   - Model "what-if" scenarios
   - Explain complex metrics

4. **Historical Tracking**
   - Save unlimited scenarios
   - View trends over time
   - Compare past vs present

5. **Dual Timeframe**
   - See weekly AND monthly results
   - Better for different stakeholders
   - More comprehensive planning

6. **Admin-Controlled GHL**
   - All leads to one GHL account
   - Flexible field mapping
   - Track all user activity

---

## Monetization Options (Future)

1. **White Label** - Agencies can rebrand
2. **API Access** - Integrate with other tools
3. **Advanced AI** - More chat queries per month
4. **Team Accounts** - Multiple users per company
5. **Custom Platforms** - Add custom ad platforms
6. **Export Reports** - PDF/Excel exports
7. **Integrations** - Connect to other CRMs

---

## Success Metrics

### For Users
- Time to first scenario: < 5 minutes
- Scenarios created per user: > 3
- AI chat engagement: > 50% of users
- Return rate: > 40%

### For Admin
- Lead capture rate: > 70%
- Account creation rate: > 30%
- GHL sync success: > 99%
- AI chat satisfaction: > 4.5/5

---

## Next Steps

1. ✅ Review complete feature list
2. ✅ Approve architecture
3. ✅ Begin Phase 1: Setup
4. ➡️ Build MVP (Phases 1-7)
5. ➡️ Add AI Chat (Phases 10-11)
6. ➡️ Add Platform Breakdown (Phase 12)
7. ➡️ Deploy to production

**Ready to start building?**
