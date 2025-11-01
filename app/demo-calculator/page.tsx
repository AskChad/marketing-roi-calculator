import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import DemoCalculatorContent from '@/components/calculator/DemoCalculatorContent'

export default async function DemoCalculatorPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = (userData as any)?.is_admin

  if (!isAdmin) {
    redirect('/dashboard')
  }

  // Fetch all demo scenarios
  const { data: demoScenarios } = await supabase
    .from('demo_scenarios')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        showLogin={false}
        showDashboard={false}
        userName={(userData as any)?.first_name || user.email?.split('@')[0] || 'Admin'}
        isAdmin={isAdmin || false}
      />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">
              Demo Calculator
            </h1>
            <p className="text-neutral-600">
              Create demo scenarios for prospective clients with company name tracking
            </p>
          </div>

          <DemoCalculatorContent
            userId={user.id}
            existingDemos={demoScenarios || []}
          />
        </div>
      </main>
    </>
  )
}
