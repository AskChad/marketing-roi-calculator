import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import DashboardContent from '@/components/dashboard/DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Parallelize user data and scenarios queries for better performance
  const [scenariosResult, userDataResult] = await Promise.all([
    supabase
      .from('roi_scenarios')
      .select('*, calculator_sessions(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('id, email, first_name, last_name, is_admin')
      .eq('id', user.id)
      .single()
  ])

  const scenarios = scenariosResult.data
  const userData = userDataResult.data

  return (
    <>
      <Header
        showLogin={false}
        showDashboard={false}
        userName={(userData as any)?.first_name || user.email?.split('@')[0] || 'User'}
        isAdmin={(userData as any)?.is_admin || false}
      />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Dashboard
            </h1>
            <p className="text-neutral-600">
              View your saved scenarios, compare performance, and access AI insights
            </p>
          </div>

          <DashboardContent
            scenarios={scenarios || []}
            userId={user.id}
            userName={(userData as any)?.first_name || user.email?.split('@')[0] || 'User'}
            isAdmin={(userData as any)?.is_admin || false}
          />
        </div>
      </main>
    </>
  )
}
