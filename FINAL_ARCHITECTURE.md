# Marketing ROI Calculator - Final Architecture

## User Flow

```
1. Landing Page (No Login Required)
   ├─ First Name, Last Name, Email ✅ required
   ├─ Phone ⭕ optional
   ├─ Company Name ✅ required
   ├─ Website ⭕ optional
   └─ Submit → Redirect to Calculator

2. ROI Calculator Page (No Login Required)
   ├─ Option: Login / Create Account (top right)
   │
   ├─ INPUT SECTION 1: Current Marketing ROI
   │  ├─ Time Period (weekly/monthly)
   │  ├─ Leads
   │  ├─ Sales
   │  ├─ Ad Spend
   │  └─ Revenue
   │
   ├─ AUTO-CALCULATED: Current Metrics
   │  ├─ Conversion Rate
   │  ├─ CPL (Cost per Lead)
   │  ├─ CPA (Cost per Acquisition)
   │  └─ Avg Revenue per Sale
   │
   ├─ INPUT SECTION 2: Prospective Scenario
   │  ├─ Scenario Name (e.g., "Q1 2025 Goals")
   │  ├─ Target Conversion Rate
   │  ├─ (Optional) Adjusted Leads
   │  ├─ (Optional) Adjusted Ad Spend
   │  └─ [Calculate Scenario] button
   │
   └─ RESULTS: Prospective vs Current
      ├─ Side-by-side comparison
      ├─ Weekly + Monthly views
      ├─ Charts
      └─ [Save Scenario] button (if logged in)

3. User Dashboard (Logged In Only)
   ├─ View all saved scenarios
   ├─ Compare scenarios side-by-side
   ├─ Edit/Delete scenarios
   └─ Export reports
```

---

## Database Schema

### Table: `lead_captures` (Contact Info Only)
```sql
CREATE TABLE lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact Info (from landing page)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20), -- Optional on landing page
  company_name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),

  -- User Association (if they create account later)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_captures_email ON lead_captures(email);
CREATE INDEX idx_lead_captures_user_id ON lead_captures(user_id);
CREATE INDEX idx_lead_captures_created_at ON lead_captures(created_at);
```

### Table: `calculator_sessions` (Current Marketing Data)
```sql
CREATE TABLE calculator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to contact
  lead_id UUID REFERENCES lead_captures(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Current Marketing ROI (Input Section 1)
  time_period VARCHAR(10) NOT NULL CHECK (time_period IN ('weekly', 'monthly')),
  current_leads INTEGER NOT NULL,
  current_sales INTEGER NOT NULL,
  current_ad_spend DECIMAL(12,2) NOT NULL,
  current_revenue DECIMAL(12,2) NOT NULL,

  -- Auto-Calculated Current Metrics
  current_conversion_rate DECIMAL(5,2) NOT NULL,
  current_cpl DECIMAL(10,2) NOT NULL,
  current_cpa DECIMAL(10,2) NOT NULL,
  avg_revenue_per_sale DECIMAL(10,2) NOT NULL,

  -- Session metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calculator_sessions_lead_id ON calculator_sessions(lead_id);
CREATE INDEX idx_calculator_sessions_user_id ON calculator_sessions(user_id);
CREATE INDEX idx_calculator_sessions_created_at ON calculator_sessions(created_at);
```

### Table: `roi_scenarios` (Prospective Scenarios)
```sql
CREATE TABLE roi_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to session (current data)
  session_id UUID REFERENCES calculator_sessions(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES lead_captures(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Scenario Info
  scenario_name VARCHAR(255) NOT NULL DEFAULT 'Untitled Scenario',
  scenario_description TEXT,

  -- Prospective Inputs (Input Section 2)
  target_conversion_rate DECIMAL(5,2) NOT NULL,
  prospective_leads INTEGER, -- NULL = use current_leads
  prospective_ad_spend DECIMAL(12,2), -- NULL = use current_ad_spend

  -- Auto-Calculated Prospective Metrics
  new_sales INTEGER NOT NULL,
  new_cpl DECIMAL(10,2) NOT NULL,
  new_cpa DECIMAL(10,2) NOT NULL,
  new_revenue DECIMAL(12,2) NOT NULL,

  -- Improvements (Prospective vs Current)
  sales_increase INTEGER NOT NULL,
  revenue_increase DECIMAL(12,2) NOT NULL,
  cpa_improvement_percent DECIMAL(5,2) NOT NULL,
  cpl_change_percent DECIMAL(5,2) NOT NULL,

  -- Metadata
  is_saved BOOLEAN DEFAULT false, -- true if user clicked "Save Scenario"
  is_primary BOOLEAN DEFAULT false, -- true for first scenario in session

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roi_scenarios_session_id ON roi_scenarios(session_id);
CREATE INDEX idx_roi_scenarios_user_id ON roi_scenarios(user_id);
CREATE INDEX idx_roi_scenarios_lead_id ON roi_scenarios(lead_id);
CREATE INDEX idx_roi_scenarios_created_at ON roi_scenarios(created_at);
```

