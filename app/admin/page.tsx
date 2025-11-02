import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import AdminContent from '@/components/admin/AdminContent'

// Force dynamic rendering for admin content
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CalculatorVisit {
  id: string
  tracking_id: string | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  country: string | null
  region: string | null
  city: string | null
  zipcode: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  visited_at: string
}

interface LeadCapture {
  tracking_id: string | null
  email: string
  first_name: string
  last_name: string
  company_name: string | null
  phone: string | null
}

interface UserData {
  id: string
  email: string
  phone: string | null
}

interface VisitWithLead extends CalculatorVisit {
  lead_captures: LeadCapture | null
  user_data: UserData | null
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!(userData as any)?.is_admin) {
    redirect('/dashboard')
  }

  // Fetch admin data
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: allScenarios } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      users(email),
      calculator_sessions(
        current_leads,
        current_sales,
        current_ad_spend,
        current_revenue,
        current_conversion_rate,
        current_cpl,
        current_cpa,
        avg_revenue_per_sale,
        time_period
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1000)

  const { data: ghlSettings } = await supabase
    .from('admin_settings')
    .select('*')
    .in('setting_key', ['ghl_connected', 'ghl_location_id'])

  // Fetch all brands
  const { data: allBrands } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch calculator visits (up to 1000 most recent)
  const { data: visitsData } = await supabase
    .from('calculator_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(1000)

  // Fetch all leads to match with visits
  const { data: leadsData } = await supabase
    .from('lead_captures')
    .select('tracking_id, email, first_name, last_name, company_name, phone')

  // Fetch all users to match with visits (for logged-in users)
  const { data: usersData } = await supabase
    .from('users')
    .select('id, email, phone')

  // Manually join visits with leads and users
  const calculatorVisits: VisitWithLead[] = (visitsData as CalculatorVisit[] || []).map(visit => {
    const lead = (leadsData as LeadCapture[] || []).find(l => l.tracking_id === visit.tracking_id)
    const user = (usersData as UserData[] || []).find(u => u.id === visit.user_id)
    return {
      ...visit,
      lead_captures: lead || null,
      user_data: user || null
    }
  })

  return (
    <>
      <Header
        showLogin={false}
        showDashboard={true}
        userName={(userData as any)?.first_name || user.email?.split('@')[0] || 'Admin'}
        isAdmin={true}
      />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-neutral-600">
              Manage platform settings, view all user data, and configure GHL integration
            </p>
          </div>

          <AdminContent
            users={allUsers || []}
            scenarios={allScenarios || []}
            ghlSettings={ghlSettings || []}
            calculatorVisits={calculatorVisits || []}
            brands={allBrands || []}
          />
        </div>
      </main>
    </>
  )
}
