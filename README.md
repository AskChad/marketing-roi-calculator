# Marketing ROI Calculator

> A professional two-page web application that captures leads and provides an interactive ROI calculator to demonstrate the value of improved conversion rates.

**Live Demo**: [Coming Soon]
**Status**: ✅ Planning Complete - Ready for Implementation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Implementation Roadmap](#implementation-roadmap)
- [Example Calculation](#example-calculation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

This application helps marketing professionals visualize the financial impact of improving their conversion rates. It consists of two main pages:

1. **Lead Capture Form**: Collects visitor information (name, email, phone, company)
2. **ROI Calculator**: Interactive calculator showing the dollar impact of conversion rate improvements

### Use Case

**Scenario**: You're currently running ads with:
- 5,202 leads
- 308 sales (5.92% conversion rate)
- $560,000 ad spend
- $4,000,000 revenue

**Question**: What if you improved your conversion rate to 8%?

**Answer**: This calculator instantly shows you:
- +108 additional sales (416 total)
- +$1,402,597 revenue increase ($5.4M total)
- **CPL stays at $107.65** (same leads, same spend)
- **CPA drops to $1,346** (-26% improvement!)

> 📚 **New to CPL and CPA?** See [CPL_VS_CPA_GUIDE.md](./CPL_VS_CPA_GUIDE.md) for a complete explanation of both metrics and why they matter.

---

## ✨ Features

### Page 1: Lead Capture
- ✅ Professional form with validation
- ✅ Required fields: First name, last name, email, phone, company
- ✅ Optional field: Website URL
- ✅ Real-time validation with error messages
- ✅ Phone number formatting
- ✅ Supabase storage
- ✅ Optional GHL CRM integration

### Page 2: ROI Calculator
- ✅ **Time Period Selector**: Choose weekly or monthly data input
- ✅ **Dual Timeframe Results**: See results in BOTH weekly AND monthly views
- ✅ Interactive input fields for baseline metrics
- ✅ Real-time calculation engine
- ✅ Target conversion rate slider (6% - 15%)
- ✅ Dual comparison tables (Weekly + Monthly)
- ✅ Key insights for both timeframes
- ✅ Three chart visualizations (with timeframe toggle):
  - Revenue comparison bar chart
  - Sales distribution pie chart
  - CPA improvement line chart
- ✅ Mobile-responsive design
- ✅ WCAG AA accessibility compliant

### Calculations Performed
1. Current Conversion Rate
2. Current CPL (Cost per Lead)
3. Current CPA (Cost per Acquisition)
4. Average Revenue per Sale
5. New Sales (at target CR)
6. New CPL (at target CR - stays same)
7. New CPA (at target CR)
8. New Revenue (at target CR)
9. Revenue Increase ($)
10. CPL Change (always 0%)
11. CPA Improvement (%)
12. Sales Increase (#)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 15+, React 19+, TypeScript 5.0+ |
| **Styling** | Tailwind CSS v3 (NOT v4) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (optional) |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
/marketing_ROI_Calculator
├── README.md                      # This file
├── PROJECT_PLAN.md                # Complete implementation plan
├── CALCULATION_LOGIC.md           # All formulas & functions
├── UI_WIREFRAMES.md               # UI/UX design specs
├── src/
│   ├── app/
│   │   ├── page.tsx               # Lead capture form
│   │   ├── calculator/
│   │   │   └── page.tsx           # ROI calculator
│   │   ├── api/
│   │   │   ├── leads/route.ts     # POST lead data
│   │   │   └── calculate/route.ts # POST calculation results
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── LeadCaptureForm.tsx
│   │   ├── CalculatorInputs.tsx
│   │   ├── ROIResults.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── ROICharts.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── calculations.ts        # ROI calculation logic
│   │   ├── validations.ts         # Zod schemas
│   │   └── colors.ts              # 27-color palette
│   └── types/
│       └── index.ts               # TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── .env.local                     # Environment variables
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x or later
- npm or yarn
- Supabase account (free tier)
- Git

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd /mnt/c/development/marketing_ROI_Calculator
   ```

2. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
   ```

3. **Install dependencies**
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   npm install recharts
   npm install @supabase/supabase-js
   npm install lucide-react
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy the project URL and anon key
   - Create `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📚 Documentation

### Core Documents

1. **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Complete implementation plan
   - Architecture overview
   - Database schema
   - API endpoints
   - 7-phase implementation timeline

2. **[CALCULATION_LOGIC.md](./CALCULATION_LOGIC.md)** - All formulas & TypeScript functions
   - 12 calculation functions with examples (includes CPL & CPA)
   - Input validation rules
   - Edge case handling
   - React hook for real-time updates

3. **[CPL_VS_CPA_GUIDE.md](./CPL_VS_CPA_GUIDE.md)** - ⭐ NEW: Understanding CPL vs CPA
   - What each metric means
   - Why both matter
   - How they relate to conversion rate
   - When to focus on each

4. **[DUAL_TIMEFRAME_FEATURE.md](./DUAL_TIMEFRAME_FEATURE.md)** - ⭐ NEW: Weekly/Monthly feature
   - How timeframe conversion works
   - User experience flow
   - Implementation details
   - UI components

5. **[INPUT_SUMMARY.md](./INPUT_SUMMARY.md)** - Complete input guide
   - All required fields explained
   - Dual timeframe examples
   - FAQs

6. **[UI_WIREFRAMES.md](./UI_WIREFRAMES.md)** - UI/UX design specifications
   - Page layouts
   - Component designs
   - Color palette (27 colors)
   - Responsive breakpoints
   - Accessibility features

### Attack Kit Resources

Reference these files from `/mnt/c/development/resources/`:

- `ATTACK_KIT.md` - Core development principles
- `attack-kit/NEXTJS_QUICKSTART.md` - Next.js setup guide
- `UI_CHART_STANDARDS.md` - Chart styling & color palette
- `ghl-universal/OAUTH_GUIDE.md` - GHL integration (optional)
- `ANALYTICS_PATTERNS.md` - Data aggregation patterns

---

## 🗺 Implementation Roadmap

### Phase 1: Project Setup (Day 1)
- [x] Initialize Next.js 15 project
- [x] Install dependencies
- [x] Configure Tailwind CSS v3
- [x] Set up Supabase
- [x] Create database schema

### Phase 2: Lead Capture Form (Day 2)
- [ ] Create Zod validation schema
- [ ] Build form component
- [ ] Add phone formatting
- [ ] Implement Supabase submission
- [ ] Style with Tailwind

### Phase 3: Calculator Page (Day 3)
- [ ] Create input form
- [ ] Implement calculation logic
- [ ] Build results display
- [ ] Add comparison table
- [ ] Style calculator page

### Phase 4: Data Visualization (Day 4)
- [ ] Set up Recharts
- [ ] Create revenue bar chart
- [ ] Create sales pie chart
- [ ] Create CPA line chart
- [ ] Make responsive

### Phase 5: GHL Integration (Day 5 - Optional)
- [ ] Set up OAuth flow
- [ ] Create webhook endpoint
- [ ] Map form fields
- [ ] Test lead sync

### Phase 6: Testing & Polish (Day 6)
- [ ] Test validation
- [ ] Test calculations
- [ ] Test mobile responsiveness
- [ ] Add loading states
- [ ] Accessibility audit

### Phase 7: Deployment (Day 7)
- [ ] Create GitHub repo
- [ ] Push code
- [ ] Connect to Vercel
- [ ] Configure env variables
- [ ] Deploy to production

**Estimated Timeline**: 7 days (MVP)

---

## 🧮 Example Calculation

### Input Data
```typescript
const baseline = {
  leads: 5202,
  sales: 308,
  adSpend: 560000,
  revenue: 4000000
};

const target = {
  targetConversionRate: 8
};
```

### Output Results
```typescript
{
  // Current Metrics
  currentConversionRate: 5.92,      // %
  currentCPA: 1818.18,               // $
  avgRevenuePerSale: 12987.01,       // $

  // Target Metrics
  newSales: 416,                     // sales
  newCPA: 1346.15,                   // $
  newRevenue: 5402597,               // $

  // Improvements
  revenueIncrease: 1402597,          // $ (+35%)
  cpaImprovement: 25.96,             // % (-26%)
  salesIncrease: 108                 // sales (+35%)
}
```

### Visual Summary
```
┌─────────────────────────────────────────────────────┐
│  Metric          Current      Improved      Change  │
├─────────────────────────────────────────────────────┤
│  Leads           5,202        5,202         —       │
│  Sales           308          416           +108    │
│  CPA             $1,818       $1,346        -26%    │
│  Revenue         $4.0M        $5.4M         +$1.4M  │
└─────────────────────────────────────────────────────┘
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Marketing ROI Calculator"
   git branch -M main
   git remote add origin https://github.com/yourusername/marketing-roi-calculator.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Add environment variables
   - Deploy

3. **Configure Custom Domain** (Optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records

### Environment Variables (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🎨 Color Palette

Professional 27-color system (from UI_CHART_STANDARDS.md):

```typescript
// Grays (7 colors)
#000000 → #2C2C2C → #5A5A5A → #808080 → #B3B3B3 → #D9D9D9 → #FFFFFF

// Blues (7 colors)
#003366 → #005A9C → #0077CC → #3399DD → #66B2E8 → #99CCF0 → #CCE5F9

// Purples (7 colors)
#4B0082 → #6A1B9A → #8E24AA → #AB47BC → #BA68C8 → #CE93D8 → #E1BEE7

// Accents (6 colors)
Teal: #00897B | Emerald: #00C853 | Amber: #FFB300
Coral: #FF6F61 | Rose: #F06292 | Crimson: #C62828
```

---

## 📊 Database Schema

### Table: `lead_captures`
```sql
CREATE TABLE lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `calculator_results` (Optional)
```sql
CREATE TABLE calculator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES lead_captures(id),
  baseline_leads INTEGER NOT NULL,
  baseline_sales INTEGER NOT NULL,
  baseline_ad_spend DECIMAL(12,2) NOT NULL,
  baseline_revenue DECIMAL(12,2) NOT NULL,
  target_conversion_rate DECIMAL(5,2) NOT NULL,
  new_sales INTEGER NOT NULL,
  new_revenue DECIMAL(12,2) NOT NULL,
  revenue_increase DECIMAL(12,2) NOT NULL,
  cpa_improvement_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🧪 Testing

### Test Scenarios

**Scenario 1: Your Example** (High Volume)
```
Leads: 5,202 | Sales: 308 | Spend: $560k | Revenue: $4M → Target: 8%
Expected: +108 sales, +$1.4M revenue, -26% CPA
```

**Scenario 2: Low Volume**
```
Leads: 100 | Sales: 5 | Spend: $10k | Revenue: $25k → Target: 10%
Expected: +5 sales, +$25k revenue, -50% CPA
```

**Scenario 3: High Volume**
```
Leads: 50,000 | Sales: 2,500 | Spend: $5M | Revenue: $50M → Target: 7%
Expected: +1,000 sales, +$20M revenue, -28.55% CPA
```

### Validation Edge Cases
- [ ] Zero sales (division by zero)
- [ ] Zero leads (division by zero)
- [ ] Sales > Leads (logically impossible)
- [ ] Target CR < Current CR (no improvement)
- [ ] Target CR > 50% (unrealistic warning)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built using the [Attack Kit](../resources/ATTACK_KIT.md) development standards
- UI/UX inspired by [UI_CHART_STANDARDS.md](../resources/UI_CHART_STANDARDS.md)
- Next.js patterns from [NEXTJS_QUICKSTART.md](../resources/attack-kit/NEXTJS_QUICKSTART.md)

---

## 📞 Support

For questions or issues:
1. Check the [documentation](#documentation)
2. Review [PROJECT_PLAN.md](./PROJECT_PLAN.md)
3. Open an issue on GitHub

---

## 🎯 Next Steps

Ready to start building? Follow the [Quick Start](#quick-start) guide above!

**Recommended Order**:
1. Read [PROJECT_PLAN.md](./PROJECT_PLAN.md) for architecture overview
2. Review [CALCULATION_LOGIC.md](./CALCULATION_LOGIC.md) for formulas
3. Check [UI_WIREFRAMES.md](./UI_WIREFRAMES.md) for design specs
4. Follow Phase 1 in [Implementation Roadmap](#implementation-roadmap)

---

**Status**: ✅ Planning Complete - Ready for Implementation
**Estimated Development Time**: 7 days (MVP)
**Tech Stack**: Next.js 15 + React 19 + TypeScript + Supabase + Vercel

Good luck! 🚀