### Table: `users` (Registered Accounts)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Credentials
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL, -- Required for registration
  password_hash VARCHAR(255) NOT NULL,

  -- Profile
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

### Table: `admin_settings` (Platform Admin GHL)
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',

  -- GHL Connection (platform-wide)
  ghl_enabled BOOLEAN DEFAULT false,
  ghl_access_token TEXT,
  ghl_refresh_token TEXT,
  ghl_token_expires_at TIMESTAMPTZ,
  ghl_location_id VARCHAR(255),
  ghl_location_name VARCHAR(255),

  updated_by VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `ghl_field_mappings` (Admin Configuration)
```sql
CREATE TABLE ghl_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source Field
  source_category VARCHAR(20) NOT NULL CHECK (source_category IN (
    'contact',      -- from lead_captures
    'current',      -- from calculator_sessions (current metrics)
    'prospective',  -- from roi_scenarios (prospective metrics)
    'comparison',   -- from roi_scenarios (improvements)
    'metadata'      -- system-generated
  )),
  source_field VARCHAR(100) NOT NULL,
  source_label VARCHAR(255),

  -- Destination (GHL)
  ghl_field_id VARCHAR(255),
  ghl_field_name VARCHAR(255),
  ghl_field_type VARCHAR(50), -- 'text', 'number', 'currency', etc.

  -- Formatting
  format_type VARCHAR(50), -- 'currency', 'percent', 'number', 'text'
  format_template VARCHAR(500), -- e.g., "${value:currency}"

  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghl_field_mappings_category ON ghl_field_mappings(source_category);
```

### Table: `ghl_sync_log`
```sql
CREATE TABLE ghl_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was synced
  lead_id UUID REFERENCES lead_captures(id) ON DELETE CASCADE,
  session_id UUID REFERENCES calculator_sessions(id) ON DELETE SET NULL,
  scenario_id UUID REFERENCES roi_scenarios(id) ON DELETE SET NULL,

  -- GHL Contact
  ghl_contact_id VARCHAR(255),

  -- Sync Details
  sync_type VARCHAR(20) CHECK (sync_type IN ('create', 'update', 'scenario_update')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  fields_synced JSONB,

  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ghl_sync_log_lead_id ON ghl_sync_log(lead_id);
CREATE INDEX idx_ghl_sync_log_status ON ghl_sync_log(status);
CREATE INDEX idx_ghl_sync_log_synced_at ON ghl_sync_log(synced_at);
```

---

## Available Fields for GHL Mapping

### Contact Info (`source_category = 'contact'`)
```typescript
{
  first_name: "John",
  last_name: "Smith",
  email: "john@acme.com",
  phone: "(555) 555-5555",
  company_name: "Acme Corp",
  website_url: "www.acme.com"
}
```

### Current Marketing ROI (`source_category = 'current'`)
```typescript
{
  // Inputs
  time_period: "monthly",
  current_leads: 5202,
  current_sales: 308,
  current_ad_spend: 560000,
  current_revenue: 4000000,

  // Calculated
  current_conversion_rate: 5.92,
  current_cpl: 107.65,
  current_cpa: 1818.18,
  avg_revenue_per_sale: 12987.01
}
```

### Prospective Scenario (`source_category = 'prospective'`)
```typescript
{
  // Scenario Info
  scenario_name: "Q1 2025 Goals",
  target_conversion_rate: 8.0,
  prospective_leads: 5202, // or adjusted
  prospective_ad_spend: 560000, // or adjusted

  // Calculated
  new_sales: 416,
  new_cpl: 107.65,
  new_cpa: 1346.15,
  new_revenue: 5402597
}
```

### Comparison Metrics (`source_category = 'comparison'`)
```typescript
{
  sales_increase: 108,
  revenue_increase: 1402597,
  cpa_improvement_percent: 25.96,
  cpl_change_percent: 0.0
}
```

### Metadata (`source_category = 'metadata'`)
```typescript
{
  submission_date: "2025-01-28T10:30:00Z",
  source: "ROI Calculator",
  user_registered: false,
  total_scenarios_created: 3
}
```

---

## Calculator Page UI

### Two-Input Design

