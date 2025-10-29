# Marketing ROI Calculator - UI/UX Wireframes

## Design System

### Color Palette
```
Primary: #0077CC (Blue)
Secondary: #8E24AA (Purple)
Success: #00C853 (Emerald)
Warning: #FFB300 (Amber)
Error: #C62828 (Crimson)
Accent: #00897B (Teal)

Grays:
- Black: #000000
- Dark Gray: #2C2C2C
- Medium Gray: #808080
- Light Gray: #D9D9D9
- White: #FFFFFF
```

### Typography
```
Headings: Font-bold, text-2xl to text-5xl
Body: Font-normal, text-base
Labels: Font-medium, text-sm
Captions: Font-normal, text-xs
```

### Spacing
```
Container: max-w-7xl, mx-auto, px-4
Sections: py-16
Cards: p-6 to p-8
Gaps: gap-4 to gap-8
```

---

## Page 1: Lead Capture Form

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│                                                              │
│  [Logo]                        Marketing ROI Calculator      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      HERO SECTION                            │
│                                                              │
│     Discover How Much Revenue You're Leaving              │
│              on the Table                                    │
│                                                              │
│  See the exact dollar impact of improving your conversion    │
│  rate with our free ROI calculator                          │
│                                                              │
│              ┌──────────────────────┐                       │
│              │   [Start Calculator] │                       │
│              └──────────────────────┘                       │
│                   (Scroll to form)                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    LEAD CAPTURE FORM                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Get Your Free ROI Analysis                        │    │
│  │                                                     │    │
│  │  ┌─────────────────────┬───────────────────────┐  │    │
│  │  │ First Name *        │ Last Name *           │  │    │
│  │  │ [              ]   │ [              ]     │  │    │
│  │  └─────────────────────┴───────────────────────┘  │    │
│  │                                                     │    │
│  │  Email Address *                                   │    │
│  │  [                                              ]  │    │
│  │                                                     │    │
│  │  Phone Number *                                    │    │
│  │  [                                              ]  │    │
│  │  (Format: (555) 555-5555)                          │    │
│  │                                                     │    │
│  │  Company Name *                                    │    │
│  │  [                                              ]  │    │
│  │                                                     │    │
│  │  Website (optional)                                │    │
│  │  [                                              ]  │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Calculate My ROI →                      │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  By submitting, you agree to our Privacy Policy   │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   TRUST INDICATORS                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 🔒       │  │ ⚡       │  │ 📊       │                 │
│  │ Secure   │  │ Instant  │  │ Free     │                 │
│  │ Data     │  │ Results  │  │ Analysis │                 │
│  └──────────┘  │──────────┘  └──────────┘                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
│                                                              │
│  © 2025 Marketing ROI Calculator | Privacy | Terms          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Form Field Details

#### First Name & Last Name (Side-by-Side)
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label>First Name *</label>
    <input type="text" placeholder="John" />
    {error && <p class="text-red-600 text-sm">{error}</p>}
  </div>
  <div>
    <label>Last Name *</label>
    <input type="text" placeholder="Smith" />
  </div>
</div>
```

#### Email Address
```html
<div>
  <label>Email Address *</label>
  <input type="email" placeholder="john@company.com" />
  <p class="text-gray-600 text-xs">We'll never share your email</p>
</div>
```

#### Phone Number (with Formatting)
```html
<div>
  <label>Phone Number *</label>
  <input type="tel" placeholder="(555) 555-5555" />
  <p class="text-gray-600 text-xs">Format: (555) 555-5555</p>
</div>
```

#### Company Name
```html
<div>
  <label>Company Name *</label>
  <input type="text" placeholder="Acme Corporation" />
</div>
```

#### Website (Optional)
```html
<div>
  <label>Website <span class="text-gray-500">(optional)</span></label>
  <input type="url" placeholder="https://www.example.com" />
