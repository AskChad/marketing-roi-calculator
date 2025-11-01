import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
    <DemoCalculatorContent
      userId={user.id}
      existingDemos={demoScenarios || []}
    />
  )
}
