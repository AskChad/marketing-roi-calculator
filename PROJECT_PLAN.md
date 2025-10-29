# Marketing ROI Calculator - Implementation Plan

## Project Overview

A two-page web application that captures leads and provides an interactive ROI calculator to demonstrate the value of improved conversion rates.

**Tech Stack**: Next.js 15+ | React 19+ | TypeScript | Tailwind CSS v3 | Supabase | Recharts | Vercel

---

## Features

### Page 1: Lead Capture Form
- **Fields**:
  - First Name (required)
  - Last Name (required)
  - Email (required, validated)
  - Phone (required, formatted)
  - Company Name (required)
  - Website URL (optional, validated)
- **Validation**: Zod schema with React Hook Form
- **Submission**: Store in Supabase + redirect to calculator
- **Optional**: GHL integration for CRM sync

### Page 2: ROI Calculator
- **Baseline Inputs**:
  - Number of Leads (e.g., 5,202)
  - Number of Sales (e.g., 308)
  - Total Ad Spend ($) (e.g., $560,000)
  - Total Revenue ($) (e.g., $4,000,000)
- **Target Input**:
  - Target Conversion Rate (%) (e.g., 8%)
- **Auto-Calculated Metrics**:
  - Current Conversion Rate
  - Current CPA (Cost per Acquisition)
  - Average Revenue per Sale
  - New Sales (at target CR)
  - New CPA (at target CR)
  - New Revenue (at target CR)
  - Revenue Increase ($)
  - CPA Improvement (%)
- **Visualization**:
  - Comparison table (Current vs Improved)
  - Bar chart showing revenue increase
  - Pie chart showing sales distribution
  - Line chart showing CPA improvement

---

## Architecture

### Directory Structure
```
/marketing_ROI_Calculator
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Lead capture form
│   │   ├── calculator/
│   │   │   └── page.tsx             # ROI calculator
│   │   ├── api/
│   │   │   ├── leads/route.ts       # POST lead data
│   │   │   └── calculate/route.ts   # POST calculation results
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── LeadCaptureForm.tsx
│   │   ├── CalculatorInputs.tsx
│   │   ├── ROIResults.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── ROICharts.tsx
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── calculations.ts          # ROI calculation logic
│   │   ├── validations.ts           # Zod schemas
│   │   └── colors.ts                # 27-color palette
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Database Schema (Supabase)

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

CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at);
```

### Table: `calculator_results` (Optional - for analytics)
```sql
CREATE TABLE calculator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES lead_captures(id),
  baseline_leads INTEGER NOT NULL,
  baseline_sales INTEGER NOT NULL,
  baseline_ad_spend DECIMAL(12,2) NOT NULL,
  baseline_revenue DECIMAL(12,2) NOT NULL,
  current_conversion_rate DECIMAL(5,2) NOT NULL,
  current_cpa DECIMAL(10,2) NOT NULL,
  avg_revenue_per_sale DECIMAL(10,2) NOT NULL,
  target_conversion_rate DECIMAL(5,2) NOT NULL,
  new_sales INTEGER NOT NULL,
  new_cpa DECIMAL(10,2) NOT NULL,
  new_revenue DECIMAL(12,2) NOT NULL,
  revenue_increase DECIMAL(12,2) NOT NULL,
  cpa_improvement_percent DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calculator_results_lead_id ON calculator_results(lead_id);
CREATE INDEX idx_calculator_results_created_at ON calculator_results(created_at);
```

---

## Calculation Formulas

### Current Metrics
```typescript
// Current Conversion Rate
currentCR = (baselineSales / baselineLeads) * 100

// Current CPA (Cost per Acquisition)
currentCPA = baselineAdSpend / baselineSales

// Average Revenue per Sale
avgRevenuePerSale = baselineRevenue / baselineSales
```

### Target Metrics
```typescript
// New Sales (at target CR)
newSales = Math.round(baselineLeads * (targetCR / 100))

// New CPA (at target CR)
newCPA = baselineAdSpend / newSales

// New Revenue (at target CR)
newRevenue = newSales * avgRevenuePerSale

// Revenue Increase
revenueIncrease = newRevenue - baselineRevenue

// CPA Improvement Percentage
cpaImprovementPercent = ((currentCPA - newCPA) / currentCPA) * 100
```

---

## UI/UX Design