```typescript
// /src/app/calculator/page.tsx
function CalculatorPage({ leadId }: { leadId: string }) {
  const [currentData, setCurrentData] = useState<CurrentROI | null>(null);
  const [prospectiveData, setProspectiveData] = useState<ProspectiveROI | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [results, setResults] = useState<ROIResults | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ROI Calculator</h1>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-secondary">
                My Scenarios
              </Link>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal} className="btn-secondary">
                Login
              </button>
              <button onClick={openRegisterModal} className="btn-primary">
                Create Account
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Current Marketing ROI */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            📊 Current Marketing ROI
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your current marketing performance data
          </p>

          <CurrentROIForm
            data={currentData}
            onChange={setCurrentData}
            onCalculate={calculateCurrent}
          />

          {currentData && (
            <div className="mt-6 bg-blue-50 p-4 rounded">
              <h3 className="font-bold mb-2">Current Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Conversion Rate</p>
                  <p className="font-bold">{currentData.current_conversion_rate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">CPL</p>
                  <p className="font-bold">${currentData.current_cpl}</p>
                </div>
                <div>
                  <p className="text-gray-600">CPA</p>
                  <p className="font-bold">${currentData.current_cpa}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Revenue/Sale</p>
                  <p className="font-bold">${currentData.avg_revenue_per_sale}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Prospective Scenario */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            🎯 Prospective Scenario
          </h2>
          <p className="text-gray-600 mb-6">
            Model a scenario to analyze potential improvements
          </p>

          {!currentData ? (
            <div className="bg-gray-100 p-8 rounded text-center">
              <p className="text-gray-600">
                Please enter your current marketing data first →
              </p>
            </div>
          ) : (
            <ProspectiveScenarioForm
              scenarioName={scenarioName}
              onScenarioNameChange={setScenarioName}
              currentData={currentData}
              data={prospectiveData}
              onChange={setProspectiveData}
              onCalculate={calculateProspective}
            />
          )}

          {prospectiveData && (
            <div className="mt-6 bg-green-50 p-4 rounded">
              <h3 className="font-bold mb-2">Prospective Metrics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">New Sales</p>
                  <p className="font-bold text-green-600">
                    {prospectiveData.new_sales}
                    <span className="text-xs ml-1">
                      (+{prospectiveData.sales_increase})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">New CPA</p>
                  <p className="font-bold text-green-600">
                    ${prospectiveData.new_cpa}
                    <span className="text-xs ml-1">
                      (-{prospectiveData.cpa_improvement_percent}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">New Revenue</p>
                  <p className="font-bold text-green-600">
                    ${prospectiveData.new_revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Revenue Increase</p>
                  <p className="font-bold text-green-600">
                    +${prospectiveData.revenue_increase.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {user && prospectiveData && (
            <button
              onClick={saveScenario}
              className="btn-primary w-full mt-4"
            >
              💾 Save This Scenario
            </button>
          )}
        </div>
      </div>

      {/* RESULTS SECTION */}
      {currentData && prospectiveData && (
        <div className="mt-8">
          <ROIResultsDisplay
            current={currentData}
            prospective={prospectiveData}
            scenarioName={scenarioName}
          />
        </div>
      )}
    </div>
  );
}
```

### Current ROI Form Component

```typescript
function CurrentROIForm({ data, onChange, onCalculate }) {
  const [formData, setFormData] = useState({
    time_period: 'monthly',
    current_leads: '',
    current_sales: '',
    current_ad_spend: '',
    current_revenue: ''
  });

  const handleSubmit = () => {
    // Validate and calculate
    const calculated = {
      ...formData,
      current_conversion_rate: (formData.current_sales / formData.current_leads) * 100,
      current_cpl: formData.current_ad_spend / formData.current_leads,
      current_cpa: formData.current_ad_spend / formData.current_sales,
      avg_revenue_per_sale: formData.current_revenue / formData.current_sales
    };

    onChange(calculated);
    onCalculate(calculated);
  };

  return (
    <div className="space-y-4">
      {/* Time Period */}
      <div>
        <label className="block font-medium mb-2">Time Period</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="time_period"
              value="weekly"
              checked={formData.time_period === 'weekly'}
              onChange={(e) => setFormData({ ...formData, time_period: e.target.value })}
            />
            Weekly
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="time_period"
              value="monthly"
              checked={formData.time_period === 'monthly'}
              onChange={(e) => setFormData({ ...formData, time_period: e.target.value })}
            />
            Monthly
          </label>
        </div>
      </div>

      {/* Leads */}
      <div>
        <label>Number of Leads *</label>
        <input
          type="number"
          value={formData.current_leads}
          onChange={(e) => setFormData({ ...formData, current_leads: e.target.value })}
          placeholder="e.g., 5,202"
          className="w-full"
        />
      </div>

      {/* Sales */}
      <div>
        <label>Number of Sales *</label>
        <input
          type="number"
          value={formData.current_sales}
          onChange={(e) => setFormData({ ...formData, current_sales: e.target.value })}
          placeholder="e.g., 308"
          className="w-full"
        />
      </div>

      {/* Ad Spend */}
      <div>
        <label>Total Ad Spend ($) *</label>
        <input
          type="number"
          value={formData.current_ad_spend}
          onChange={(e) => setFormData({ ...formData, current_ad_spend: e.target.value })}
          placeholder="e.g., 560,000"
          className="w-full"
        />
      </div>

      {/* Revenue */}
      <div>
        <label>Total Revenue ($) *</label>
        <input
          type="number"
          value={formData.current_revenue}
          onChange={(e) => setFormData({ ...formData, current_revenue: e.target.value })}
          placeholder="e.g., 4,000,000"
          className="w-full"
        />
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full">
        Calculate Current Metrics
      </button>
    </div>
  );
}
```