</div>
```

### Validation States

#### Success State
```
┌────────────────────────────────┐
│ First Name *                   │
│ ┌────────────────────────────┐ │
│ │ John                     ✓ │ │
│ └────────────────────────────┘ │
│ (Green border)                  │
└────────────────────────────────┘
```

#### Error State
```
┌────────────────────────────────┐
│ Email Address *                │
│ ┌────────────────────────────┐ │
│ │ invalid-email              │ │
│ └────────────────────────────┘ │
│ ⚠ Please enter a valid email  │
│ (Red text, red border)          │
└────────────────────────────────┘
```

#### Loading State
```
┌────────────────────────────────┐
│  Submitting your information...│
│           [ ⌛ ]                │
│  (Disabled form, spinner)       │
└────────────────────────────────┘
```

---

## Page 2: ROI Calculator

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│                                                              │
│  [Logo]         ROI Calculator         [Back to Home]       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   WELCOME MESSAGE                            │
│                                                              │
│     Welcome back, John! 👋                                  │
│     Enter your current metrics to see your ROI potential    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┬───────────────────────────┐  │
│  │                          │                           │  │
│  │   BASELINE INPUTS        │      CURRENT METRICS       │  │
│  │   (Left Panel)           │      (Right Panel)         │  │
│  │                          │                           │  │
│  │  Time Period *           │  Conversion Rate          │  │
│  │  ⚪ Weekly ⚫ Monthly     │  5.92%                    │  │
│  │                          │                           │  │
│  │  Number of Leads         │  Cost per Acquisition     │  │
│  │  [5,202            ]     │  $1,818                   │  │
│  │                          │                           │  │
│  │  Number of Sales         │  Avg Revenue per Sale     │  │
│  │  [308              ]     │  $12,987                  │  │
│  │                          │                           │  │
│  │  Total Ad Spend          │                           │  │
│  │  [$560,000         ]     │                           │  │
│  │                          │                           │  │
│  │  Total Revenue           │                           │  │
│  │  [$4,000,000       ]     │                           │  │
│  │                          │                           │  │
│  └──────────────────────────┴───────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   TARGET CONVERSION RATE                     │
│                                                              │
│  What conversion rate do you want to achieve?               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  Target Conversion Rate                            │    │
│  │                                                     │    │
│  │  [====●===============] 8.0%                       │    │
│  │  (Slider: 6% - 15%)                                │    │
│  │                                                     │    │
│  │  or enter manually: [8.0] %                        │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                      RESULTS SECTION                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │     Your ROI Improvement Summary (Both Views)       │    │
│  │                                                     │    │
│  │     [Weekly View] [Monthly View]  (Toggle Tabs)    │    │
│  │                                                     │    │
│  │  ┌──────────────────────┬──────────────────────┐   │    │
│  │  │                      │                      │   │    │
│  │  │   📅 WEEKLY          │   📅 MONTHLY         │   │    │
│  │  │                      │                      │   │    │
│  │  │  Current    Improved │  Current    Improved │   │    │
│  │  │  ────────────────────│  ────────────────────│   │    │
│  │  │  Leads               │  Leads               │   │    │
│  │  │  1,197      1,197    │  5,202      5,202    │   │    │
│  │  │                      │                      │   │    │
│  │  │  Sales               │  Sales               │   │    │
│  │  │  71         96       │  308        416      │   │    │
│  │  │  (+25)      ↑        │  (+108)     ↑        │   │    │
│  │  │                      │                      │   │    │
│  │  │  CPL (per lead)      │  CPL (per lead)      │   │    │
│  │  │  $108      $108      │  $108      $108      │   │    │
│  │  │  (no change) —       │  (no change) —       │   │    │
│  │  │                      │                      │   │    │
│  │  │  CPA (per sale)      │  CPA (per sale)      │   │    │
│  │  │  $1,818    $1,342    │  $1,818    $1,346    │   │    │
│  │  │  (-26%)     ↓        │  (-26%)     ↓        │   │    │
│  │  │                      │                      │   │    │
│  │  │  Revenue             │  Revenue             │   │    │
│  │  │  $921K     $1.25M    │  $4.0M     $5.4M     │   │    │
│  │  │  (+$326K)   ↑        │  (+$1.4M)   ↑        │   │    │
│  │  │                      │                      │   │    │
│  │  └──────────────────────┴──────────────────────┘   │    │
│  │                                                     │    │
│  │  💡 Tip: These are the same data shown in          │    │
│  │      different time periods for easier planning    │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │           KEY INSIGHTS                              │    │
│  │           [Weekly] [Monthly]  (Toggle)             │    │
│  │                                                     │    │
│  │  📅 WEEKLY IMPACT:                                 │    │
│  │  🚀 +25 Additional Sales per week                  │    │
│  │     By improving CR from 5.92% to 8%               │    │
│  │                                                     │    │
│  │  💰 +$326,245 Revenue per week                     │    │
│  │     35% revenue growth with same ad spend          │    │
│  │                                                     │    │
│  │  📉 26% Lower CPA                                  │    │
│  │     From $1,818 down to $1,342 per sale            │    │
│  │                                                     │    │
│  │  ────────────────────────────────────────────      │    │
│  │                                                     │    │
│  │  📅 MONTHLY IMPACT:                                │    │
│  │  🚀 +108 Additional Sales per month                │    │
│  │     By improving CR from 5.92% to 8%               │    │
│  │                                                     │    │
│  │  💰 +$1,402,597 Revenue per month                  │    │
│  │     35% revenue growth with same ad spend          │    │
│  │                                                     │    │
│  │  📉 26% Lower CPA                                  │    │
│  │     From $1,818 down to $1,346 per sale            │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                   VISUALIZATION SECTION                      │
│                                                              │
│  ┌────────────────┬────────────────┬────────────────┐      │
│  │                │                │                │      │
│  │  REVENUE       │  SALES         │  CPA           │      │
│  │  COMPARISON    │  DISTRIBUTION  │  IMPROVEMENT   │      │
│  │                │                │                │      │
│  │  [Bar Chart]   │  [Pie Chart]   │  [Line Chart]  │      │
│  │                │                │                │      │
│  │  Current: $4M  │  Current: 308  │  Current: $1818│      │
│  │  New: $5.4M    │  New: 416      │  New: $1346    │      │
│  │                │                │                │      │
│  └────────────────┴────────────────┴────────────────┘      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                         CTA SECTION                          │
│                                                              │
│  Ready to achieve these results?                            │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Download PDF Report │  │  Schedule Consultation│        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
│  ┌──────────────────────┐                                   │
│  │  Share Results       │                                   │
│  └──────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Input Panel (Detailed)

```
┌─────────────────────────────────────┐
│  BASELINE METRICS                   │
│                                     │
│  Time Period *                      │
│  ┌──────────┬──────────┐           │
│  │ ⚪ Weekly│⚫ Monthly│           │
│  └──────────┴──────────┘           │
│                                     │
│  Number of Leads *                  │
│  ┌───────────────────────────────┐ │
│  │ 5,202                         │ │
│  └───────────────────────────────┘ │
│  (per month)                        │
│                                     │
│  Number of Sales *                  │
│  ┌───────────────────────────────┐ │
│  │ 308                           │ │
│  └───────────────────────────────┘ │
│  (per month)                        │
│                                     │
│  Total Ad Spend *                   │
│  ┌───────────────────────────────┐ │
│  │ $ 560,000                     │ │
│  └───────────────────────────────┘ │
│  (per month)                        │
│                                     │
│  Total Revenue *                    │
│  ┌───────────────────────────────┐ │
│  │ $ 4,000,000                   │ │
│  └───────────────────────────────┘ │
│  (per month)                        │
│                                     │
│  All fields update calculations     │
│  in real-time for BOTH timeframes   │
│                                     │
└─────────────────────────────────────┘
```

### Current Metrics Panel (Auto-Calculated)

```
┌─────────────────────────────────────┐
│  CURRENT PERFORMANCE                │
│  (Auto-calculated)                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Conversion Rate             │   │
│  │                             │   │
│  │       5.92%                 │   │
│  │                             │   │
│  │ Based on 308 / 5,202 leads  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Cost per Lead (CPL)         │   │
│  │                             │   │
│  │      $107.65                │   │
│  │                             │   │
│  │ Based on $560k / 5,202 leads│   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Cost per Acquisition (CPA)  │   │
│  │                             │   │
│  │      $1,818                 │   │
│  │                             │   │
│  │ Based on $560k / 308 sales  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Avg Revenue per Sale        │   │
│  │                             │   │
│  │     $12,987                 │   │
│  │                             │   │
│  │ Based on $4M / 308 sales    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Target Conversion Rate Slider

