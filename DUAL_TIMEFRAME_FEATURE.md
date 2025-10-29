# Dual Timeframe Feature - Implementation Guide

## Overview

The Marketing ROI Calculator allows users to input their data in **either weekly OR monthly** format, and automatically displays results in **BOTH timeframes** for comprehensive planning.

---

## User Experience

### Input Selection
Users choose their preferred time period when entering baseline metrics:

```
Time Period:  ⚪ Weekly  ⚫ Monthly
```

### Automatic Conversion
The calculator automatically converts the input data to the other timeframe:

- **If user enters MONTHLY data** → Calculator shows Monthly + Weekly results
- **If user enters WEEKLY data** → Calculator shows Weekly + Monthly results

### Dual Results Display
Results are displayed side-by-side or in toggle tabs showing:
- Weekly impact
- Monthly impact
- Both derived from the same input

---

## Example Use Case

### User Inputs (Monthly)
```
Time Period: Monthly
Leads: 5,202
Sales: 308
Ad Spend: $560,000
Revenue: $4,000,000
Target CR: 8%
```

### Calculator Shows BOTH:

#### 📅 Weekly Results
```
Current Performance:
- Leads: 1,197/week
- Sales: 71/week
- Ad Spend: $128,879/week
- Revenue: $920,507/week
- CR: 5.92%
- CPA: $1,818

Improved Performance (8% CR):
- Sales: 96/week (+25)
- Revenue: $1,246,752/week (+$326,245)
- CPA: $1,342 (-26%)
```

#### 📅 Monthly Results
```
Current Performance:
- Leads: 5,202/month
- Sales: 308/month
- Ad Spend: $560,000/month
- Revenue: $4,000,000/month
- CR: 5.92%
- CPA: $1,818

Improved Performance (8% CR):
- Sales: 416/month (+108)
- Revenue: $5,402,597/month (+$1,402,597)
- CPA: $1,346 (-26%)
```

---

## Benefits

### 1. Better Planning Flexibility
Users can:
- Track weekly KPIs for agile marketing
- Plan monthly budgets for finance teams
- Switch perspectives without re-entering data

### 2. Improved Communication
- **For Marketing Teams**: Weekly metrics for sprint planning
- **For Finance Teams**: Monthly metrics for budget forecasting
- **For Leadership**: Both views for comprehensive reporting

### 3. Real-World Scenarios
- **Campaign Managers**: Monitor weekly performance
- **CFOs**: Review monthly P&L impact
- **Sales Teams**: Track monthly quota progress

---

## Technical Implementation

### Time Period Conversion Formula

**Average weeks per month:**
```typescript
const WEEKS_PER_MONTH = 4.345;
// Calculation: 365.25 days/year ÷ 12 months ÷ 7 days/week
```

**Weekly to Monthly:**
```typescript
monthlyValue = weeklyValue × 4.345
```

**Monthly to Weekly:**
```typescript
weeklyValue = monthlyValue ÷ 4.345
```

### Data Flow

```
User Input
    ↓
Time Period Selection
    ↓
Baseline Metrics Entry
    ↓
Convert to Both Timeframes
    ↓
Calculate ROI for Both
    ↓
Display Dual Results
```

---

## UI Components

### 1. Time Period Selector (Radio Buttons)
```html
<div>
  <label>Time Period *</label>
  <div class="flex gap-4">
    <label>
      <input type="radio" name="timePeriod" value="weekly" />
      Weekly
    </label>
    <label>
      <input type="radio" name="timePeriod" value="monthly" checked />
      Monthly
    </label>
  </div>
</div>
```

### 2. Dynamic Input Labels
```html
<!-- Changes based on selected time period -->
<label>Number of Leads (per {timePeriod})</label>
<input type="number" placeholder="5,202" />
```

### 3. Dual Results Tabs
```html
<div class="tabs">
  <button class="tab-active">📅 Weekly View</button>
  <button>📅 Monthly View</button>
</div>

<div class="tab-content">
  <!-- Weekly results -->
</div>

<div class="tab-content hidden">
  <!-- Monthly results -->
</div>
```

