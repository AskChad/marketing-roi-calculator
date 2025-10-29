# AI Chat Agent & Platform Breakdown - Feature Specification

## Overview

Two major features for logged-in users:
1. **AI Chat Agent** - Query and analyze ROI data with AI assistance
2. **Per-Platform ROI Breakdown** - Track Facebook, Google, LinkedIn, etc. separately

---

## Feature 1: AI Chat Agent

### Access Control
- ✅ **Logged-In Users**: Chat about **their own data only**
- ✅ **Admins**: Chat about **ALL users' data** (platform-wide analytics)
- ❌ **Non-Logged-In**: Not available (shown as benefit to create account)

### Data Access Permissions

**Regular Users**:
```sql
-- Can only query their own data
WHERE user_id = {current_user_id}
```

**Admins**:
```sql
-- Can query ALL data across platform
-- No user_id restriction
SELECT * FROM calculator_sessions;
SELECT * FROM roi_scenarios;
SELECT * FROM session_platforms;
```

### What the AI Can Do
- Analyze ROI scenarios and provide insights
- Compare multiple scenarios
- Identify trends and patterns
- Suggest optimization strategies
- Answer questions about metrics
- Generate reports and summaries
- Explain calculations
- Recommend next steps

### Example Conversations

**User Query**: "What's my best performing scenario?"
**AI Response**:
```
Based on your 5 saved scenarios, "Q1 2025 Aggressive" performs best:

📊 Key Metrics:
• Revenue Increase: $1.8M (+45%)
• CPA Improvement: -32%
• Sales Increase: +156 sales

This scenario targets 9.5% conversion rate with current ad spend.

Would you like me to break down what's driving these improvements?
```

**User Query** (Regular User): "Compare my Facebook and Google campaigns"
**AI Response**:
```
Here's YOUR Facebook vs Google comparison:

Facebook:
• CPL: $95 (lower ✅)
• CPA: $1,450
• Conversion Rate: 6.5%
• ROI: 4.2x

Google:
• CPL: $125 (higher ❌)
• CPA: $1,200 (better ✅)
• Conversion Rate: 10.4% (better ✅)
• ROI: 5.8x (better ✅)

💡 Insight: Google has higher CPL but better conversion rate, resulting in
lower CPA and better ROI. Consider shifting budget from Facebook to Google.
```

**Admin Query**: "What's the average ROI across all users?"
**AI Response**:
```
Platform-Wide Analytics:

📊 All Users Combined:
• Total Users: 1,247
• Total Scenarios Created: 4,832
• Average ROI Improvement: +28.5%

Top Performing Industries:
1. E-commerce: +35% avg ROI improvement
2. SaaS: +31% avg ROI improvement
3. Services: +22% avg ROI improvement

Platform Performance (All Users):
• Facebook Ads: 4.2x avg ROI
• Google Ads: 5.8x avg ROI
• LinkedIn Ads: 3.1x avg ROI

💡 Insight: Users targeting 8-10% conversion rates see the best results.
```

**Admin Query**: "Show me top 10 users by revenue potential"
**AI Response**:
```
Top 10 Users by Revenue Increase Potential:

1. John Smith (Acme Corp)
   • Current Revenue: $4.2M/month
   • Potential: +$1.8M/month
   • Best Scenario: "Q1 2025 Aggressive"

2. Sarah Johnson (Tech Startup)
   • Current Revenue: $2.1M/month
   • Potential: +$1.2M/month
   • Best Scenario: "Scale Google Ads"

[... 8 more users ...]

Would you like me to analyze what's working for the top performers?
```

**Admin Query**: "Which users haven't created a scenario in 30 days?"
**AI Response**:
```
Inactive Users (Last 30 Days):

Found 156 users who haven't created scenarios recently:

High-Value Inactive:
• Email: high.value@company.com
  Last Active: 45 days ago
  Total Scenarios: 8
  Avg Revenue: $5M/month

• Email: another@business.com
  Last Active: 38 days ago
  Total Scenarios: 12
  Avg Revenue: $3.2M/month

💡 Recommendation: Send re-engagement email campaign to these users.
```