```
┌───────────────────────────────────────────────┐
│  What conversion rate do you want to achieve? │
│                                                │
│  ┌──────────────────────────────────────┐    │
│  │                                       │    │
│  │  Current CR: 5.92%                    │    │
│  │                                       │    │
│  │  6%  [====●===============]  15%      │    │
│  │                                       │    │
│  │  Target CR: 8.0%                      │    │
│  │                                       │    │
│  │  or enter manually: [8.0] %           │    │
│  │                                       │    │
│  │  +2.08% improvement → +108 sales      │    │
│  │                                       │    │
│  └──────────────────────────────────────┘    │
│                                                │
└───────────────────────────────────────────────┘
```

### Comparison Table (Detailed)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              ROI Improvement Comparison                     │
│                                                            │
│  Metric              Current      Improved      Change     │
│  ──────────────────────────────────────────────────────    │
│                                                            │
│  Leads               5,202        5,202         —          │
│                      (same)       (same)                   │
│                                                            │
│  Sales               308          416           +108 ↑    │
│                      (baseline)   (projected)   (+35%)     │
│                                                            │
│  Conversion Rate     5.92%        8.00%         +2.08% ↑  │
│                      (baseline)   (target)      (+35%)     │
│                                                            │
│  Cost per Lead       $107.65      $107.65       —          │
│  (CPL)               (same)       (same)        (0%)       │
│                                                            │
│  Cost per Acq.       $1,818       $1,346        -$472 ↓   │
│  (CPA)               (current)    (improved)    (-26%)     │
│                                                            │
│  Revenue             $4,000,000   $5,402,597    +$1.4M ↑  │
│                      (baseline)   (projected)   (+35%)     │
│                                                            │
│  Ad Spend            $560,000     $560,000      —          │
│                      (same)       (same)                   │
│                                                            │
└────────────────────────────────────────────────────────────┘

