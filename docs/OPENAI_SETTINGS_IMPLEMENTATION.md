# OpenAI Settings & Function Calling Implementation

**Status**: ✅ Complete - Ready for Database Migration
**Date**: 2025-10-31

---

## Overview

This implementation adds a comprehensive OpenAI configuration system with function calling capabilities, allowing:
- Platform-wide AI configuration (admin-controlled)
- User-level personal API keys (optional)
- Intelligent data querying via OpenAI function calling
- Role-based access (users see their data, admins see all data)

---

## 🎯 Key Features

### For All Users
1. **Personal API Keys**: Users can optionally provide their own OpenAI API key
2. **AI Chat Functions**:
   - `getMyScenarios()` - View all their ROI scenarios
   - `getMyStats()` - Get personalized statistics
   - `compareScenarios()` - Compare two scenarios side-by-side
   - `getScenarioDetails()` - Get detailed scenario info with platform breakdown

### For Platform Admins
1. **Platform Configuration**:
   - Set platform-wide OpenAI API key
   - Configure model (GPT-4 Turbo, GPT-4, GPT-3.5)
   - Adjust temperature (0-2)
   - Set max tokens (100-4000)
   - Custom system instructions (editable prompt engineering)

2. **Admin AI Functions** (All user functions PLUS):
   - `searchUsersByEmail()` - Find users by email
   - `searchUsersByName()` - Find users by name
   - `searchUsersByCompany()` - Find users by company
   - `getUserScenarios()` - View any user's scenarios
   - `getCompanyStats()` - Aggregated company analytics
   - `getPlatformAnalytics()` - Platform-wide trends
   - `getTopPerformingUsers()` - Leaderboard of best ROI performers

---

## 📁 Files Created/Modified

### New Files (8 files)

1. **Database Migration**
   - `/supabase/migrations/20250103000000_openai_settings.sql`
   - Creates `user_openai_settings` table
   - Adds OpenAI admin settings
   - Sets up RLS policies

2. **AI Function Definitions**
   - `/lib/ai/function-definitions.ts`
   - Defines all OpenAI function schemas
   - Separate user and admin function sets

3. **AI Function Handlers**
   - `/lib/ai/function-handlers.ts`
   - Executes database queries based on function calls
   - 11 handler functions total
   - Role-based permission checks

4. **Admin API Endpoints**
   - `/app/api/admin/openai-settings/route.ts`
   - GET: Fetch platform OpenAI settings
   - PATCH: Update platform settings

5. **User API Endpoints**
   - `/app/api/user/openai-settings/route.ts`
   - GET: Fetch user's personal settings
   - PATCH: Update user's API key preference
   - DELETE: Remove user's API key

6. **Admin UI Component**
   - `/components/admin/OpenAISettings.tsx`
   - Beautiful admin interface
   - API key management with show/hide
   - Model configuration sliders
   - System instructions editor
   - Live capabilities display

### Modified Files (2 files)

7. **AI Chat Endpoint** (Updated)
   - `/app/api/ai/chat/route.ts`
   - Implements OpenAI function calling
   - Iterative function execution (up to 5 rounds)
   - Supports user and platform API keys
   - Uses admin settings for model/temperature

8. **Admin Content Component** (Updated)
   - `/components/admin/AdminContent.tsx`
   - Added "AI Settings" card to overview
   - Added OpenAI settings section
   - Integrated new component

---

## 🗄️ Database Schema

### New Table: `user_openai_settings`

