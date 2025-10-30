'use client'

import { useState, useMemo } from 'react'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations'
import { ArrowUpDown, Search } from 'lucide-react'

interface SavedScenariosProps {
  scenarios: any[]
  onLoadScenario: (scenario: any) => void
}

type SortField = 'scenario_name' | 'created_at' | 'new_sales' | 'sales_increase' | 'new_revenue' | 'revenue_increase' | 'new_cpa' | 'cpa_improvement_percent' | 'target_conversion_rate'
type SortDirection = 'asc' | 'desc'

export default function SavedScenarios({ scenarios, onLoadScenario }: SavedScenariosProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedScenarios = useMemo(() => {
    let filtered = scenarios

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(scenario =>
        scenario.scenario_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle dates
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [scenarios, searchQuery, sortField, sortDirection])

  if (scenarios.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your Saved Scenarios</h2>
        <p className="text-neutral-600">
          Click on any scenario name to reload it in the calculator
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search scenarios by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('scenario_name')}
                    className="flex items-center space-x-1 font-semibold text-neutral-700 hover:text-brand-primary"
                  >
                    <span>Scenario Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1 font-semibold text-neutral-700 hover:text-brand-primary"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('new_sales')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>Sales</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('sales_increase')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>Sales Increase</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('new_revenue')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>Revenue</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('revenue_increase')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>Revenue Increase</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('new_cpa')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>CPA</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('cpa_improvement_percent')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>CPA Improvement</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('target_conversion_rate')}
                    className="flex items-center justify-end space-x-1 font-semibold text-neutral-700 hover:text-brand-primary ml-auto"
                  >
                    <span>Target CR</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredAndSortedScenarios.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-neutral-500">
                    No scenarios found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredAndSortedScenarios.map((scenario) => (
                  <tr
                    key={scenario.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onLoadScenario(scenario)}
                        className="text-brand-primary hover:underline font-medium text-left"
                      >
                        {scenario.scenario_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {new Date(scenario.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      {formatNumber(scenario.new_sales)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-success-dark">
                      +{formatNumber(scenario.sales_increase)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      {formatCurrency(scenario.new_revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-success-dark">
                      +{formatCurrency(scenario.revenue_increase)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      {formatCurrency(scenario.new_cpa)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-success-dark">
                      {formatPercent(scenario.cpa_improvement_percent, 1)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                      {formatPercent(scenario.target_conversion_rate, 2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-neutral-600 text-center">
        Showing {filteredAndSortedScenarios.length} of {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