**User Query** (Regular User): "What if I increase my Facebook budget by 20%?"
**AI Response**:
```
Let me model that scenario for you...

Current Facebook:
• Spend: $250,000/month
• Leads: 2,631
• Sales: 171

With 20% budget increase:
• Spend: $300,000/month (+$50k)
• Estimated Leads: 3,157 (+526)
• Estimated Sales: 205 (+34) *assuming same conversion rate*
• Revenue Increase: ~$441k

ROI: $441k revenue / $50k spend = 8.8x return

⚠️ Note: This assumes conversion rate remains constant at 6.5%.
Would you like to model different conversion rate scenarios?
```

---

## Database Schema for AI Chat

### Table: `ai_chat_conversations`
```sql
CREATE TABLE ai_chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Context
  conversation_title VARCHAR(255),
  conversation_type VARCHAR(50) DEFAULT 'general', -- 'general', 'scenario_analysis', 'platform_comparison'

  -- Related Data (optional - what the conversation is about)
  related_scenario_ids UUID[], -- Array of scenario IDs being discussed
  related_platform_ids UUID[], -- Array of platform IDs being discussed

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX idx_ai_conversations_active ON ai_chat_conversations(is_active);
```

### Table: `ai_chat_messages`
```sql
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversation
  conversation_id UUID REFERENCES ai_chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Message Content
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- AI Metadata
  model VARCHAR(100), -- e.g., 'gpt-4', 'claude-3-opus'
  tokens_used INTEGER,
  response_time_ms INTEGER,

  -- Context Used (what data the AI accessed)
  queried_tables TEXT[], -- Array of table names accessed
  queried_scenario_ids UUID[],
  queried_platform_ids UUID[],

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX idx_ai_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX idx_ai_messages_created_at ON ai_chat_messages(created_at);
```

---

## Feature 2: Per-Platform ROI Breakdown

### Why This Matters
Users want to know:
- Which platform has the best ROI?
- Where should I increase/decrease spend?
- Which platform converts best?
- How do platforms compare?

### Platform Breakdown UI

```typescript
// Instead of single input for "Total Leads", users can break it down:

Total Leads: 5,202
├─ Facebook: 2,100 leads
├─ Google Ads: 1,800 leads
├─ LinkedIn: 800 leads
├─ TikTok: 400 leads
└─ Other: 102 leads

Total Ad Spend: $560,000
├─ Facebook: $250,000
├─ Google Ads: $200,000
├─ LinkedIn: $80,000
├─ TikTok: $25,000
└─ Other: $5,000

Total Sales: 308
├─ Facebook: 136 sales
├─ Google Ads: 125 sales
├─ LinkedIn: 35 sales
├─ TikTok: 10 sales
└─ Other: 2 sales
```

### Database Schema for Platform Data

### Table: `platforms` (Master List)
```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform Info
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_url VARCHAR(500),
  color VARCHAR(7), -- Hex color for charts

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false, -- true if user-created

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate with common platforms
INSERT INTO platforms (name, slug, color) VALUES
  ('Facebook Ads', 'facebook', '#1877F2'),
  ('Google Ads', 'google', '#4285F4'),
  ('LinkedIn Ads', 'linkedin', '#0A66C2'),
  ('TikTok Ads', 'tiktok', '#000000'),
  ('Instagram Ads', 'instagram', '#E4405F'),
  ('Twitter Ads', 'twitter', '#1DA1F2'),
  ('YouTube Ads', 'youtube', '#FF0000'),
  ('Pinterest Ads', 'pinterest', '#E60023'),
  ('Snapchat Ads', 'snapchat', '#FFFC00'),
  ('Microsoft Ads', 'microsoft', '#00A4EF'),
  ('Other', 'other', '#6B7280');
```

