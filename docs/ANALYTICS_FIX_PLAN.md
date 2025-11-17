# Analytics System - Comprehensive Fix Plan

## Issues Identified

### 1. Missing Geo Data in Visits ❌
**Problem**: `calculator_visits` records show `NULL` for city, region, country, etc.
**Root Cause**: Geo data is fetched asynchronously AFTER the visit is inserted, and the async update may be failing silently
**Location**: `app/api/track-calculator-visit/route.ts:62-94`

### 2. Missing Brand Name in Visits Display ❌
**Problem**: Visit table shows "Referrer" but not which brand/domain was visited
**Root Cause**:
- `calculator_visits` table has `brand_id` but it's not being fetched or displayed
- Admin page doesn't join brands data
- VisitsTable doesn't have brand column
**Locations**:
- `app/admin/page.tsx:105-109` - No brand join
- `components/admin/VisitsTable.tsx` - No brand column

### 3. Missing Page Path in Visits ❌
**Problem**: Can't see which page the user visited (landing page vs calculator)
**Root Cause**: `page_path` is not being passed in the tracking call
**Location**: `app/calculator/page.tsx:90-102` - Tracking visit without page_path

---

## Fix Plan

### Fix 1: Make Geo Data Capture Synchronous
**Change**: Wait for geo data before responding
**Benefit**: Ensures geo data is always captured
**Files to modify**:
1. `app/api/track-calculator-visit/route.ts`

### Fix 2: Add Brand Information to Visit Display
**Changes**:
1. Fetch brand information in admin page
2. Add brand_id to CalculatorVisit interface
3. Add brand name column to VisitsTable
4. Show "Brand: Goldmine AI" instead of just URL
**Files to modify**:
1. `app/admin/page.tsx`
2. `components/admin/VisitsTable.tsx`

### Fix 3: Add Page Path to Tracking
**Change**: Pass page='/calculator' when tracking calculator visits
**Files to modify**:
1. `app/calculator/page.tsx`

### Fix 4: Ensure visit_logs are being created
**Change**: Verify visit_logs table is being used in lead-capture
**Files to check**:
1. `app/api/lead-capture/route.ts:110-122`

---

## Testing Plan

### 1. Test Visit Tracking
- [ ] Submit lead form
- [ ] Visit calculator page
- [ ] Check calculator_visits has geo data
- [ ] Check brand_id is captured
- [ ] Check page_path is captured

### 2. Test Admin Display
- [ ] View visits in admin panel
- [ ] Verify brand name shows (not just URL)
- [ ] Verify geo data displays (city, region, country)
- [ ] Verify page path shows

### 3. Test visit_logs
- [ ] Check visit_logs table has records
- [ ] Verify lead_capture_id is linked

---

## Implementation Order

1. ✅ Fix geo data capture (make synchronous)
2. ✅ Fix brand display in admin
3. ✅ Fix page_path tracking
4. ✅ Test all scenarios
5. ✅ Deploy
6. ✅ Verify in production