### Prospective Scenario Form Component

```typescript
function ProspectiveScenarioForm({
  scenarioName,
  onScenarioNameChange,
  currentData,
  data,
  onChange,
  onCalculate
}) {
  const [formData, setFormData] = useState({
    scenario_name: scenarioName || 'Untitled Scenario',
    target_conversion_rate: '',
    prospective_leads: currentData.current_leads, // Default to current
    prospective_ad_spend: currentData.current_ad_spend, // Default to current
    adjust_leads: false,
    adjust_spend: false
  });

  const handleSubmit = () => {
    // Calculate prospective metrics
    const leads = formData.adjust_leads ? formData.prospective_leads : currentData.current_leads;
    const adSpend = formData.adjust_spend ? formData.prospective_ad_spend : currentData.current_ad_spend;

    const new_sales = Math.round(leads * (formData.target_conversion_rate / 100));
    const new_cpl = adSpend / leads;
    const new_cpa = adSpend / new_sales;
    const new_revenue = new_sales * currentData.avg_revenue_per_sale;

    const calculated = {
      ...formData,
      prospective_leads: leads,
      prospective_ad_spend: adSpend,
      new_sales,
      new_cpl,
      new_cpa,
      new_revenue,
      sales_increase: new_sales - currentData.current_sales,
      revenue_increase: new_revenue - currentData.current_revenue,
      cpa_improvement_percent: ((currentData.current_cpa - new_cpa) / currentData.current_cpa) * 100,
      cpl_change_percent: ((currentData.current_cpl - new_cpl) / currentData.current_cpl) * 100
    };

    onChange(calculated);
    onCalculate(calculated);
  };

  return (
    <div className="space-y-4">
      {/* Scenario Name */}
      <div>
        <label>Scenario Name *</label>
        <input
          type="text"
          value={formData.scenario_name}
          onChange={(e) => {
            setFormData({ ...formData, scenario_name: e.target.value });
            onScenarioNameChange(e.target.value);
          }}
          placeholder="e.g., Q1 2025 Goals"
          className="w-full"
        />
      </div>

      {/* Target Conversion Rate */}
      <div>
        <label>Target Conversion Rate (%) *</label>
        <input
          type="number"
          step="0.01"
          value={formData.target_conversion_rate}
          onChange={(e) => setFormData({ ...formData, target_conversion_rate: e.target.value })}
          placeholder={`Current: ${currentData.current_conversion_rate}%`}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">
          Current: {currentData.current_conversion_rate}%
        </p>
      </div>

      {/* Optional: Adjust Leads */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.adjust_leads}
            onChange={(e) => setFormData({ ...formData, adjust_leads: e.target.checked })}
          />
          <span>Adjust number of leads</span>
        </label>

        {formData.adjust_leads && (
          <input
            type="number"
            value={formData.prospective_leads}
            onChange={(e) => setFormData({ ...formData, prospective_leads: e.target.value })}
            placeholder={`Current: ${currentData.current_leads}`}
            className="w-full mt-2"
          />
        )}
      </div>

      {/* Optional: Adjust Ad Spend */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.adjust_spend}
            onChange={(e) => setFormData({ ...formData, adjust_spend: e.target.checked })}
          />
          <span>Adjust ad spend</span>
        </label>

        {formData.adjust_spend && (
          <input
            type="number"
            value={formData.prospective_ad_spend}
            onChange={(e) => setFormData({ ...formData, prospective_ad_spend: e.target.value })}
            placeholder={`Current: $${currentData.current_ad_spend}`}
            className="w-full mt-2"
          />
        )}
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full">
        Calculate Scenario
      </button>
    </div>
  );
}
```