### Table: `session_platforms` (Platform breakdown per session)
```sql
CREATE TABLE session_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Session
  session_id UUID REFERENCES calculator_sessions(id) ON DELETE CASCADE NOT NULL,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Platform-Specific Current Metrics
  platform_leads INTEGER NOT NULL,
  platform_sales INTEGER NOT NULL,
  platform_ad_spend DECIMAL(12,2) NOT NULL,
  platform_revenue DECIMAL(12,2) NOT NULL,

  -- Auto-Calculated Platform Metrics
  platform_conversion_rate DECIMAL(5,2) NOT NULL,
  platform_cpl DECIMAL(10,2) NOT NULL,
  platform_cpa DECIMAL(10,2) NOT NULL,
  platform_roi DECIMAL(10,2) NOT NULL, -- Revenue / Ad Spend

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, platform_id)
);

CREATE INDEX idx_session_platforms_session_id ON session_platforms(session_id);
CREATE INDEX idx_session_platforms_platform_id ON session_platforms(platform_id);
CREATE INDEX idx_session_platforms_user_id ON session_platforms(user_id);
```

### Table: `scenario_platforms` (Platform breakdown per scenario)
```sql
CREATE TABLE scenario_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to Scenario
  scenario_id UUID REFERENCES roi_scenarios(id) ON DELETE CASCADE NOT NULL,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE NOT NULL,
  session_platform_id UUID REFERENCES session_platforms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Prospective Platform Adjustments
  target_conversion_rate DECIMAL(5,2) NOT NULL,
  prospective_leads INTEGER, -- NULL = use current
  prospective_ad_spend DECIMAL(12,2), -- NULL = use current

  -- Auto-Calculated Prospective Metrics
  new_sales INTEGER NOT NULL,
  new_cpl DECIMAL(10,2) NOT NULL,
  new_cpa DECIMAL(10,2) NOT NULL,
  new_revenue DECIMAL(12,2) NOT NULL,
  new_roi DECIMAL(10,2) NOT NULL,

  -- Improvements
  sales_increase INTEGER NOT NULL,
  revenue_increase DECIMAL(12,2) NOT NULL,
  cpa_improvement_percent DECIMAL(5,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scenario_id, platform_id)
);

CREATE INDEX idx_scenario_platforms_scenario_id ON scenario_platforms(scenario_id);
CREATE INDEX idx_scenario_platforms_platform_id ON scenario_platforms(platform_id);
```

---

## Calculator UI with Platform Breakdown

### Toggle: Overall vs Platform Breakdown

```typescript
// /src/app/calculator/page.tsx
function CalculatorPage() {
  const [viewMode, setViewMode] = useState<'overall' | 'platform'>('overall');
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);

  return (
    <div>
      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <span className="font-medium">Data Entry Mode:</span>
          <div className="inline-flex rounded-lg border">
            <button
              onClick={() => setViewMode('overall')}
              className={`px-4 py-2 ${viewMode === 'overall' ? 'bg-blue-600 text-white' : ''}`}
            >
              Overall Totals
            </button>
            <button
              onClick={() => setViewMode('platform')}
              className={`px-4 py-2 ${viewMode === 'platform' ? 'bg-blue-600 text-white' : ''}`}
            >
              Per-Platform Breakdown
            </button>
          </div>
          {user && (
            <p className="text-sm text-gray-600">
              💡 Compare platforms to optimize your budget
            </p>
          )}
          {!user && (
            <p className="text-sm text-blue-600">
              🔒 Login to unlock platform breakdown
            </p>
          )}
        </div>
      </div>

      {/* Current ROI Section */}
      {viewMode === 'overall' ? (
        <CurrentROIFormOverall />
      ) : (
        <CurrentROIFormPlatformBreakdown
          platforms={platforms}
          onUpdate={setPlatforms}
        />
      )}
    </div>
  );
}
```