### Color Palette (from UI_CHART_STANDARDS.md)
```typescript
// Primary Colors
const COLORS = {
  grays: ['#000000', '#2C2C2C', '#5A5A5A', '#808080', '#B3B3B3', '#D9D9D9', '#FFFFFF'],
  blues: ['#003366', '#005A9C', '#0077CC', '#3399DD', '#66B2E8', '#99CCF0', '#CCE5F9'],
  purples: ['#4B0082', '#6A1B9A', '#8E24AA', '#AB47BC', '#BA68C8', '#CE93D8', '#E1BEE7'],
  accents: {
    teal: '#00897B',
    emerald: '#00C853',
    amber: '#FFB300',
    coral: '#FF6F61',
    rose: '#F06292',
    crimson: '#C62828'
  }
};
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Implementation Phases

### Phase 1: Project Setup (Day 1)
- [x] Initialize Next.js 15 project
- [x] Install dependencies (React Hook Form, Zod, Recharts, Supabase, Tailwind)
- [x] Configure Tailwind CSS v3
- [x] Set up Supabase project and connection
- [x] Create database schema

**Commands**:
```bash
cd /mnt/c/development/marketing_ROI_Calculator
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install @supabase/supabase-js
npm install lucide-react
```

### Phase 2: Lead Capture Form (Day 2)
- [ ] Create Zod validation schema
- [ ] Build form component with React Hook Form
- [ ] Add phone number formatting
- [ ] Implement form submission to Supabase
- [ ] Add error handling and success feedback
- [ ] Style form with Tailwind

**Files**:
- `src/app/page.tsx` - Main form page
- `src/components/LeadCaptureForm.tsx` - Form component
- `src/lib/validations.ts` - Zod schemas
- `src/app/api/leads/route.ts` - API endpoint

### Phase 3: Calculator Page (Day 3)
- [ ] Create calculator input form
- [ ] Implement real-time calculation logic
- [ ] Build results display component
- [ ] Add comparison table
- [ ] Style calculator page

**Files**:
- `src/app/calculator/page.tsx` - Calculator page
- `src/components/CalculatorInputs.tsx` - Input form
- `src/components/ROIResults.tsx` - Results display
- `src/components/ComparisonTable.tsx` - Table component
- `src/lib/calculations.ts` - Calculation logic

### Phase 4: Data Visualization (Day 4)
- [ ] Set up Recharts with professional color palette
- [ ] Create bar chart for revenue comparison
- [ ] Create pie chart for sales distribution
- [ ] Create line chart for CPA improvement
- [ ] Make charts responsive

**Files**:
- `src/components/ROICharts.tsx` - Chart components
- `src/lib/colors.ts` - Color palette utilities

### Phase 5: GHL Integration (Day 5 - Optional)
- [ ] Set up GHL OAuth flow
- [ ] Create webhook endpoint
- [ ] Map form fields to GHL contact fields
- [ ] Test lead sync

**Files**:
- `src/app/api/ghl/oauth/route.ts` - OAuth handler
- `src/app/api/ghl/webhook/route.ts` - Webhook handler
- `src/lib/ghl.ts` - GHL API utilities

### Phase 6: Testing & Polish (Day 6)
- [ ] Test form validation edge cases
- [ ] Test calculation accuracy
- [ ] Test mobile responsiveness
- [ ] Add loading states
- [ ] Add animations/transitions
- [ ] Accessibility audit (WCAG compliance)

### Phase 7: Deployment (Day 7)
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Test production deployment

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GHL (Optional)
GHL_CLIENT_ID=your-ghl-client-id
GHL_CLIENT_SECRET=your-ghl-client-secret
GHL_REDIRECT_URI=https://yourdomain.com/api/ghl/oauth/callback

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Example User Flow

1. **User lands on homepage** → Sees lead capture form
2. **User fills out form** → Enters contact info
3. **Form validates** → Real-time error feedback
4. **User submits** → Data saved to Supabase
5. **Redirects to calculator** → Pre-filled with their info
6. **User enters baseline metrics** → Leads, sales, spend, revenue
7. **User sets target CR** → E.g., 8%
8. **Calculations run instantly** → All metrics update
9. **Results displayed** → Table + charts show improvement
10. **User can adjust** → Change target CR, see new results
11. **Optional: Download/Share** → PDF report or shareable link

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "recharts": "^2.10.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## Success Metrics

- **Form Conversion**: Track % of visitors who complete form
- **Calculator Usage**: Track % of form completers who use calculator
- **Lead Quality**: Track email deliverability and phone validity
- **Engagement Time**: Track time spent on calculator page
- **Viral Coefficient**: Track shares/referrals (if sharing enabled)

---

## Future Enhancements (V2)

1. **PDF Report Generation**: Export calculator results as PDF
2. **Email Follow-up**: Auto-send results to user's email
3. **Comparison Mode**: Compare multiple scenarios side-by-side
4. **Industry Benchmarks**: Show how their metrics compare to industry averages
5. **Custom Branding**: White-label version for agencies
6. **Multi-Currency**: Support for international currencies
7. **Advanced Charts**: Funnel visualization, ROI timeline projection
8. **A/B Testing**: Test different form layouts and CTAs
9. **Analytics Dashboard**: Admin view of all leads and calculations
10. **CRM Integrations**: Beyond GHL (Salesforce, HubSpot, etc.)

---

## References

- **Attack Kit**: `/mnt/c/development/resources/ATTACK_KIT.md`
- **Next.js Setup**: `/mnt/c/development/resources/attack-kit/NEXTJS_QUICKSTART.md`
- **UI Standards**: `/mnt/c/development/resources/UI_CHART_STANDARDS.md`
- **GHL Integration**: `/mnt/c/development/resources/ghl-universal/OAUTH_GUIDE.md`
- **Analytics Patterns**: `/mnt/c/development/resources/ANALYTICS_PATTERNS.md`

---

## Notes

- Use TypeScript for all files (required by attack kit standards)
- Follow Next.js 15 App Router patterns (not Pages Router)
- Use Tailwind CSS v3 (NOT v4 - breaking changes)
- Implement mobile-first responsive design
- Ensure WCAG AA accessibility compliance
- All calculations run client-side for instant feedback
- Optional server-side storage for analytics

---

**Status**: Planning Complete ✅
**Ready for Implementation**: Yes
**Estimated Timeline**: 7 days (MVP)
**Deployment Target**: Vercel