```sql
CREATE TABLE user_openai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  api_key TEXT,
  use_platform_key BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies**: Users can only view/edit their own settings

### New Admin Settings

Added to `admin_settings` table:
- `openai_api_key` - Platform API key (encrypted)
- `openai_model` - Model selection (default: gpt-4-turbo-preview)
- `openai_temperature` - Temperature (default: 0.7)
- `openai_max_tokens` - Max tokens (default: 2000)
- `openai_system_instructions` - Custom AI instructions

---

## 🔧 Function Calling Architecture

### How It Works

1. **User asks a question** in AI chat
2. **AI evaluates available functions** based on user role
3. **AI calls relevant functions** (e.g., `getMyScenarios()`)
4. **Backend executes queries** against database
5. **Results returned to AI** as structured JSON
6. **AI formulates response** using the data
7. **User receives actionable insights**

### Example Flow

**User**: "How many scenarios have I created?"

1. AI calls `getMyStats()`
2. Handler queries database for user's scenarios
3. Returns: `{ totalScenarios: 5, avgRevenueIncrease: 150000, ... }`
4. AI responds: "You've created 5 scenarios with an average revenue increase of $150,000..."

**Admin**: "Who are the top 5 users by revenue increase?"

1. AI calls `getTopPerformingUsers({ limit: 5, sortBy: 'revenue_increase' })`
2. Handler queries all scenarios, groups by user, sorts
3. Returns list of top 5 users with stats
4. AI presents formatted leaderboard

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

Option A - Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project: `ohmioijbzvhoydyhdkdk`
3. Navigate to **SQL Editor**
4. Open `/supabase/migrations/20250103000000_openai_settings.sql`
5. Copy the entire SQL content
6. Paste into SQL Editor and run

Option B - Command Line (if psql installed):
```bash
psql -h db.ohmioijbzvhoydyhdkdk.supabase.co \
     -U postgres \
     -d postgres \
     -f supabase/migrations/20250103000000_openai_settings.sql
```

### Step 2: Build & Deploy

```bash
cd /mnt/c/development/marketing_ROI_Calculator

# Check for TypeScript errors (will pass after migration)
npm run build

