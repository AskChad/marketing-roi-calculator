import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DemoCalculatorPageClient from '@/components/calculator/DemoCalculatorPageClient'

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
    .order('created_at', { ascending: false})

  return (
    <DemoCalculatorPageClient
      userId={user.id}
      userName={(userData as any)?.first_name || user.email?.split('@')[0] || 'Admin'}
      isAdmin={isAdmin || false}
      existingDemos={demoScenarios || []}
    />
  )
}