### Platform Breakdown Form

```typescript
function CurrentROIFormPlatformBreakdown({ platforms, onUpdate }) {
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    fetchPlatforms().then(setAvailablePlatforms);
  }, []);

  const addPlatform = (platformId: string) => {
    setSelectedPlatforms([...selectedPlatforms, platformId]);
    onUpdate([...platforms, {
      platform_id: platformId,
      platform_leads: 0,
      platform_sales: 0,
      platform_ad_spend: 0,
      platform_revenue: 0
    }]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Platform Breakdown</h3>
        <select
          onChange={(e) => addPlatform(e.target.value)}
          value=""
          className="border rounded px-3 py-2"
        >
          <option value="">+ Add Platform</option>
          {availablePlatforms
            .filter(p => !selectedPlatforms.includes(p.id))
            .map(platform => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))
          }
        </select>
      </div>

      {/* Platform Cards */}
      {platforms.map((platformData, index) => {
        const platform = availablePlatforms.find(p => p.id === platformData.platform_id);

        return (
          <div key={index} className="border rounded-lg p-4" style={{ borderLeftColor: platform?.color, borderLeftWidth: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold flex items-center gap-2">
                {platform?.icon_url && <img src={platform.icon_url} alt="" className="w-5 h-5" />}
                {platform?.name}
              </h4>
              <button
                onClick={() => removePlatform(index)}
                className="text-red-600 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Leads */}
              <div>
                <label className="text-sm">Leads</label>
                <input
                  type="number"
                  value={platformData.platform_leads}
                  onChange={(e) => updatePlatform(index, 'platform_leads', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Sales */}
              <div>
                <label className="text-sm">Sales</label>
                <input
                  type="number"
                  value={platformData.platform_sales}
                  onChange={(e) => updatePlatform(index, 'platform_sales', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Ad Spend */}
              <div>
                <label className="text-sm">Ad Spend ($)</label>
                <input
                  type="number"
                  value={platformData.platform_ad_spend}
                  onChange={(e) => updatePlatform(index, 'platform_ad_spend', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Revenue */}
              <div>
                <label className="text-sm">Revenue ($)</label>
                <input
                  type="number"
                  value={platformData.platform_revenue}
                  onChange={(e) => updatePlatform(index, 'platform_revenue', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Auto-Calculated Platform Metrics */}
            {platformData.platform_leads > 0 && platformData.platform_sales > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded">
                <div>
                  <p className="text-xs text-gray-600">CR</p>
                  <p className="font-bold text-sm">
                    {((platformData.platform_sales / platformData.platform_leads) * 100).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">CPL</p>
                  <p className="font-bold text-sm">
                    ${(platformData.platform_ad_spend / platformData.platform_leads).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">CPA</p>
                  <p className="font-bold text-sm">
                    ${(platformData.platform_ad_spend / platformData.platform_sales).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">ROI</p>
                  <p className="font-bold text-sm">
                    {(platformData.platform_revenue / platformData.platform_ad_spend).toFixed(1)}x
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Totals Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold mb-2">Combined Totals</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="font-bold">{platforms.reduce((sum, p) => sum + p.platform_leads, 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="font-bold">{platforms.reduce((sum, p) => sum + p.platform_sales, 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Spend</p>
            <p className="font-bold">${platforms.reduce((sum, p) => sum + p.platform_ad_spend, 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="font-bold">${platforms.reduce((sum, p) => sum + p.platform_revenue, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Platform Comparison Dashboard

```typescript
// /src/app/dashboard/platforms/page.tsx
function PlatformComparisonPage({ user }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [platformData, setPlatformData] = useState<PlatformMetrics[]>([]);

  useEffect(() => {
    fetchUserSessions(user.id).then(setSessions);
  }, [user.id]);

  useEffect(() => {
    if (selectedSession) {
      fetchPlatformData(selectedSession).then(setPlatformData);
    }
  }, [selectedSession]);

  // Sort platforms by ROI
  const sortedPlatforms = [...platformData].sort((a, b) => b.platform_roi - a.platform_roi);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Platform Comparison</h1>

      {/* Session Selector */}
      <div className="mb-8">
        <label>Select Session to Analyze</label>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full max-w-md"
        >
          <option value="">Choose a session...</option>
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {new Date(session.created_at).toLocaleDateString()} - {session.time_period}
            </option>
          ))}
        </select>
      </div>

      {platformData.length > 0 && (
        <>
          {/* Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedPlatforms.map((platform, index) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                rank={index + 1}
              />
            ))}
          </div>

          {/* Comparison Chart */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">ROI Comparison</h2>
            <PlatformComparisonChart platforms={sortedPlatforms} />
          </div>

          {/* Metrics Table */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Detailed Metrics</h2>
            <PlatformMetricsTable platforms={sortedPlatforms} />
          </div>
        </>
      )}
    </div>
  );
}