Color Coding:
- Green ↑ = Improvement
- Red ↓ = Reduction (good for CPA)
- Gray — = No change
```

### Key Insights Cards

```
┌──────────────────────────┐
│  🚀 SALES INCREASE       │
│                          │
│      +108 Sales          │
│                          │
│  From 308 → 416 sales    │
│  by improving CR to 8%   │
│                          │
│  That's 35% more sales   │
│  with the same leads!    │
└──────────────────────────┘

┌──────────────────────────┐
│  💰 REVENUE INCREASE     │
│                          │
│   +$1,402,597            │
│                          │
│  From $4.0M → $5.4M      │
│  revenue with same spend │
│                          │
│  35% revenue growth      │
│  without more ad spend   │
└──────────────────────────┘

┌──────────────────────────┐
│  📉 CPA IMPROVEMENT      │
│                          │
│      -26% CPA            │
│                          │
│  From $1,818 → $1,346    │
│  cost per acquisition    │
│                          │
│  Save $472 per sale      │
│  with better conversion  │
└──────────────────────────┘
```

---

## Charts Specifications

### 1. Revenue Comparison Bar Chart

```
Revenue Comparison
─────────────────

$6M │
    │
$5M │              ████████
    │              ████████  $5.4M
$4M │  ████████    ████████  (+35%)
    │  ████████    ████████
$3M │  ████████    ████████
    │  ████████    ████████
$2M │  ████████    ████████
    │  ████████    ████████
$1M │  ████████    ████████
    │  ████████    ████████
$0  └──────────────────────
      Current    Improved

Colors:
- Current: #0077CC (Blue)
- Improved: #00C853 (Green)
```

### 2. Sales Distribution Pie Chart

```
Sales Distribution
──────────────────

        Current Sales (308)
        New Sales (+108)

    ╱─────────╲
   ╱           ╲
  │  Current   │
  │    60%     │  ← Blue (#0077CC)
  │ (308 sales)│
   ╲           ╱
    ╲─────────╱
       │ New
       │ 40%        ← Green (#00C853)
       │ (+108)

Total: 416 sales
```

### 3. CPA Improvement Line Chart

```
Cost per Acquisition Trend
───────────────────────────

$2000│●
     │ ╲
$1900│  ╲
     │   ╲
$1800│    ●──────────── Current CPA: $1,818
     │     ╲
$1700│      ╲
     │       ╲
$1600│        ╲
     │         ╲
$1500│          ╲
     │           ╲
$1400│            ╲
     │             ●── Improved CPA: $1,346
$1300│                 (26% reduction)
     └─────────────────────────────
      Baseline    Target

Colors:
- Line: #C62828 (Red - showing decrease is good)
- Points: #8E24AA (Purple)
```

---

## Responsive Design

### Mobile (< 640px)
```
- Stack all panels vertically
- Full-width form fields
- Simplified charts (single column)
- Larger touch targets (min 44px)
- Collapsible sections
```

### Tablet (640px - 1024px)
```
- Two-column layout for form
- Side-by-side baseline/current metrics
- Two-column chart grid
- Responsive typography
```

### Desktop (> 1024px)
```
- Multi-column layout
- Side-by-side panels
- Three-column chart grid
- Expanded visualizations
```

---

## Accessibility Features

### WCAG AA Compliance
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader labels (aria-label)
- ✅ Semantic HTML (headings, landmarks)

### Screen Reader Support
```html
<label for="leads">Number of Leads</label>
<input
  id="leads"
  type="number"
  aria-required="true"
  aria-describedby="leads-help"
/>
<p id="leads-help" class="sr-only">
  Enter the total number of leads for the month
</p>
```

---

## Animation & Interactions

### Input Changes
```
- Debounce: 300ms delay before recalculating
- Loading state: Subtle spinner on results panel
- Smooth transitions: 200ms ease-in-out
```

### Chart Animations
```
- Fade in: 400ms on initial load
- Update: 300ms smooth transition on value change
- Hover effects: Highlight data points
```

### Success States
```
- Checkmark animation on form submission
- Confetti effect on calculator results
- Green pulse on positive changes
```

---

## Summary

This UI/UX design provides:
- ✅ Clean, professional layout
- ✅ Intuitive user flow
- ✅ Real-time calculations
- ✅ Visual data representation
- ✅ Mobile-responsive design
- ✅ Accessibility compliance
- ✅ Clear call-to-actions

**Ready for Development**: Yes
**Design System**: Tailwind CSS v3
**Components**: React 19+ with TypeScript
