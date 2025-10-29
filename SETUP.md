# Local Development Setup

This guide will help you set up the Marketing ROI Calculator on your local machine.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Git**
- **Supabase account** (free tier works)
- **OpenAI API key** (optional, for AI features)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/marketing-roi-calculator.git
cd marketing-roi-calculator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Optional - for AI chat)
OPENAI_API_KEY=sk-your_openai_api_key

# GoHighLevel (Optional - for CRM integration)
GHL_CLIENT_ID=your_ghl_client_id
GHL_CLIENT_SECRET=your_ghl_client_secret
GHL_REDIRECT_URI=http://localhost:3000/api/ghl/callback

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/20250101000000_initial_schema.sql`
   - `supabase/migrations/20250101000001_add_admin_user.sql`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
marketing-roi-calculator/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── calculator/               # Calculator page
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # User dashboard
│   ├── admin/                    # Admin panel
│   └── api/                      # API routes
│       ├── auth/                 # Authentication endpoints
│       ├── ai/                   # AI chat endpoint
│       ├── admin/                # Admin endpoints
│       └── lead-capture/         # Lead capture endpoint
├── components/                   # React components
│   ├── calculator/               # Calculator-specific components
│   ├── dashboard/                # Dashboard components
│   ├── admin/                    # Admin panel components
│   ├── ai/                       # AI chat component
│   ├── Header.tsx                # Navigation header
│   ├── ContactForm.tsx           # Lead capture form
│   └── BenefitsSection.tsx       # Account benefits display
├── lib/                          # Utility libraries
│   ├── calculations.ts           # ROI calculation functions
│   └── supabase/                 # Supabase clients
│       ├── client.ts             # Browser client
│       └── server.ts             # Server client
├── types/                        # TypeScript types
│   └── database.ts               # Database schema types
├── supabase/migrations/          # Database migrations
├── public/                       # Static assets
└── Documentation/                # Project documentation
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Core Features

### 1. Landing Page (`/`)
- Contact form with lead capture
- Benefits showcase
- Login/Register CTAs

### 2. Calculator (`/calculator`)
- **Two-Input Design:**
  - Current ROI metrics
  - Prospective scenario modeling
- Dual timeframe results (weekly + monthly)
- Real-time calculations
- Login prompts for saving

### 3. Authentication
- **Login** (`/login`): Email + password
- **Register** (`/register`): Email + phone (required) + password
- Supabase Auth integration

### 4. User Dashboard (`/dashboard`)
- Saved scenarios history
- Quick statistics
- AI chat launcher
- Platform comparison link

### 5. AI Chat
- OpenAI GPT-4 integration
- Context-aware responses
- User data analysis
- Admin mode (access all data)

### 6. Admin Panel (`/admin`)
- User management
- Platform statistics
- GHL integration settings
- Scenario overview

---

## Database Schema

12 tables total:

1. **lead_captures** - Contact form submissions
2. **users** - Registered accounts
3. **calculator_sessions** - Current ROI data
4. **roi_scenarios** - Prospective scenarios
5. **platforms** - Ad platform master list
6. **session_platforms** - Platform breakdown (current)
7. **scenario_platforms** - Platform breakdown (scenarios)
8. **ai_chat_conversations** - Chat sessions
9. **ai_chat_messages** - Individual messages
10. **admin_settings** - Platform configuration
11. **ghl_field_mappings** - GHL field mapping
12. **ghl_sync_log** - Sync operation history

---

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Lead Capture
- `POST /api/lead-capture` - Save contact form

### AI Chat
- `POST /api/ai/chat` - Chat with AI assistant

### Admin
- `POST /api/admin/ghl/connect` - Connect GHL
- `POST /api/admin/ghl/disconnect` - Disconnect GHL

---

## Testing

### Test Anonymous User Flow

1. Visit `http://localhost:3000`
2. Fill out contact form
3. Use calculator without logging in
4. See results
5. Prompted to create account

### Test Registered User Flow

1. Click "Create Account"
2. Register with email + phone + password
3. Login to dashboard
4. Create scenarios
5. Use AI chat
6. View history

### Test Admin Flow

1. Register with `chad@askchad.net`
2. Manually set `is_admin = true` in Supabase
3. Access `/admin`
4. View all users
5. Configure GHL
6. Use admin AI chat (accesses all data)

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Supabase Connection Error

- Verify `.env.local` has correct URL and keys
- Check Supabase project is active
- Ensure migrations ran successfully

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### AI Chat Not Responding

- Check `OPENAI_API_KEY` is set
- Verify API key is valid
- Check OpenAI account has credits

---

## Development Tips

### Hot Reload

- Next.js automatically reloads on file changes
- API routes require server restart

### Database Changes

1. Make changes in Supabase SQL Editor
2. Export as migration file
3. Add to `supabase/migrations/`
4. Update `types/database.ts`

### Styling

- Uses Tailwind CSS v3
- Custom color palette in `tailwind.config.js`
- Global styles in `app/globals.css`

---

## Security Notes

- Never commit `.env.local` to Git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Rotate API keys regularly
- Review Supabase RLS policies

---

## Next Steps

1. ✅ Local development setup
2. ✅ Test core features
3. ✅ Configure AI chat
4. ✅ Set up admin account
5. → Deploy to Vercel (see `DEPLOYMENT_GUIDE.md`)

---

## Need Help?

- Review documentation in project root
- Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- OpenAI API docs: [https://platform.openai.com/docs](https://platform.openai.com/docs)

---

**Happy Coding!** 🚀
