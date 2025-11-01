import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScenarioAnalysis from '@/components/scenario/ScenarioAnalysis'

export default async function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch scenario with session data
  const { data: scenario, error: scenarioError } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      calculator_sessions (
        *,
        session_platforms (
          *,
          platforms (
            name,
            slug
          )
        ),
        scenario_platforms (
          *,
          platforms (
            name,
            slug
          )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (scenarioError || !scenario) {
    redirect('/dashboard')
  }

  // Check if user owns this scenario or is admin
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = (userData as any)?.is_admin

  // Type assertion for scenario to access user_id
  const scenarioData = scenario as any
  if (scenarioData.user_id !== user.id && !isAdmin) {
    redirect('/dashboard')
  }

  return (
    <ScenarioAnalysis
      scenario={scenario}
      userId={user.id}
      isAdmin={isAdmin || false}
    />
  )
}
