# Navigation Structure & User Flow

## Page Hierarchy

```
/ (Landing Page - DEFAULT/HOME)
├─ Header:
│  ├─ Logo
│  └─ [Login] button (top-right)
│
├─ Contact Form (lead capture)
└─ Benefits Section
   └─ [Create Free Account] button

/login
├─ Login form (email + password)
├─ "Don't have an account? [Create one]" link
└─ Forgot password link

/register
├─ Registration form (email, phone, password)
├─ "Already have an account? [Login]" link
└─ Submit → auto-login → redirect to /dashboard

/calculator (No login required)
├─ Header:
│  ├─ Logo
│  ├─ [Login] button (if not logged in)
│  └─ [Dashboard] + [Logout] (if logged in)
│
├─ Two-input calculator (Current + Prospective)
└─ Results display

/dashboard (Login required)
├─ My Scenarios
├─ Platform Performance
├─ [+ New Scenario] → /calculator
└─ AI Chat Widget (floating)

/admin/ghl-settings (Admin only)
├─ GHL Connection
├─ Field Mapping
└─ Sync History
```

---

## Landing Page (Default Home - `/`)

### Header
```html
<header className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <!-- Logo -->
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="Logo" className="h-8" />
      <span className="text-xl font-bold">ROI Calculator</span>
    </div>

    <!-- Login Button -->
    <div className="flex gap-4 items-center">
      <Link href="/login" className="text-blue-600 hover:text-blue-700">
        Login
      </Link>
      <Link href="/register" className="btn-primary">
        Sign Up Free
      </Link>
    </div>
  </div>
</header>
```

### Hero Section
```html
<section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
  <div className="max-w-4xl mx-auto text-center px-4">
    <h1 className="text-5xl font-bold mb-6">
      Discover Your Marketing ROI Potential
    </h1>
    <p className="text-xl text-gray-600 mb-8">
      See exactly how much revenue you're leaving on the table with our free ROI calculator
    </p>
    <div className="flex gap-4 justify-center">
      <a href="#contact-form" className="btn-primary btn-lg">
        Get Started Free
      </a>
      <Link href="/login" className="btn-secondary btn-lg">
        Already have an account? Login
      </Link>
    </div>
  </div>
</section>
```

### Contact Form Section
```html
<section id="contact-form" className="py-16">
  <div className="max-w-2xl mx-auto px-4">
    <div className="card">
      <h2 className="text-3xl font-bold mb-2">Start Your Free Analysis</h2>
      <p className="text-gray-600 mb-6">
        Enter your information to access the calculator
      </p>

      <form onSubmit={handleSubmit}>
        <!-- Contact form fields -->
        <button type="submit" className="btn-primary w-full">
          Calculate My ROI →
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Click here to login
        </Link>
      </div>
    </div>
  </div>
</section>
```

### Premium Features Section
```html
<section className="py-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      Unlock Premium Features with a Free Account
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Feature cards -->
    </div>

    <div className="text-center mt-12">
      <p className="text-gray-600 mb-4">
        All features are <strong>100% free</strong> forever
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/register" className="btn-primary btn-lg">
          Create Free Account
        </Link>
        <Link href="/login" className="btn-secondary btn-lg">
          Login
        </Link>
      </div>
    </div>
  </div>
</section>
```

---

## Calculator Page (`/calculator`)

### Header (Not Logged In)
```html
<header className="bg-white shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <!-- Logo (clickable - goes to home) -->
    <Link href="/" className="flex items-center gap-2">
      <img src="/logo.svg" alt="Logo" className="h-8" />
      <span className="text-xl font-bold">ROI Calculator</span>
    </Link>

    <!-- Login/Register -->
    <div className="flex gap-4 items-center">
      <div className="text-sm text-gray-600 hidden md:block">
        💡 <strong>Create an account</strong> to save scenarios, use AI chat, and track platforms
      </div>
      <Link href="/login" className="btn-secondary">
        Login
      </Link>
      <Link href="/register" className="btn-primary">
        Create Account
      </Link>
    </div>
  </div>
</header>
```

### Header (Logged In)
```html
<header className="bg-white shadow-sm sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <!-- Logo -->
    <Link href="/" className="flex items-center gap-2">
      <img src="/logo.svg" alt="Logo" className="h-8" />
      <span className="text-xl font-bold">ROI Calculator</span>
    </Link>

    <!-- User Menu -->
    <div className="flex gap-4 items-center">
      <span className="text-sm text-gray-600">
        Welcome back, <strong>{user.first_name}</strong>!
      </span>
      <Link href="/dashboard" className="btn-secondary">
        My Dashboard
      </Link>
      <button onClick={logout} className="btn-secondary">
        Logout
      </button>
    </div>
  </div>
</header>
```

