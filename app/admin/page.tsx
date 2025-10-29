import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import AdminContent from '@/components/admin/AdminContent'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
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
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: ghlSettings } = await supabase
    .from('admin_settings')
    .select('*')
    .in('setting_key', ['ghl_connected', 'ghl_location_id'])

  return (
    <>
      <Header
        showLogin={false}
        showDashboard={true}
        userName="Admin"
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
          />
        </div>
      </main>
    </>
  )
}