function PlatformCard({ platform, rank }) {
  const rankColors = {
    1: 'bg-yellow-100 border-yellow-400',
    2: 'bg-gray-100 border-gray-400',
    3: 'bg-orange-100 border-orange-400'
  };

  return (
    <div className={`card ${rankColors[rank] || 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: platform.color }}
          ></div>
          <h3 className="font-bold">{platform.name}</h3>
        </div>
        {rank <= 3 && (
          <span className="text-2xl">
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">ROI</span>
          <span className="font-bold text-lg">{platform.platform_roi.toFixed(1)}x</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">CR</span>
          <span className="font-bold">{platform.platform_conversion_rate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">CPL</span>
          <span className="font-bold">${platform.platform_cpl}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">CPA</span>
          <span className="font-bold">${platform.platform_cpa}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Revenue</span>
          <span className="font-bold">${platform.platform_revenue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
```

---

## AI Chat Interface

```typescript
// /src/components/AIChatWidget.tsx
function AIChatWidget({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      created_at: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Call AI API
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: activeConversation,
        user_id: user.id,
        message: input
      })
    });

    const data = await response.json();

    // Add AI response
    const aiMessage: Message = {
      role: 'assistant',
      content: data.response,
      created_at: new Date()
    };

    setMessages([...messages, userMessage, aiMessage]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold">AI ROI Assistant</h3>
            <p className="text-sm opacity-90">Ask me anything about your data</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-4">👋 Hi! I'm your AI ROI Assistant</p>
                <p className="text-sm">Try asking:</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setInput("What's my best performing scenario?")}
                    className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm"
                  >
                    "What's my best performing scenario?"
                  </button>
                  <button
                    onClick={() => setInput("Compare my Facebook and Google campaigns")}
                    className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm"
                  >
                    "Compare my Facebook and Google campaigns"
                  </button>
                  <button
                    onClick={() => setInput("How can I improve my ROI?")}
                    className="block w-full text-left p-2 bg-gray-50 rounded hover:bg-gray-100 text-sm"
                  >
                    "How can I improve my ROI?"
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="btn-primary px-4"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Landing Page - Value Proposition Updates

```typescript
// Add to landing page after form submission benefits
function LandingPageBenefits() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Unlock Premium Features with a Free Account
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Historical Data */}
          <div className="card text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Historical Data</h3>
            <p className="text-gray-600">
              Save unlimited scenarios and view your complete calculation history
            </p>
          </div>

          {/* AI Assistant */}
          <div className="card text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI ROI Assistant</h3>
            <p className="text-gray-600">
              Chat with AI to analyze your data, compare scenarios, and get optimization recommendations
            </p>
          </div>

          {/* Platform Breakdown */}
          <div className="card text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Platform Breakdown</h3>
            <p className="text-gray-600">
              Track and compare ROI across Facebook, Google, LinkedIn, and other platforms
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All features are <strong>100% free</strong> with an account
          </p>
          <button className="btn-primary btn-lg">
            Create Free Account
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

## Admin AI Capabilities

### What Admins Can Query

**Platform-Wide Analytics**:
- Total users, scenarios, revenue across all accounts
- Average metrics by industry, platform, time period
- Trends and patterns across user base
- Best/worst performing users
- Inactive users
- Platform comparison (all users combined)

**Individual User Analysis**:
- Query any specific user's data
- Compare users to platform averages
- Identify high-value users
- Flag users needing support

**Business Intelligence**:
- Churn prediction
- Revenue opportunities
- Platform performance benchmarks
- Engagement metrics
- Conversion rate distribution

### Admin AI Examples

```typescript
// Admin can ask:
"What's the total revenue being tracked on the platform?"
"Show me users with the highest ad spend"
"What's the average CPA by industry?"
"Which platform has the best ROI across all users?"
"Show me growth trends over the last 6 months"
"Who are my power users?" (most scenarios, highest revenue)
"Compare user john@acme.com to platform averages"
```

---

## AI Chat API Endpoint

```typescript
// /src/app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const { conversation_id, user_id, message } = await request.json();

  // Get current user's role
  const currentUser = await getCurrentUser(request);

  // Determine data scope based on role
  let userData;
  let isAdmin = false;

  if (currentUser.role === 'admin') {
    // Admin can access ALL data
    userData = await getAllPlatformData();
    isAdmin = true;
  } else {
    // Regular users can only access their own data
    userData = await getUserData(currentUser.id);
    isAdmin = false;
  }

  // Build AI context
  const context = buildAIContext(userData, isAdmin);

  // Build system prompt based on role
  const systemPrompt = isAdmin
    ? buildAdminSystemPrompt(userData)
    : buildUserSystemPrompt(userData);

  // Call AI service (OpenAI, Anthropic, etc.)
  const aiResponse = await callAIService({
    system: systemPrompt,
    context: context,
    message: message
  });

  // Save conversation
  await saveMessage({
    conversation_id,
    user_id,
    role: 'user',
    content: message
  });

  await saveMessage({
    conversation_id,
    user_id,
    role: 'assistant',
    content: aiResponse.content,
    model: aiResponse.model,
    tokens_used: aiResponse.tokens
  });

  return Response.json({
    response: aiResponse.content,
    conversation_id: conversation_id
  });
}

// System prompt for regular users
function buildUserSystemPrompt(userData: UserData): string {
  return `You are an AI ROI analyst helping a marketing professional optimize their campaigns.

You have access to THIS USER'S data only:
- ${userData.scenarios.length} saved scenarios
- ${userData.platforms.length} platforms tracked
- Historical performance data

Provide insights, comparisons, and recommendations based on their data.
Be specific, use numbers, and format responses clearly.
You can ONLY answer questions about this user's own data.
`;
}

// System prompt for admins
function buildAdminSystemPrompt(platformData: PlatformData): string {
  return `You are an AI ROI analyst with ADMIN ACCESS to the entire platform.

You have access to ALL USERS' data:
- Total Users: ${platformData.totalUsers}
- Total Scenarios: ${platformData.totalScenarios}
- Total Revenue Tracked: $${platformData.totalRevenue.toLocaleString()}
- Platform-wide metrics and trends

You can:
1. Analyze individual users
2. Compare users to platform averages
3. Identify trends across the user base
4. Provide platform-wide analytics
5. Generate business intelligence reports

Provide insights, identify opportunities, and make data-driven recommendations.
Be specific, use numbers, and format responses clearly.
`;
}

// Build context for regular user
function buildAIContext(userData: UserData, isAdmin: boolean): string {
  if (isAdmin) {
    return buildAdminContext(userData as PlatformData);
  }

  return `
User has ${userData.scenarios.length} scenarios:
${userData.scenarios.map(s => `
- ${s.scenario_name}: Target CR ${s.target_conversion_rate}%, Revenue increase $${s.revenue_increase}
`).join('')}

Platforms tracked:
${userData.platforms.map(p => `
- ${p.name}: CR ${p.conversion_rate}%, ROI ${p.roi}x, Spend $${p.ad_spend}
`).join('')}
  `;
}

// Build context for admin
function buildAdminContext(platformData: PlatformData): string {
  return `
Platform Summary:
- Total Users: ${platformData.totalUsers}
- Total Scenarios: ${platformData.totalScenarios}
- Total Revenue Tracked: $${platformData.totalRevenue}
- Average Scenarios per User: ${platformData.avgScenariosPerUser}

Top Industries:
${platformData.industries.map(i => `
- ${i.name}: ${i.userCount} users, Avg ROI ${i.avgROI}x
`).join('')}

Platform Performance (All Users):
${platformData.platformStats.map(p => `
- ${p.name}: Avg ROI ${p.avgROI}x, Avg CPA $${p.avgCPA}, ${p.userCount} users
`).join('')}

Recent Activity:
- Scenarios created today: ${platformData.todayScenarios}
- New users this week: ${platformData.weekNewUsers}
- Active users (30 days): ${platformData.activeUsers}
  `;
}

// Get all platform data for admin
async function getAllPlatformData(): Promise<PlatformData> {
  const [users, scenarios, platforms] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('roi_scenarios').select('*'),
    supabase.from('session_platforms').select('*, platforms(*)')
  ]);

  // Calculate aggregates
  const totalRevenue = scenarios.data?.reduce((sum, s) => sum + s.baseline_revenue, 0) || 0;
  const avgScenariosPerUser = scenarios.data?.length / users.data?.length || 0;

  // Group by industry, platform, etc.
  // ... aggregation logic ...

  return {
    totalUsers: users.data?.length || 0,
    totalScenarios: scenarios.data?.length || 0,
    totalRevenue,
    avgScenariosPerUser,
    industries: [], // calculated
    platformStats: [], // calculated
    todayScenarios: 0, // calculated
    weekNewUsers: 0, // calculated
    activeUsers: 0 // calculated
  };
}

// Get user's own data only
async function getUserData(userId: string): Promise<UserData> {
  const [scenarios, platforms] = await Promise.all([
    supabase
      .from('roi_scenarios')
      .select('*')
      .eq('user_id', userId), // IMPORTANT: Filter by user_id

    supabase
      .from('session_platforms')
      .select('*, platforms(*)')
      .eq('user_id', userId) // IMPORTANT: Filter by user_id
  ]);

  return {
    scenarios: scenarios.data || [],
    platforms: platforms.data || []
  };
}
```

---

## Summary

### New Database Tables (5 added)
1. **`platforms`** - Master list of ad platforms
2. **`session_platforms`** - Platform breakdown per session
3. **`scenario_platforms`** - Platform breakdown per scenario
4. **`ai_chat_conversations`** - Chat history
5. **`ai_chat_messages`** - Individual messages

### Features Added
1. ✅ **AI Chat Agent**
   - Query own data
   - Get insights and recommendations
   - Compare scenarios
   - Platform analysis
   - Admins can query any user's data

2. ✅ **Per-Platform ROI Breakdown**
   - Track Facebook, Google, LinkedIn, etc.
   - Compare platform performance
   - See ROI, CPL, CPA per platform
   - Ranked platform dashboard
   - Platform comparison charts

3. ✅ **Landing Page Updates**
   - Highlight AI assistant benefit
   - Highlight platform breakdown benefit
   - Highlight historical data benefit
   - All as reasons to create account

### UI Components
- ✅ Platform breakdown form
- ✅ Platform comparison dashboard
- ✅ AI chat widget (floating)
- ✅ Platform cards with rankings
- ✅ Enhanced landing page benefits

**Ready to add this to the architecture?**