### Calculator Page Body
```html
<main className="max-w-7xl mx-auto p-8">
  <!-- Page Title -->
  <div className="mb-8">
    <h1 className="text-3xl font-bold mb-2">ROI Calculator</h1>
    <p className="text-gray-600">
      Model your marketing scenarios and see potential improvements
    </p>
  </div>

  <!-- Not Logged In Banner -->
  {!user && (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🔓</div>
          <div>
            <p className="font-bold">You're using the calculator as a guest</p>
            <p className="text-sm text-gray-600">
              Create a free account to save scenarios, use AI chat, and track platforms
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="btn-secondary">
            Login
          </Link>
          <Link href="/register" className="btn-primary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )}

  <!-- Calculator Content -->
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Current ROI -->
    <div className="card">
      <!-- ... -->
    </div>

    <!-- Prospective Scenario -->
    <div className="card">
      <!-- ... -->
    </div>
  </div>

  <!-- Results -->
  {results && (
    <div className="mt-8">
      <!-- ... -->
    </div>
  )}
</main>
```

---

## Login Page (`/login`)

```typescript
// /src/app/login/page.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      const data = await response.json();
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.svg" alt="Logo" className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to access your ROI scenarios</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Create a free account
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Register Page (`/register`)

```typescript
// /src/app/register/page.tsx
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      // Auto-login and redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      const data = await response.json();
      setErrors({ general: data.error });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.svg" alt="Logo" className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Your Free Account</h1>
          <p className="text-gray-600">
            Unlock AI chat, platform tracking, and unlimited saved scenarios
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="w-full"
              />
            </div>
            <div>
              <label>Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full"
            />
          </div>

          {/* Phone (REQUIRED) */}
          <div>
            <label>Phone Number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 555-5555"
              required
              className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Required for account security
            </p>
          </div>

          {/* Company */}
          <div>
            <label>Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Optional"
              className="w-full"
            />
          </div>

          {/* Password */}
          <div>
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 8 characters"
              required
              className={`w-full ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label>Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              required
              className={`w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Click here to login
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        {/* Terms */}
        <div className="mt-6 text-xs text-center text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Navigation Component (Reusable)

```typescript
// /src/components/Header.tsx
import { useUser } from '@/hooks/useUser';

export function Header() {
  const { user, logout } = useUser();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="h-8" />
          <span className="text-xl font-bold">ROI Calculator</span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden md:block">
                Welcome, <strong>{user.first_name}</strong>
              </span>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600">
                Calculator
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600">
                Calculator
              </Link>
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Sign Up Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
```

---

## Routes Summary

```typescript
// next.config.js or routing structure

const routes = {
  // Public routes (no auth required)
  '/': 'Landing Page (home/default)',
  '/login': 'Login Page',
  '/register': 'Register Page',
  '/calculator': 'ROI Calculator (works without login)',
  '/forgot-password': 'Password Reset',
  '/terms': 'Terms of Service',
  '/privacy': 'Privacy Policy',

  // Protected routes (login required)
  '/dashboard': 'User Dashboard',
  '/dashboard/scenarios': 'Saved Scenarios',
  '/dashboard/platforms': 'Platform Comparison',
  '/dashboard/settings': 'Account Settings',

  // Admin routes (admin only)
  '/admin/ghl-settings': 'GHL Settings',
  '/admin/users': 'User Management',
  '/admin/sync-logs': 'Sync Logs',

  // API routes
  '/api/auth/login': 'Login API',
  '/api/auth/register': 'Register API',
  '/api/auth/logout': 'Logout API',
  '/api/leads': 'Lead Capture API',
  '/api/calculator': 'Calculator API',
  '/api/ai/chat': 'AI Chat API',
  '/api/ghl/sync': 'GHL Sync API'
};
```

---

## User Journey Flows

### Flow 1: First-Time Visitor
```
1. Lands on / (landing page) - DEFAULT
2. Sees "Login" button in header
3. Fills contact form
4. Redirected to /calculator
5. Sees login prompts:
   - Header: [Login] button
   - Banner: "Create account for premium features"
6. Uses calculator as guest
7. Clicks "Create Account" → /register
```

### Flow 2: Returning User (Has Account)
```
1. Lands on / (landing page) - DEFAULT
2. Clicks "Login" in header → /login
3. Enters credentials
4. Redirected to /dashboard
5. Can navigate:
   - /calculator (with full features)
   - /dashboard (scenarios, platforms)
   - AI chat widget (everywhere)
```

### Flow 3: Guest Using Calculator
```
1. Direct visit to /calculator
2. Sees login prompts throughout
3. Uses calculator (limited features)
4. Clicks "Login" → /login
   OR "Create Account" → /register
```

---

## Summary of Changes

### ✅ Landing Page (`/`)
- **Is the default/home page**
- Header has "Login" button (top-right)
- Contact form has "Click here to login" link below submit
- Benefits section has "Login" and "Create Account" buttons

### ✅ Calculator Page (`/calculator`)
- Header has "Login" button (if not logged in)
- Blue banner prompts to create account
- Multiple login entry points throughout

### ✅ Login Page (`/login`)
- Dedicated login page
- Links back to home
- Link to register page

### ✅ Register Page (`/register`)
- Dedicated registration page
- Links back to home
- Link to login page

### ✅ Navigation
- Consistent header across all pages
- Logo always links to `/` (home)
- Login prompts strategically placed

**This navigation structure is now complete!** ✅