# Deploy to Vercel
git add .
git commit -m "Add OpenAI settings and function calling"
git push origin main
```

### Step 3: Configure OpenAI API Key

1. Login as admin: `chad@askchad.net`
2. Go to **Admin Panel** → **AI Settings**
3. Enter your OpenAI API key
4. Optionally customize:
   - Model (GPT-4 Turbo recommended)
   - Temperature (0.7 for balanced)
   - Max tokens (2000 default)
   - System instructions
5. Click **Save Settings**

### Step 4: Test AI Chat

**Regular User Test:**
1. Login as a test user
2. Open dashboard
3. Click "Start AI Chat"
4. Ask: "Show me my scenarios"
5. Verify AI calls `getMyScenarios()` and returns data

**Admin Test:**
1. Login as admin
2. Open dashboard AI chat
3. Ask: "Who are the top performing users?"
4. Verify AI calls `getTopPerformingUsers()` and returns data
5. Ask: "Find users at company Acme Corp"
6. Verify AI calls `searchUsersByCompany()` and returns results

---

## 🎨 UI Screenshots

### Admin OpenAI Settings Page

The new admin settings page includes:

1. **API Key Section**
   - Masked current key display
   - Secure input with show/hide toggle
   - Link to OpenAI platform

2. **Model Configuration**
   - Dropdown: GPT-4 Turbo, GPT-4, GPT-3.5
   - Temperature slider (0-2)
   - Max tokens input (100-4000)

3. **System Instructions**
   - Large textarea for custom prompts
   - Example instructions provided
   - Real-time save

4. **AI Capabilities Panel**
   - Lists all available functions for users
   - Lists all available functions for admins
   - Educational reference

---

## 📊 Function Reference

### User Functions (4 functions)

| Function | Description | Parameters |
|----------|-------------|------------|
| `getMyScenarios` | Get all user's scenarios | `limit`, `sortBy`, `sortOrder` |
| `getMyStats` | Get user's aggregated stats | None |
| `compareScenarios` | Compare two scenarios | `scenarioId1`, `scenarioId2` |
| `getScenarioDetails` | Get scenario with platforms | `scenarioId` |

### Admin Functions (11 functions)

All user functions PLUS:

| Function | Description | Parameters |
|----------|-------------|------------|
| `searchUsersByEmail` | Find users by email | `email` |
| `searchUsersByName` | Find users by name | `firstName`, `lastName` |
| `searchUsersByCompany` | Find users by company | `companyName` |
| `getUserScenarios` | Get any user's scenarios | `userId`, `limit` |
| `getCompanyStats` | Company aggregated stats | `companyName` |
| `getPlatformAnalytics` | Platform-wide analytics | `timeRange` |
| `getTopPerformingUsers` | Leaderboard | `limit`, `sortBy` |

---

## 🔐 Security Features

1. **API Key Encryption**
   - Keys stored encrypted in database
   - Masked in UI (show only last 4 chars)
   - HTTPS only transmission

2. **Row Level Security**
   - Users can only access their own settings
   - Admins have elevated permissions
   - Database enforces policies

3. **Role-Based Function Access**
   - Function handlers check admin status
   - Non-admins blocked from admin functions
   - Error messages don't leak data

4. **Input Validation**
   - Zod schemas validate all inputs
   - SQL injection prevented (parameterized queries)
   - Rate limiting (Vercel edge functions)

---

## 💡 Usage Examples

### Example 1: User Analyzing Their Performance

**User**: "What's my best performing scenario?"

**AI Flow**:
1. Calls `getMyStats()`
2. Receives: `{ bestScenario: { name: "Q4 Campaign", revenueIncrease: 250000 } }`
3. Responds: "Your best performing scenario is 'Q4 Campaign' with a revenue increase of $250,000..."

### Example 2: Admin Finding a User

**Admin**: "Find the user at Acme Corporation with email john@acme.com"

**AI Flow**:
1. Calls `searchUsersByEmail({ email: 'john@acme.com' })`
2. Receives: `{ users: [{ email: 'john@acme.com', companyName: 'Acme Corporation' }] }`
3. Calls `getUserScenarios({ userId: '...' })`
4. Receives scenarios
5. Responds: "I found John at Acme Corporation. He has 3 scenarios with an average revenue increase of..."

### Example 3: Admin Platform Analytics

**Admin**: "Show me platform analytics for the last 30 days"

**AI Flow**:
1. Calls `getPlatformAnalytics({ timeRange: '30days' })`
2. Receives: `{ totalUsers: 45, totalScenarios: 230, avgRevenueIncrease: 125000 }`
3. Responds: "In the last 30 days, you have 45 active users who created 230 scenarios with an average revenue increase of $125,000..."

---

## 🛠️ Troubleshooting

### Issue: "AI features are not configured"

**Solution**: Admin needs to set OpenAI API key in Admin Panel → AI Settings

### Issue: User can't query admin data

**Expected behavior**: Users can only query their own data. Admin functions require admin role.

### Issue: Function not being called

**Check**:
1. Is function defined in `function-definitions.ts`?
2. Is handler implemented in `function-handlers.ts`?
3. Is permission check passing in handler?
4. Check AI chat endpoint logs for errors

### Issue: TypeScript errors

**Solution**: Run database migration first. TypeScript needs the new table schemas.

---

## 📈 Performance Considerations

1. **Function Call Iterations**: Max 5 to prevent infinite loops
2. **Query Limits**: Functions have default limits (e.g., 50 scenarios)
3. **Caching**: Consider Redis for frequently accessed data
4. **Token Usage**: Monitor OpenAI API costs, set reasonable max_tokens

---

## 🔮 Future Enhancements

1. **User-Level Instructions**: Allow users to set their own AI personality
2. **Conversation History**: Load previous conversations
3. **Streaming Responses**: Real-time AI responses
4. **More Functions**:
   - `createScenario()` - AI creates scenarios based on goals
   - `suggestOptimizations()` - AI recommends improvements
   - `exportData()` - Generate reports
5. **Analytics Dashboard**: Track AI usage, popular queries, token costs

---

## ✅ Implementation Checklist

- [x] Database migration created
- [x] Function definitions implemented
- [x] Function handlers implemented
- [x] Admin API endpoints created
- [x] User API endpoints created
- [x] AI chat endpoint updated with function calling
- [x] Admin UI component created
- [x] Admin content component updated
- [ ] Database migration run
- [ ] Build and deploy
- [ ] Configure OpenAI API key
- [ ] Test user AI chat
- [ ] Test admin AI chat
- [ ] Monitor API costs

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review function definitions in `/lib/ai/function-definitions.ts`
3. Check handler implementations in `/lib/ai/function-handlers.ts`
4. Review API endpoints in `/app/api/admin/openai-settings/` and `/app/api/user/openai-settings/`

---

**Implementation Complete** ✅
**Ready for Deployment** 🚀

---

## API Key Priority

The system checks for API keys in this order:
1. User's personal API key (if `use_platform_key` is false)
2. Platform admin API key (from `admin_settings`)
3. Environment variable `OPENAI_API_KEY`

This allows maximum flexibility: admins control the default, but users can opt to use their own keys.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Author**: Claude Code
