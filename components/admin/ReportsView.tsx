'use client'

import { useState, useEffect } from 'react'
import { Users, TrendingUp, MapPin, Calendar, Mail, Building, Phone, Globe, Search, X } from 'lucide-react'

interface Journey {
  tracking_id: string
  scenarios: any[]
  lead_capture: any
  visits: any[]
  first_seen: string
  last_seen: string
}

interface ReportsData {
  journeys: Journey[]
  stats: {
    total_journeys: number
    with_lead_capture: number
    total_scenarios: number
    total_visits: number
  }
}

interface NumericFilters {
  minCPL?: number
  maxCPL?: number
  minCPA?: number
  maxCPA?: number
  minRevenue?: number
  maxRevenue?: number
  minSales?: number
  maxSales?: number
}

export default function ReportsView() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedJourneys, setExpandedJourneys] = useState<Set<string>>(new Set())

  // Filter states
  const [textSearch, setTextSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [numericFilters, setNumericFilters] = useState<NumericFilters>({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reports')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        console.error('Failed to fetch reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleJourney = (trackingId: string) => {
    setExpandedJourneys(prev => {
      const next = new Set(prev)
      if (next.has(trackingId)) {
        next.delete(trackingId)
      } else {
        next.add(trackingId)
      }
      return next
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const updateNumericFilter = (key: keyof NumericFilters, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    setNumericFilters(prev => ({
      ...prev,
      [key]: numValue
    }))
  }

  const clearAllFilters = () => {
    setTextSearch('')
    setStartDate('')
    setEndDate('')
    setNumericFilters({})
  }

  const filterJourneys = (journeys: Journey[]): Journey[] => {
    return journeys.filter(journey => {
      // Date range filter
      if (startDate) {
        const journeyDate = new Date(journey.first_seen)
        const filterStart = new Date(startDate)
        if (journeyDate < filterStart) return false
      }
      if (endDate) {
        const journeyDate = new Date(journey.last_seen)
        const filterEnd = new Date(endDate)
        filterEnd.setHours(23, 59, 59, 999) // Include entire end date
        if (journeyDate > filterEnd) return false
      }

      // Text search filter (name, email, company, city, state, zip, country)
      if (textSearch) {
        const searchLower = textSearch.toLowerCase()
        const lead = journey.lead_capture

        const textMatches = (
          (lead?.first_name?.toLowerCase().includes(searchLower)) ||
          (lead?.last_name?.toLowerCase().includes(searchLower)) ||
          (lead?.email?.toLowerCase().includes(searchLower)) ||
          (lead?.company_name?.toLowerCase().includes(searchLower)) ||
          (lead?.city?.toLowerCase().includes(searchLower)) ||
          (lead?.region?.toLowerCase().includes(searchLower)) ||
          (lead?.zipcode?.toLowerCase().includes(searchLower)) ||
          (lead?.country?.toLowerCase().includes(searchLower))
        )

        if (!textMatches) return false
      }

      // Numeric filters (check scenarios within journey)
      if (Object.keys(numericFilters).length > 0 && journey.scenarios.length > 0) {
        const hasMatchingScenario = journey.scenarios.some(scenario => {
          const session = scenario.calculator_sessions?.[0]

          if (!session) return false

          // CPL filter
          if (numericFilters.minCPL !== undefined && session.current_cpl < numericFilters.minCPL) return false
          if (numericFilters.maxCPL !== undefined && session.current_cpl > numericFilters.maxCPL) return false

          // CPA filter
          if (numericFilters.minCPA !== undefined && session.current_cpa < numericFilters.minCPA) return false
          if (numericFilters.maxCPA !== undefined && session.current_cpa > numericFilters.maxCPA) return false

          // Revenue filter
          if (numericFilters.minRevenue !== undefined && scenario.revenue_increase < numericFilters.minRevenue) return false
          if (numericFilters.maxRevenue !== undefined && scenario.revenue_increase > numericFilters.maxRevenue) return false

          // Sales filter
          if (numericFilters.minSales !== undefined && scenario.sales_increase < numericFilters.minSales) return false
          if (numericFilters.maxSales !== undefined && scenario.sales_increase > numericFilters.maxSales) return false

          return true
        })

        if (!hasMatchingScenario) return false
      }

      return true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-12">
        <p className="text-neutral-600">Failed to load reports data</p>
      </div>
    )
  }

  // Apply filters
  const filteredJourneys = data ? filterJourneys(data.journeys) : []
  const hasActiveFilters = textSearch || startDate || endDate || Object.keys(numericFilters).length > 0

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center text-sm text-brand-primary hover:text-brand-secondary transition"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Text Search */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Search (Name, Email, Company, City, State, Zip, Country)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={textSearch}
                onChange={(e) => setTextSearch(e.target.value)}
                placeholder="Search text fields..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Numeric Filters */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Numeric Filters (Scenarios)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPL Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min CPL ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={numericFilters.minCPL ?? ''}
                  onChange={(e) => updateNumericFilter('minCPL', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max CPL ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={numericFilters.maxCPL ?? ''}
                  onChange={(e) => updateNumericFilter('maxCPL', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>

              {/* CPA Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min CPA ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={numericFilters.minCPA ?? ''}
                  onChange={(e) => updateNumericFilter('minCPA', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max CPA ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={numericFilters.maxCPA ?? ''}
                  onChange={(e) => updateNumericFilter('maxCPA', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>

              {/* Revenue Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min Revenue Increase ($)</label>
                <input
                  type="number"
                  step="1"
                  value={numericFilters.minRevenue ?? ''}
                  onChange={(e) => updateNumericFilter('minRevenue', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max Revenue Increase ($)</label>
                <input
                  type="number"
                  step="1"
                  value={numericFilters.maxRevenue ?? ''}
                  onChange={(e) => updateNumericFilter('maxRevenue', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>

              {/* Sales Filters */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Min Sales Increase</label>
                <input
                  type="number"
                  step="1"
                  value={numericFilters.minSales ?? ''}
                  onChange={(e) => updateNumericFilter('minSales', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Max Sales Increase</label>
                <input
                  type="number"
                  step="1"
                  value={numericFilters.maxSales ?? ''}
                  onChange={(e) => updateNumericFilter('maxSales', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Results Count */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-semibold text-brand-primary">{filteredJourneys.length}</span> of{' '}
              <span className="font-semibold">{data?.journeys.length || 0}</span> journeys
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Visitors</p>
              <p className="text-3xl font-bold text-neutral-900">{data.stats.total_journeys}</p>
            </div>
            <Users className="h-8 w-8 text-brand-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Lead Conversions</p>
              <p className="text-3xl font-bold text-success-dark">{data.stats.with_lead_capture}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {data.stats.total_journeys > 0
                  ? `${((data.stats.with_lead_capture / data.stats.total_journeys) * 100).toFixed(1)}% conversion`
                  : '0% conversion'}
              </p>
            </div>
            <Mail className="h-8 w-8 text-success-dark" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Scenarios</p>
              <p className="text-3xl font-bold text-brand-secondary">{data.stats.total_scenarios}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-brand-secondary" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Visits</p>
              <p className="text-3xl font-bold text-accent">{data.stats.total_visits}</p>
            </div>
            <Globe className="h-8 w-8 text-accent" />
          </div>
        </div>
      </div>

      {/* User Journeys */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-xl font-bold text-neutral-900">Anonymous User Journeys</h3>
          <p className="text-sm text-neutral-600 mt-1">
            Track visitor behavior from first visit to lead conversion
          </p>
        </div>

        <div className="divide-y divide-neutral-200">
          {filteredJourneys.length === 0 ? (
            <div className="p-12 text-center text-neutral-600">
              {hasActiveFilters ? 'No journeys match your filters' : 'No anonymous user journeys yet'}
            </div>
          ) : (
            filteredJourneys.map((journey) => (
              <div key={journey.tracking_id} className="p-6">
                <div
                  className="flex items-start justify-between cursor-pointer hover:bg-neutral-50 p-4 rounded-lg transition"
                  onClick={() => toggleJourney(journey.tracking_id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {journey.lead_capture ? (
                        <>
                          <Mail className="h-5 w-5 text-success-dark" />
                          <span className="font-semibold text-neutral-900">
                            {journey.lead_capture.first_name} {journey.lead_capture.last_name}
                          </span>
                          <span className="text-sm text-neutral-600">({journey.lead_capture.email})</span>
                        </>
                      ) : (
                        <>
                          <Users className="h-5 w-5 text-neutral-400" />
                          <span className="font-semibold text-neutral-600">Anonymous Visitor</span>
                          <span className="text-xs text-neutral-400">{journey.tracking_id.substring(0, 12)}...</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {journey.scenarios.length} scenario{journey.scenarios.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {journey.visits.length} visit{journey.visits.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(journey.first_seen)}
                      </div>
                      {journey.lead_capture && journey.lead_capture.country && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {journey.lead_capture.city}, {journey.lead_capture.country}
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="text-brand-primary hover:text-brand-secondary transition">
                    {expandedJourneys.has(journey.tracking_id) ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {expandedJourneys.has(journey.tracking_id) && (
                  <div className="mt-4 pl-4 space-y-4">
                    {/* Lead Information */}
                    {journey.lead_capture && (
                      <div className="bg-success-light/10 border border-success rounded-lg p-4">
                        <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-success-dark" />
                          Lead Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Company:</span>
                            <span className="ml-2 font-medium">{journey.lead_capture.company_name || 'N/A'}</span>
                          </div>
                          {journey.lead_capture.phone && (
                            <div>
                              <span className="text-neutral-600">Phone:</span>
                              <span className="ml-2 font-medium">{journey.lead_capture.phone}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-neutral-600">Location:</span>
                            <span className="ml-2 font-medium">
                              {journey.lead_capture.city}, {journey.lead_capture.region} {journey.lead_capture.zipcode}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600">IP Address:</span>
                            <span className="ml-2 font-mono text-xs">{journey.lead_capture.ip_address}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scenarios */}
                    {journey.scenarios.length > 0 && (
                      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
                        <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-brand-primary" />
                          ROI Scenarios ({journey.scenarios.length})
                        </h4>
                        <div className="space-y-3">
                          {journey.scenarios.map((scenario, idx) => (
                            <div key={scenario.id} className="bg-white rounded p-3 text-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-neutral-900">{scenario.scenario_name}</span>
                                <span className="text-xs text-neutral-500">{formatDate(scenario.created_at)}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-neutral-600">Sales Increase:</span>
                                  <span className="ml-1 font-semibold text-success-dark">
                                    +{scenario.sales_increase}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-neutral-600">Revenue Increase:</span>
                                  <span className="ml-1 font-semibold text-success-dark">
                                    {formatCurrency(scenario.revenue_increase)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-neutral-600">CPA Improvement:</span>
                                  <span className="ml-1 font-semibold text-success-dark">
                                    {scenario.cpa_improvement_percent.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visits */}
                    {journey.visits.length > 0 && (
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-neutral-700" />
                          Visit History ({journey.visits.length})
                        </h4>
                        <div className="space-y-2">
                          {journey.visits.slice(0, 5).map((visit, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white rounded p-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-neutral-600">{formatDate(visit.visited_at)}</span>
                                {visit.city && (
                                  <span className="text-neutral-500">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {visit.city}, {visit.country}
                                  </span>
                                )}
                              </div>
                              {visit.referrer && (
                                <span className="text-xs text-neutral-400 truncate max-w-xs">
                                  from: {visit.referrer}
                                </span>
                              )}
                            </div>
                          ))}
                          {journey.visits.length > 5 && (
                            <p className="text-xs text-neutral-500 text-center pt-2">
                              +{journey.visits.length - 5} more visits
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