---

## User Dashboard (Logged In Only)

```typescript
// /src/app/dashboard/page.tsx
function UserDashboard({ user }: { user: User }) {
  const [scenarios, setScenarios] = useState<ROIScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  useEffect(() => {
    fetchUserScenarios(user.id).then(setScenarios);
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Scenarios</h1>
          <p className="text-gray-600">View and compare your saved ROI scenarios</p>
        </div>
        <Link href="/calculator" className="btn-primary">
          + New Scenario
        </Link>
      </div>

      {/* Scenario List */}
      <div className="grid grid-cols-1 gap-4">
        {scenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedScenarios.includes(scenario.id)}
            onSelect={() => toggleSelection(scenario.id)}
            onDelete={() => deleteScenario(scenario.id)}
            onEdit={() => editScenario(scenario.id)}
          />
        ))}
      </div>

      {/* Compare Button */}
      {selectedScenarios.length >= 2 && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={compareScenarios}
            className="btn-primary btn-lg shadow-lg"
          >
            Compare {selectedScenarios.length} Scenarios
          </button>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario, isSelected, onSelect, onDelete, onEdit }) {
  return (
    <div className={`card ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">{scenario.scenario_name}</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(scenario.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={onEdit} className="btn-secondary btn-sm">
                Edit
              </button>
              <button onClick={onDelete} className="btn-secondary btn-sm text-red-600">
                Delete
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">Target CR</p>
              <p className="font-bold">{scenario.target_conversion_rate}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600">Sales Increase</p>
              <p className="font-bold text-green-600">+{scenario.sales_increase}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600">Revenue Increase</p>
              <p className="font-bold text-green-600">
                +${scenario.revenue_increase.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">CPA Improvement</p>
              <p className="font-bold text-blue-600">
                -{scenario.cpa_improvement_percent}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Data Flow

### Non-Logged-In User
```
1. Fills landing page form
   ↓
2. lead_captures record created (user_id = NULL)
   ↓
3. Synced to admin's GHL (contact info only)
   ↓
4. Uses calculator (enters current + prospective)
   ↓
5. calculator_sessions record created
   ↓
6. roi_scenarios record created (is_saved = false)
   ↓
7. Synced to admin's GHL (updates contact with calculator data)
   ↓
8. Creates another scenario
   ↓
9. New roi_scenarios record created
   ↓
10. Synced to admin's GHL again (latest scenario)

❌ Cannot view history
❌ Cannot save scenarios
❌ Scenarios marked as is_saved = false
```

### Logged-In User
```
1. Same as above (1-7)
   ↓
8. Clicks "Save Scenario"
   ↓
9. roi_scenarios.is_saved = true
   ↓
10. Available in "My Scenarios" dashboard
   ↓
11. Can view, compare, edit, delete
   ↓
12. Creates new scenario
   ↓
13. New roi_scenarios record (linked to user_id)
   ↓
14. Can save or discard
```

---

## GHL Sync Strategy

### Initial Contact Sync (Landing Page)
```
Trigger: Lead submits landing page form
Syncs: Contact info only
Creates: GHL contact
```

### First Calculator Use (Current + Prospective)
```
Trigger: User calculates first scenario
Syncs: Contact info + Current metrics + First scenario
Updates: GHL contact with custom fields
```

### Additional Scenarios
```
Trigger: User creates new scenario
Syncs: Latest scenario data
Updates: GHL contact (overwrites previous scenario OR creates new activity)

Admin Option:
- Overwrite previous scenario data
- Create GHL note/activity for each scenario
```

---

## Summary

### Key Features

1. ✅ **Two-Input Calculator**
   - Current Marketing ROI
   - Prospective Scenario

2. ✅ **Unlimited Scenarios**
   - Each prospective creates new record
   - Non-logged-in: synced but not saved
   - Logged-in: can save and view history

3. ✅ **Historical Tracking**
   - Dashboard shows all saved scenarios
   - Compare multiple scenarios
   - Edit/Delete scenarios

4. ✅ **GHL Sync**
   - All data goes to admin's GHL
   - Configurable field mapping
   - Scenarios synced on each calculation

### Database Tables
- ✅ `lead_captures` - Contact info
- ✅ `calculator_sessions` - Current ROI data
- ✅ `roi_scenarios` - Prospective scenarios (one per calculation)
- ✅ `users` - Registered accounts
- ✅ `admin_settings` - Admin GHL connection
- ✅ `ghl_field_mappings` - Admin field config
- ✅ `ghl_sync_log` - Sync history

**Is this the complete architecture you need?**