### 4. Side-by-Side Comparison
```html
<div class="grid grid-cols-2 gap-4">
  <div class="card">
    <h3>📅 Weekly Impact</h3>
    <!-- Weekly metrics -->
  </div>

  <div class="card">
    <h3>📅 Monthly Impact</h3>
    <!-- Monthly metrics -->
  </div>
</div>
```

---

## Calculation Examples

### Scenario 1: User Enters Monthly Data

**Input:**
```typescript
{
  leads: 5202,
  sales: 308,
  adSpend: 560000,
  revenue: 4000000,
  timePeriod: 'monthly',
  targetCR: 8
}
```

**Step 1: Convert to Weekly**
```typescript
weeklyLeads = 5202 ÷ 4.345 = 1,197
weeklySales = 308 ÷ 4.345 = 71
weeklyAdSpend = 560000 ÷ 4.345 = $128,879
weeklyRevenue = 4000000 ÷ 4.345 = $920,507
```

**Step 2: Calculate ROI for Both**
```typescript
weeklyResults = calculateROI(weeklyBaseline, { targetCR: 8 })
monthlyResults = calculateROI(monthlyBaseline, { targetCR: 8 })
```

**Output:**
```typescript
{
  weekly: {
    leads: 1197,
    sales: 71,
    newSales: 96,
    salesIncrease: 25,
    revenueIncrease: 326245,
    cpaImprovement: 26.19
  },
  monthly: {
    leads: 5202,
    sales: 308,
    newSales: 416,
    salesIncrease: 108,
    revenueIncrease: 1402597,
    cpaImprovement: 25.96
  },
  inputPeriod: 'monthly'
}
```

---

### Scenario 2: User Enters Weekly Data

**Input:**
```typescript
{
  leads: 1200,
  sales: 72,
  adSpend: 130000,
  revenue: 950000,
  timePeriod: 'weekly',
  targetCR: 8
}
```

**Step 1: Convert to Monthly**
```typescript
monthlyLeads = 1200 × 4.345 = 5,214
monthlySales = 72 × 4.345 = 313
monthlyAdSpend = 130000 × 4.345 = $564,850
monthlyRevenue = 950000 × 4.345 = $4,127,750
```

**Step 2: Calculate ROI for Both**
```typescript
weeklyResults = calculateROI(weeklyBaseline, { targetCR: 8 })
monthlyResults = calculateROI(monthlyBaseline, { targetCR: 8 })
```

**Output:**
```typescript
{
  weekly: {
    leads: 1200,
    sales: 72,
    newSales: 96,
    salesIncrease: 24,
    revenueIncrease: 316667,
    cpaImprovement: 25.0
  },
  monthly: {
    leads: 5214,
    sales: 313,
    newSales: 417,
    salesIncrease: 104,
    revenueIncrease: 1,375,750,
    cpaImprovement: 25.0
  },
  inputPeriod: 'weekly'
}
```

---

## Validation Rules

### Time Period Consistency
- All metrics must be for the SAME time period
- If user selects "Monthly", all inputs should be monthly totals
- If user selects "Weekly", all inputs should be weekly totals

### Conversion Accuracy
- Use 4.345 weeks/month for accuracy (not 4 or 4.33)
- Round converted values to whole numbers for display
- Maintain precision during calculations

### Display Guidelines
- Always show which timeframe the user entered
- Highlight the user's input timeframe
- Label all numbers with time period (e.g., "/week", "/month")

---

## User Stories

### Story 1: Marketing Manager
**As a** marketing manager,
**I want to** see weekly performance metrics,
**So that** I can optimize campaigns in real-time.

**Acceptance Criteria:**
- ✅ Can input monthly data from finance team
- ✅ View weekly breakdown automatically
- ✅ Track week-over-week improvements

---

### Story 2: Finance Director
**As a** finance director,
**I want to** see monthly revenue impact,
**So that** I can forecast quarterly budgets.

