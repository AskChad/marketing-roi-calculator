'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import CurrentROIForm from '@/components/calculator/CurrentROIForm'
import ProspectiveScenarioForm from '@/components/calculator/ProspectiveScenarioForm'
import ResultsDisplay from '@/components/calculator/ResultsDisplay'
import SavedScenarios from '@/components/calculator/SavedScenarios'
import { BaselineMetrics, TargetScenario, DualTimeframeResult } from '@/lib/calculations'
import { ArrowRight } from 'lucide-react'

export default function CalculatorPage() {
  const router = useRouter()
  const [currentMetrics, setCurrentMetrics] = useState<BaselineMetrics | null>(null)
  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [results, setResults] = useState<DualTimeframeResult | null>(null)
  const [scenarioName, setScenarioName] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<any[]>([])
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true)
  const [hasTrackingCookie, setHasTrackingCookie] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  // Check for tracking cookie (client-side only)
  useEffect(() => {
    const checkTrackingCookie = () => {
      // Check if visitor_tracking_id cookie exists
      const cookies = document.cookie.split(';')
      const hasTracking = cookies.some(cookie => cookie.trim().startsWith('visitor_tracking_id='))
      setHasTrackingCookie(hasTracking)
    }

    checkTrackingCookie()
  }, [])

  // Check authentication and fetch scenarios on mount
  useEffect(() => {
    const checkAuthAndFetchScenarios = async () => {
      try {
        const response = await fetch('/api/scenarios')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setIsAdmin(data.isAdmin || false)
          setSavedScenarios(data.scenarios || [])
          setIsCheckingAccess(false)
        } else {
          setIsLoggedIn(false)
          setIsAdmin(false)
          setSavedScenarios([])
          setIsCheckingAccess(false)
        }
      } catch (error) {
        console.error('Error fetching scenarios:', error)
        setIsLoggedIn(false)
        setIsAdmin(false)
        setSavedScenarios([])
        setIsCheckingAccess(false)
      } finally {
        setIsLoadingScenarios(false)
      }
    }

    checkAuthAndFetchScenarios()
  }, [])

  // Redirect to landing page if not logged in and no tracking cookie
  useEffect(() => {
    if (!isCheckingAccess && !isLoggedIn && !hasTrackingCookie) {
      router.push('/')
    }
  }, [isCheckingAccess, isLoggedIn, hasTrackingCookie, router])

  // Track calculator page visit
  useEffect(() => {
    // Only track if access is granted (either logged in or has tracking cookie)
    if (!isCheckingAccess && (isLoggedIn || hasTrackingCookie)) {
      const trackVisit = async () => {
        try {
          await fetch('/api/track-calculator-visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          // Silent fail - don't disrupt user experience if tracking fails
          console.error('Error tracking visit:', error)
        }
      }

      trackVisit()
    }
  }, [isCheckingAccess, isLoggedIn, hasTrackingCookie])

  const handleCurrentMetricsSubmit = (metrics: BaselineMetrics) => {
    setCurrentMetrics(metrics)
    setShowScenarioForm(true)
  }

  const handleScenarioSubmit = async (scenario: TargetScenario) => {
    if (!currentMetrics) return

    // Generate automatic scenario name if not provided
    const autoScenarioName = scenario.scenarioName || `Scenario ${new Date().toLocaleString()}`
    setScenarioName(autoScenarioName)

    // Import calculation function dynamically to avoid client-side issues
    const { calculateDualTimeframeROI } = await import('@/lib/calculations')
    const calculatedResults = calculateDualTimeframeROI(currentMetrics, scenario)
    setResults(calculatedResults)

    // Auto-save for logged-in users
    if (isLoggedIn) {
      try {
        const primary = currentMetrics.timePeriod === 'weekly' ? calculatedResults.weekly : calculatedResults.monthly

        const response = await fetch('/api/scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenarioName: autoScenarioName,
            baselineMetrics: currentMetrics,
            targetConversionRate: primary.prospective.targetConversionRate,
            adjustedLeads: primary.prospective.leads !== currentMetrics.leads ? primary.prospective.leads : null,
            adjustedAdSpend: primary.prospective.adSpend !== currentMetrics.adSpend ? primary.prospective.adSpend : null,
            newSales: primary.prospective.newSales,
            newCPL: primary.prospective.newCPL,
            newCPA: primary.prospective.newCPA,
            newRevenue: primary.prospective.newRevenue,
            salesIncrease: primary.prospective.salesIncrease,
            revenueIncrease: primary.prospective.revenueIncrease,
            cpaImprovementPercent: primary.prospective.cpaImprovementPercent,
          }),
        })

        if (response.ok) {
          // Refresh scenarios list
          const scenariosResponse = await fetch('/api/scenarios')
          if (scenariosResponse.ok) {
            const data = await scenariosResponse.json()
            setSavedScenarios(data.scenarios || [])
          }
        }
      } catch (error) {
        console.error('Auto-save error (non-fatal):', error)
      }
    }
  }

  const handleReset = () => {
    setCurrentMetrics(null)
    setShowScenarioForm(false)
    setResults(null)
    setScenarioName('')
  }

  const handleLoadScenario = (scenario: any) => {
    console.log('Loading scenario:', scenario)

    // Reconstruct baseline metrics from session data
    // Handle both array and object responses from Supabase
    const sessionData = Array.isArray(scenario.calculator_sessions)
      ? scenario.calculator_sessions[0]
      : scenario.calculator_sessions

    if (!sessionData) {
      console.error('No session data found for scenario:', scenario)
      alert('Unable to load scenario: Missing session data')
      return
    }

    console.log('Session data:', sessionData)

    const baselineMetrics: BaselineMetrics = {
      leads: sessionData.current_leads,
      sales: sessionData.current_sales,
      adSpend: sessionData.current_ad_spend,
      revenue: sessionData.current_revenue,
      timePeriod: sessionData.time_period as 'weekly' | 'monthly',
    }

    // Reconstruct target scenario
    const targetScenario: TargetScenario = {
      scenarioName: scenario.scenario_name,
      targetType: 'conversionRate', // Default to conversion rate for now
      targetConversionRate: scenario.target_conversion_rate,
      adjustedLeads: scenario.adjusted_leads || undefined,
      adjustedAdSpend: scenario.adjusted_ad_spend || undefined,
    }

    console.log('Loaded baseline metrics:', baselineMetrics)
    console.log('Loaded target scenario:', targetScenario)

    // Set the metrics and calculate results
    setCurrentMetrics(baselineMetrics)
    setShowScenarioForm(true)
    setScenarioName(scenario.scenario_name)

    // Calculate and show results
    import('@/lib/calculations').then(({ calculateDualTimeframeROI }) => {
      const calculatedResults = calculateDualTimeframeROI(baselineMetrics, targetScenario)
      setResults(calculatedResults)

      // Scroll to top to see the "Your ROI Analysis" results after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    })
  }

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <>
        <Header showLogin={true} isAdmin={isAdmin} />
        <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading calculator...</p>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header showLogin={true} isAdmin={isAdmin} />

      <main className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              ROI Calculator
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Calculate your current marketing performance and model prospective scenarios
            </p>
          </div>

          {!results ? (
            <div className="max-w-6xl mx-auto">
              {/* Two-Input Design */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT: Current ROI Input */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-neutral-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Current Marketing ROI
                    </h2>
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-full">
                      Step 1
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-6">
                    Enter your current marketing metrics to establish a baseline
                  </p>
                  <CurrentROIForm
                    onSubmit={handleCurrentMetricsSubmit}
                    initialData={currentMetrics}
                  />
                </div>

                {/* RIGHT: Prospective Scenario */}
                <div className={`bg-white rounded-2xl shadow-lg p-8 border border-neutral-200 transition-opacity ${
                  showScenarioForm ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900">
                      Prospective Scenario
                    </h2>
                    <span className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-sm font-medium rounded-full">
                      Step 2
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-6">
                    {showScenarioForm
                      ? 'Model a "what-if" scenario to see potential improvements'
                      : 'Complete Step 1 to unlock scenario modeling'}
                  </p>
                  {showScenarioForm && currentMetrics ? (
                    <ProspectiveScenarioForm
                      currentMetrics={currentMetrics}
                      onSubmit={handleScenarioSubmit}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-neutral-400">
                      <ArrowRight className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>

              {/* Login Prompt for Anonymous Users */}
              {!isLoggedIn && (
                <div className="mt-8 p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-center">
                  <p className="text-neutral-700">
                    <strong className="text-brand-primary">Want to save your scenarios?</strong>{' '}
                    Create a free account to save unlimited scenarios, view history, and access AI insights.
                    {' '}
                    <a href="/login" className="text-brand-primary hover:underline font-medium">
                      Login here
                    </a>
                  </p>
                </div>
              )}

              {/* Saved Scenarios for Logged-in Users */}
              {isLoggedIn && !isLoadingScenarios && (
                <SavedScenarios
                  scenarios={savedScenarios}
                  onLoadScenario={handleLoadScenario}
                />
              )}
            </div>
          ) : (
            <ResultsDisplay
              results={results}
              currentMetrics={currentMetrics!}
              onReset={handleReset}
              initialScenarioName={scenarioName}
            />
          )}
        </div>
      </main>
    </>
  )
}