**Acceptance Criteria:**
- ✅ Can input weekly campaign data
- ✅ View monthly projections automatically
- ✅ Export monthly reports

---

### Story 3: Executive Leadership
**As an** executive,
**I want to** see both weekly and monthly views,
**So that** I can make informed strategic decisions.

**Acceptance Criteria:**
- ✅ See immediate (weekly) and long-term (monthly) impact
- ✅ Toggle between timeframes easily
- ✅ Compare both perspectives side-by-side

---

## Chart Visualizations

### Timeframe Toggle for Charts
Each chart has a toggle to switch between weekly and monthly views:

```
Revenue Comparison Chart
[📅 Weekly] [📅 Monthly]  ← Toggle buttons

[Bar chart showing selected timeframe]
```

### Dynamic Chart Labels
- **Weekly View**: "Revenue per Week", "$326K increase/week"
- **Monthly View**: "Revenue per Month", "$1.4M increase/month"

### Chart Data Sets
```typescript
const chartData = {
  weekly: [
    { label: 'Current', value: 920507 },
    { label: 'Improved', value: 1246752 }
  ],
  monthly: [
    { label: 'Current', value: 4000000 },
    { label: 'Improved', value: 5402597 }
  ]
};
```

---

## Database Schema Update

### Add Time Period Field
```sql
ALTER TABLE calculator_results
ADD COLUMN time_period VARCHAR(10) CHECK (time_period IN ('weekly', 'monthly'));

-- Store which timeframe the user entered
-- Derived timeframe results can be calculated on-the-fly
```

---

## API Response Format

### Dual Timeframe Response
```json
{
  "inputPeriod": "monthly",
  "weekly": {
    "baseline": {
      "leads": 1197,
      "sales": 71,
      "adSpend": 128879,
      "revenue": 920507
    },
    "results": {
      "currentCR": 5.92,
      "currentCPA": 1818,
      "newSales": 96,
      "newCPA": 1342,
      "newRevenue": 1246752,
      "revenueIncrease": 326245,
      "cpaImprovement": 26.19,
      "salesIncrease": 25
    }
  },
  "monthly": {
    "baseline": {
      "leads": 5202,
      "sales": 308,
      "adSpend": 560000,
      "revenue": 4000000
    },
    "results": {
      "currentCR": 5.92,
      "currentCPA": 1818,
      "newSales": 416,
      "newCPA": 1346,
      "newRevenue": 5402597,
      "revenueIncrease": 1402597,
      "cpaImprovement": 25.96,
      "salesIncrease": 108
    }
  }
}
```

---

## Testing Checklist

### Conversion Accuracy
- [ ] Monthly to weekly conversion is accurate (÷ 4.345)
- [ ] Weekly to monthly conversion is accurate (× 4.345)
- [ ] Rounding doesn't introduce significant errors

### UI/UX
- [ ] Time period selector works correctly
- [ ] Input labels update dynamically
- [ ] Both result sets display correctly
- [ ] Charts toggle between timeframes
- [ ] Mobile responsive for dual views

### Calculations
- [ ] Weekly CR matches monthly CR (should be same %)
- [ ] CPA is consistent across timeframes
- [ ] Revenue increase scales proportionally
- [ ] All percentages calculate correctly

### Edge Cases
- [ ] Very small weekly numbers (< 10 sales/week)
- [ ] Very large monthly numbers (> 1M leads/month)
- [ ] Switching time period after entering data
- [ ] Decimal precision in conversions

---

## Summary

**What the feature does:**
- Users select weekly OR monthly data entry
- Calculator shows results in BOTH timeframes
- Provides flexibility for different planning needs

**Why it's valuable:**
- Marketing teams get weekly insights
- Finance teams get monthly projections
- Everyone sees the complete picture

**How it works:**
- 4.345 weeks per month conversion factor
- Automatic bidirectional conversion
- Dual calculation engine
- Side-by-side or tabbed display

**Ready for implementation:** ✅ Yes
**Complexity:** Medium
**User Impact:** High (major feature)
